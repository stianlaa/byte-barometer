import os
import pandas as pd
import openai
import torch
import pinecone
import time
from transformers import AutoTokenizer
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


toolbox = Toolbox()


def create_dense_embeddings(chunk):
    response = openai.Embedding.create(input=chunk, model=dense_model_id)
    embeddings = map(lambda entry: entry['embedding'], response['data'])
    return list(embeddings)


def create_sparse_embeddings(chunk):
    chunk_result = list([])
    for text in chunk:
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


def batch_create_embeddings(chunk):
    # Todo, process in parallel
    dense_embedding = create_dense_embeddings(chunk)
    sparse_embedding = create_sparse_embeddings(chunk)
    return dense_embedding, sparse_embedding


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


def create_index_if_missing():
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


def delete_if_exists():
    toolbox.index  # Initialize index if not already done
    indices = pinecone.list_indexes()
    if any(map(lambda i: i == pinecone_index, indices)):
        print(f'Deleting {pinecone_index}')
        pinecone.delete_index(pinecone_index)
    else:
        print(f'Index {pinecone_index} doesn\'t exist')


def populate():
    create_index_if_missing()
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
            dense_embeddings, sparse_embeddings = batch_create_embeddings(
                chunktext)

            for dense, sparse, text, id in zip(dense_embeddings, sparse_embeddings, chunktext, chunkids):
                upserts.append({
                    'id': id,
                    'values': dense,
                    'sparse_values': sparse,
                    'metadata': {
                        'context': text
                    }
                })

            # Upsert data
            chunk_end = time.time()
            toolbox.index.upsert(upserts)
            print(
                f'Upserted {len(upserts)} documents, {round(chunk_size/(chunk_end - chunk_start), 2)} documents/second')
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
    def __init__(self, id: str, score: float, context: str):
        self.id = id
        self.score = score
        self.context = context

    def to_dict(self):
        return {
            "id": self.id,
            "score": self.score,
            "context": self.context
        }


class MatchList:
    def __init__(self, matches: list[Match]):
        self.matches = matches

    def to_dict(self):
        return {
            "matches": [match.to_dict() for match in self.matches]
        }


def query(query_text: str, top_k: int, alpha: float) -> MatchList:
    dense_embeddings, sparse_embeddings = batch_create_embeddings([query_text])
    scaled_dense, scaled_sparse = hybrid_scale(
        dense_embeddings[0], sparse_embeddings[0], alpha)
    result = toolbox.index.query(vector=scaled_dense, sparse_vector=scaled_sparse,
                                 top_k=top_k, include_metadata=True)
    matches = result['matches']

    # Convert to Match objects
    result = []
    for match in matches:
        id = match['id']
        score = match['score']
        context = match['metadata']['context']
        result.append(Match(id, score, context))
    return MatchList(result)
