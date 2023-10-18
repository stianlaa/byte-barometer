from sparse_embedding import create_sparse_embeddings
from sentiment import infer_sentiment
from dense_embedding import create_dense_embeddings
from pinecone import init, GRPCIndex
import os
import time
from dotenv import load_dotenv
load_dotenv("../.env")

path = 'documents.jsonl'
chunk_size = 100

pinecone_index = os.environ['PINECONE_INDEX']


class Toolbox:
    def __init__(self):
        print("Initializing semantic toolbox")
        init(
            api_key=os.environ['PINECONE_API_KEY'],
            environment=os.environ['PINECONE_ENVIRONMENT']
        )
        self._index = GRPCIndex(pinecone_index)

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
        'indices': sparse['indices'],
        'values':  [v * (1 - alpha) for v in sparse['values']]
    }
    hdense = [v * alpha for v in dense]
    return hdense, hsparse


# async def create_index_if_missing():
#     toolbox.index  # Initialize index if not already done
#     indices = list_indexes()
#     if any(map(lambda i: i == pinecone_index, indices)):
#         print(f'Index {pinecone_index} already exists')
#         return
#     else:
#         print(f'Creating index: {pinecone_index}')
#         create_index(
#             pinecone_index,
#             dimension=1536,
#             metric="dotproduct",
#             pod_type="s1"
#         )


# async def delete_if_exists():
#     toolbox.index  # Initialize index if not already done
#     indices = list_indexes()
#     if any(map(lambda i: i == pinecone_index, indices)):
#         print(f'Deleting {pinecone_index}')
#         delete_index(pinecone_index)
#     else:
#         print(f'Index {pinecone_index} doesn\'t exist')


# async def populate():
#     await create_index_if_missing()
#     # load comments.jsonl into a dataframe
#     with open(f'{path}') as f:
#         df = pd.read_json(f, lines=True)
#         print(f'Embedding {df.shape[0]} documents')
#         print(f'{df.head()}\n')

#         # Grab chunks of chunk_size documents
#         for i in range(0, df.shape[0], chunk_size):
#             chunk = df.iloc[i:i+chunk_size]
#             chunk_start = time.time()
#             upserts = []

#             idList = chunk["id"].values.tolist()
#             storyIdList = chunk["storyId"].values.tolist()
#             textList = chunk["text"].values.tolist()
#             authorList = chunk["author"].values.tolist()
#             storyUrlList = chunk["storyUrl"].values.tolist()
#             parentIdList = chunk["parentId"].values.tolist()
#             createdAtList = chunk["createdAt"].values.tolist()
#             coroutines = [
#                 create_dense_embeddings(textList),
#                 create_sparse_embeddings(textList),
#             ]

#             try:
#                 results = await asyncio.gather(*coroutines)
#                 # All coroutines have been executed successfully
#                 for dense, sparse, id, storyId, text, author, storyUrl, parentId, createdAt in zip(results[0], results[1], idList, storyIdList, textList, authorList, storyUrlList, parentIdList, createdAtList):
#                     temp = {
#                         'id': id,
#                         'values': dense,
#                         'sparse_values': sparse,
#                         'metadata': {
#                             'context': text,
#                             'author': author,
#                             'storyUrl': '' if storyUrl is None else storyUrl,
#                             'parentId': parentId,
#                             'storyId': storyId,
#                             'createdAt': createdAt,
#                         }
#                     }
#                     upserts.append(temp)

#                 # Upsert data
#                 chunk_end = time.time()
#                 toolbox.index.upsert(upserts)
#                 print(
#                     f'Upserted {len(upserts)} documents, {round(chunk_size/(chunk_end - chunk_start), 2)} documents/second')
#             except Exception as error:
#                 # An error occurred in one of the coroutines
#                 print(error)

#         print(
#             f'Index {pinecone_index}:\n{toolbox.index.describe_index_stats()}')


class Metadata:
    def __init__(self, context: str):
        self.context = context

    def to_dict(self):
        return {
            "context": self.context
        }


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
    print('Dense')
    dense = create_dense_embeddings([query_text])[0]
    print('Sparse')
    sparse = create_sparse_embeddings([query_text])[0]

    # Create hybrid scale to weight between embeddings
    print('Scale')
    scaled_dense, scaled_sparse = hybrid_scale(dense, sparse, alpha)

    # Query vector database for entries near embeddings
    print('Query')
    query_result = toolbox.index.query(vector=scaled_dense, sparse_vector=scaled_sparse,
                                       top_k=top_k, include_metadata=True)

    # Map to QueryResponse objects
    result_objects: list[QueryResponse] = []
    for match in query_result['matches']:
        id = match['id']
        score = match['score']
        metadata = match['metadata']
        result_objects.append(QueryResponse(id, score, metadata))
    return result_objects


def run_sentiment_analysis(query_string: str, query_response_list: list[QueryResponse]) -> list[Match]:
    comment_texts = list(
        map(lambda response: response.metadata["context"], query_response_list))

    # Perform aspect based sentiment analysis on batch, with query_text as aspect
    start = time.time()
    sentiments = infer_sentiment(comment_texts, query_string)
    end = time.time()
    print(f'Inference time {end - start:.2f}')

    # Convert to Match objects
    result_objects: list[Match] = []
    for query_response, sentiment in zip(query_response_list, sentiments):
        result_objects.append(Match(query_response, sentiment))
    return result_objects
