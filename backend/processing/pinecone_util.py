from processing.dataclasses import Document
from logger_setup import logger
from processing.sparse_embedding import create_sparse_embeddings
from processing.dense_embedding import create_dense_embeddings
from processing.sentiment import infer_sentiment
from pinecone import init, GRPCIndex, list_indexes, delete_index, create_index
from os import environ

CHUNK_SIZE = 100

index = environ["PINECONE_INDEX"]


class Toolbox:
    def __init__(self):
        self._index = None
        self._lazy = environ.get("LAZY_INIT_MODELS", "False") == "True"

        if not self._lazy:
            self._initialize_index()

    def _initialize_index(self):
        logger.info("Initializing semantic toolbox")
        init(
            api_key=environ["PINECONE_API_KEY"],
            environment=environ["PINECONE_ENVIRONMENT"],
        )
        self._index = GRPCIndex(index)

    @property
    def index(self):
        return self._index

    @property
    def index(self):
        if self._lazy and self._index is None:
            self._initialize_index()
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
        logger.info(f"Index {index} already exists")
        return
    else:
        logger.info(f"Creating index: {index} - This may take a while..")
        create_index(index, dimension=1536, metric="dotproduct", pod_type="s1")


def delete_if_exists():
    toolbox.index  # Initialize index if not already done
    indices = list_indexes()
    if any(map(lambda i: i == index, indices)):
        logger.info(f"Deleting {index}")
        delete_index(index)
    else:
        logger.info(f"Index {index} doesn't exist")


def upsert_document_chunk(documents: list[Document]):
    upsert_chunk = list()
    if len(documents) == 0:
        logger.info("Skipping empty documents list")
        return

    text_list = [document.text for document in documents]

    dense = create_dense_embeddings(text_list)
    sparse = create_sparse_embeddings(text_list)
    for document, dense_embedding, sparse_embedding in zip(documents, dense, sparse):
        upsert_data = {
            "id": document.id,
            "values": dense_embedding,
            "sparse_values": sparse_embedding,
            "metadata": {
                "context": document.text,
                "author": document.author,
                "storyUrl": ("" if document.story_url is None else document.story_url),
                "parentId": document.parent_id,
                "storyId": document.story_id,
                "createdAt": document.created_at,
            },
        }
        upsert_chunk.append(upsert_data)

    # Upsert data
    toolbox.index.upsert(upsert_chunk)


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
