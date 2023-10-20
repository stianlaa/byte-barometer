from app_setup import logger
from processing.sparse_embedding import create_sparse_embeddings
from processing.dense_embedding import create_dense_embeddings
from processing.sentiment import infer_sentiment
from pinecone import init, GRPCIndex, list_indexes, delete_index, create_index

import os
import time
import pandas as pd

path = "../document-fetcher/documents.jsonl"
chunk_size = 100

index = os.environ["PINECONE_INDEX"]


class Toolbox:
    def __init__(self):
        logger.info("Initializing semantic toolbox")
        init(
            api_key=os.environ["PINECONE_API_KEY"],
            environment=os.environ["PINECONE_ENVIRONMENT"],
        )
        self._index = GRPCIndex(index)

    @property
    def index(self):
        return self._index


toolbox = Toolbox()


def hybrid_scale(dense, sparse, alpha: float):
    # check alpha value is in range
    if alpha < 0 or alpha > 1:
        raise ValueError("Alpha must be between 0 and 1")
    # scale sparse and dense vectors to create hybrid search vecs
    hsparse = {
        "indices": sparse["indices"],
        "values": [v * (1 - alpha) for v in sparse["values"]],
    }
    hdense = [v * alpha for v in dense]
    return hdense, hsparse


def create_index_if_missing():
    toolbox.index  # Initialize index if not already done
    indices = list_indexes()
    if any(map(lambda i: i == index, indices)):
        print(f"Index {index} already exists")
        return
    else:
        print(f"Creating index: {index}")
        create_index(index, dimension=1536, metric="dotproduct", pod_type="s1")


def delete_if_exists():
    toolbox.index  # Initialize index if not already done
    indices = list_indexes()
    if any(map(lambda i: i == index, indices)):
        print(f"Deleting {index}")
        delete_index(index)
    else:
        print(f"Index {index} doesn't exist")


def populate():
    create_index_if_missing()
    # load comments.jsonl into a dataframe
    with open(f"{path}") as f:
        df = pd.read_json(f, lines=True)
        print(f"Embedding {df.shape[0]} documents")
        print(f"{df.head()}\n")

        # Grab chunks of chunk_size documents
        for i in range(0, df.shape[0], chunk_size):
            chunk = df.iloc[i : i + chunk_size]
            chunk_start = time.time()
            upserts = []

            id_list = chunk["id"].values.tolist()
            story_id_list = chunk["storyId"].values.tolist()
            text_list = chunk["text"].values.tolist()
            author_list = chunk["author"].values.tolist()
            story_url_list = chunk["storyUrl"].values.tolist()
            parent_id_list = chunk["parentId"].values.tolist()
            created_at_list = chunk["createdAt"].values.tolist()

            dense = create_dense_embeddings(text_list)
            sparse = create_sparse_embeddings(text_list)
            for (
                dense,
                sparse,
                id,
                storyId,
                text,
                author,
                story_url,
                parent_id,
                created_at,
            ) in zip(
                dense,
                sparse,
                id_list,
                story_id_list,
                text_list,
                author_list,
                story_url_list,
                parent_id_list,
                created_at_list,
            ):
                upsert_data = {
                    "id": id,
                    "values": dense,
                    "sparse_values": sparse,
                    "metadata": {
                        "context": text,
                        "author": author,
                        "storyUrl": "" if story_url is None else story_url,
                        "parentId": parent_id,
                        "storyId": storyId,
                        "createdAt": created_at,
                    },
                }

                upserts.append(upsert_data)

            # Upsert data
            chunk_end = time.time()
            toolbox.index.upsert(upserts)
            doc_rate = chunk_size / (chunk_end - chunk_start)
            print(f"{i}/{len(upserts)}-{doc_rate:.2f} docs/sec")

        print(f"Index {index}:\n{toolbox.index.describe_index_stats()}")


class Metadata:
    def __init__(self, context: str):
        self.context = context

    def to_dict(self):
        return {"context": self.context}


class QueryResponse:
    def __init__(self, id: str, score: float, metadata: dict):
        self.id = id
        self.score = score
        self.metadata = metadata

    def to_dict(self):
        return {
            "id": self.id,
            "score": self.score,
            "metadata": self.metadata,
        }


class Match:
    def __init__(self, query_response: QueryResponse, sentiment: dict):
        self.id = query_response.id
        self.score = query_response.score
        self.metadata = query_response.metadata
        self.sentiment = sentiment

    def to_dict(self):
        return {
            "id": self.id,
            "score": self.score,
            "sentiment": self.sentiment,
            "metadata": self.metadata,
        }


def run_query(query_text: str, top_k: int, alpha: float) -> list[QueryResponse]:
    # Create embeddings to be able to search vector database
    dense = create_dense_embeddings([query_text])[0]
    sparse = create_sparse_embeddings([query_text])[0]

    # Create hybrid scale to weight between embeddings
    scaled_dense, scaled_sparse = hybrid_scale(dense, sparse, alpha)

    # Query vector database for entries near embeddings
    query_result = toolbox.index.query(
        vector=scaled_dense,
        sparse_vector=scaled_sparse,
        top_k=top_k,
        include_metadata=True,
    )

    # Map to QueryResponse objects
    result_objects: list[QueryResponse] = []
    for match in query_result["matches"]:
        id = match["id"]
        score = match["score"]
        metadata = match["metadata"]
        result_objects.append(QueryResponse(id, score, metadata))
    return result_objects


def run_sentiment_analysis(
    query_string: str, query_response_list: list[QueryResponse]
) -> list[Match]:
    comment_texts = list(
        map(lambda response: response.metadata["context"], query_response_list)
    )

    # Perform aspect based sentiment analysis on batch, with query_text as aspect
    sentiments = infer_sentiment(comment_texts, query_string)

    # Convert to Match objects
    result_objects: list[Match] = []
    for query_response, sentiment in zip(query_response_list, sentiments):
        result_objects.append(Match(query_response, sentiment))
    return result_objects
