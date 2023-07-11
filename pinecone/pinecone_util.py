import os
import pandas as pd
import openai
import torch
import pinecone
import time
import asyncio
from transformers import AutoTokenizer, pipeline
from splade.models.transformer_rep import Splade
from dotenv import load_dotenv

path = 'documents.jsonl'
chunk_size = 100

dense_model_id = "text-embedding-ada-002"
sparse_model_id = "naver/splade-cocondenser-ensembledistil"
log_sparse = False

load_dotenv("../.env")
openai.api_key = os.environ['OPENAI_API_KEY']
pinecone_index = os.environ['PINECONE_INDEX']


class Toolbox:
    # Practical way to lazily initialize various models
    _sparse_model = None
    _tokenizer = None
    _index = None
    _sentiment_pipeline = None

    @property
    def sparse_model(self):
        if self._sparse_model is None:
            self._sparse_model = Splade(sparse_model_id, agg='max')
            # Would be preferable to use GPU
            self._sparse_model.to('cpu')
            self._sparse_model.eval()
        return self._sparse_model

    @property
    def tokenizer(self):
        if self._tokenizer is None:
            self._tokenizer = AutoTokenizer.from_pretrained(sparse_model_id)
        return self._tokenizer

    @property
    def index(self):
        if self._index is None:
            pinecone.init(
                api_key=os.environ['PINECONE_API_KEY'],
                environment=os.environ['PINECONE_ENVIRONMENT']
            )
            self._index = pinecone.GRPCIndex(pinecone_index)
        return self._index

    @property
    def sentiment_pipeline(self):
        if self._sentiment_pipeline is None:

            self._sentiment_pipeline = pipeline("sentiment-analysis")
        return self._sentiment_pipeline


toolbox = Toolbox()


async def create_dense_embeddings(chunk):
    response = openai.Embedding.create(input=chunk, model=dense_model_id)
    embeddings = map(lambda entry: entry['embedding'], response['data'])
    return list(embeddings)


async def create_sparse_embeddings(chunktext):
    chunk_result = list([])
    for text in chunktext:
        tokens = toolbox.tokenizer(text, return_tensors='pt')
        with torch.no_grad():
            sparse_embeddings = toolbox.sparse_model(
                d_kwargs=tokens.to('cpu')
            )['d_rep'].squeeze()

            indices = sparse_embeddings.nonzero().squeeze().cpu().tolist()
            values = sparse_embeddings[indices].cpu().tolist()
            sparse = {'indices': indices, 'values': values}
            chunk_result.append(sparse)
    return chunk_result


async def infer_sentiment(chunktext):
    return toolbox.sentiment_pipeline(chunktext)


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

            chunktext = chunk["text"].values.tolist()
            chunkids = chunk["id"].values.tolist()
            coroutines = [
                create_dense_embeddings(chunktext),
                create_sparse_embeddings(chunktext),
                infer_sentiment(chunktext)
            ]

            try:
                results = await asyncio.gather(*coroutines)
                # All coroutines have been executed successfully
                for dense, sparse, sentiment, text, id in zip(results[0], results[1], results[2], chunktext, chunkids):
                    upserts.append({
                        'id': id,
                        'values': dense,
                        'sparse_values': sparse,
                        'metadata': {
                            'context': text,
                            'sentiment': sentiment['score'] if sentiment['label'] == 'POSITIVE' else -sentiment['score'],
                        }
                    })

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
    def __init__(self, id: str, score: float, context: str, sentiment: float):
        self.id = id
        self.score = score
        self.context = context
        self.sentiment = sentiment

    def to_dict(self):
        return {
            "id": self.id,
            "score": self.score,
            "context": self.context,
            "sentiment": self.sentiment,
        }


class MatchList:
    def __init__(self, matches: list[Match]):
        self.matches = matches

    def to_dict(self):
        return {
            "matches": [match.to_dict() for match in self.matches]
        }


async def query(query_text: str, top_k: int, alpha: float) -> MatchList:
    coroutines = [
        create_dense_embeddings([query_text]),
        create_sparse_embeddings([query_text])
    ]

    try:
        embedding_lists = await asyncio.gather(*coroutines)
        dense, sparse = embedding_lists[0][0], embedding_lists[1][0]
        # Since the functions are made for batch

        scaled_dense, scaled_sparse = hybrid_scale(dense, sparse, alpha)
        query_result = toolbox.index.query(vector=scaled_dense, sparse_vector=scaled_sparse,
                                           top_k=top_k, include_metadata=True)
        # Convert to Match objects
        result_objects = []
        for match in query_result['matches']:
            id = match['id']
            score = match['score']
            metadata = match['metadata']
            context = metadata['context']
            sentiment = metadata['sentiment']
            result_objects.append(Match(id, score, context, sentiment))
        return MatchList(result_objects)
    except Exception as error:
        # An error occurred in one of the coroutines
        print(error)
