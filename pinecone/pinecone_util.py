from sparse_embedding import create_sparse_embeddings
from sentiment import infer_sentiment
from dense_embedding import create_dense_embeddings
import asyncio
import time
import pinecone
import pandas as pd
import os
from dotenv import load_dotenv
load_dotenv("../.env")

path = 'documents.jsonl'
chunk_size = 100

pinecone_index = os.environ['PINECONE_INDEX']


class Toolbox:
    _index = None

    @property
    def index(self):
        if self._index is None:
            pinecone.init(
                api_key=os.environ['PINECONE_API_KEY'],
                environment=os.environ['PINECONE_ENVIRONMENT']
            )
            self._index = pinecone.GRPCIndex(pinecone_index)
        return self._index


toolbox = Toolbox()


def hybrid_scale(dense, sparse, alpha: float):
    # check alpha value is in range
    if alpha < 0 or alpha > 1:
        raise ValueError("Alpha must be between 0 and 1")
    # scale sparse and dense vectors to create hybrid search vecs
    hsparse = {
        'indices': sparse['indices'],
        'values':  [v * (1 - alpha) for v in sparse['values']]
    }
    hdense = [v * alpha for v in dense]
    return hdense, hsparse


async def create_index_if_missing():
    toolbox.index  # Initialize index if not already done
    indices = pinecone.list_indexes()
    if any(map(lambda i: i == pinecone_index, indices)):
        print(f'Index {pinecone_index} already exists')
        return
    else:
        print(f'Creating index: {pinecone_index}')
        pinecone.create_index(
            pinecone_index,
            dimension=1536,
            metric="dotproduct",
            pod_type="s1"
        )


async def delete_if_exists():
    toolbox.index  # Initialize index if not already done
    indices = pinecone.list_indexes()
    if any(map(lambda i: i == pinecone_index, indices)):
        print(f'Deleting {pinecone_index}')
        pinecone.delete_index(pinecone_index)
    else:
        print(f'Index {pinecone_index} doesn\'t exist')


async def populate():
    await create_index_if_missing()
    # load comments.jsonl into a dataframe
    with open(f'{path}') as f:
        df = pd.read_json(f, lines=True)
        print(f'Embedding {df.shape[0]} documents')
        print(f'{df.head()}\n')

        # Grab chunks of chunk_size documents
        for i in range(0, df.shape[0], chunk_size):
            chunk = df.iloc[i:i+chunk_size]
            chunk_start = time.time()
            upserts = []

            idList = chunk["id"].values.tolist()
            storyIdList = chunk["storyId"].values.tolist()
            textList = chunk["text"].values.tolist()
            authorList = chunk["author"].values.tolist()
            storyUrlList = chunk["storyUrl"].values.tolist()
            parentIdList = chunk["parentId"].values.tolist()
            createdAtList = chunk["createdAt"].values.tolist()
            coroutines = [
                create_dense_embeddings(textList),
                create_sparse_embeddings(textList),
            ]

            try:
                results = await asyncio.gather(*coroutines)
                # All coroutines have been executed successfully
                for dense, sparse, id, storyId, text, author, storyUrl, parentId, createdAt in zip(results[0], results[1], idList, storyIdList, textList, authorList, storyUrlList, parentIdList, createdAtList):
                    temp = {
                        'id': id,
                        'values': dense,
                        'sparse_values': sparse,
                        'metadata': {
                            'context': text,
                            'author': author,
                            'storyUrl': '' if storyUrl is None else storyUrl,
                            'parentId': parentId,
                            'storyId': storyId,
                            'createdAt': createdAt,
                        }
                    }
                    upserts.append(temp)

                # Upsert data
                chunk_end = time.time()
                toolbox.index.upsert(upserts)
                print(
                    f'Upserted {len(upserts)} documents, {round(chunk_size/(chunk_end - chunk_start), 2)} documents/second')
            except Exception as error:
                # An error occurred in one of the coroutines
                print(error)

        print(
            f'Index {pinecone_index}:\n{toolbox.index.describe_index_stats()}')


class Metadata:
    def __init__(self, context: str):
        self.context = context

    def to_dict(self):
        return {
            "context": self.context
        }


class Match:
    def __init__(self, id: str, score: float, metadata: dict, sentiment: dict):
        self.id = id
        self.score = score
        self.metadata = metadata
        self.sentiment = sentiment

    def to_dict(self):
        return {
            "id": self.id,
            "score": self.score,
            "sentiment": self.sentiment,
            "metadata": self.metadata,
        }


async def query(query_text: str, top_k: int, alpha: float) -> list[Match]:
    coroutines = [
        create_dense_embeddings([query_text]),
        create_sparse_embeddings([query_text])
    ]

    try:
        embedding_lists = await asyncio.gather(*coroutines)
        # Since the functions are made for batch
        dense, sparse = embedding_lists[0][0], embedding_lists[1][0]

        scaled_dense, scaled_sparse = hybrid_scale(dense, sparse, alpha)
        query_result = toolbox.index.query(vector=scaled_dense, sparse_vector=scaled_sparse,
                                           top_k=top_k, include_metadata=True)

        # Improvable?
        matches = query_result['matches']
        comment_texts = list(
            map(lambda match: match['metadata']['context'], matches))
        sentiments = infer_sentiment(comment_texts, query_text)

        # Convert to Match objects
        result_objects: list[Match] = []
        for match, sentiment in zip(matches, sentiments):
            id = match['id']
            score = match['score']
            metadata = match['metadata']
            result_objects.append(Match(id, score, metadata, sentiment))
        return result_objects
    except Exception as error:
        # An error occurred in one of the coroutines
        print(error)
