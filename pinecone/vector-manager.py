import os
import pandas as pd
import openai
import torch
import pinecone
import concurrent.futures
from argparse import ArgumentParser
from transformers import AutoTokenizer
from splade.models.transformer_rep import Splade
from dotenv import load_dotenv

path = 'documents.jsonl'
chunk_size = 100

dense_model_id = "text-embedding-ada-002"  # $0.0001 / 1K tokens
sparse_model_id = "naver/splade-cocondenser-ensembledistil"
log_sparse = False

load_dotenv(".env")
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

            if log_sparse:
                idx2token = {idx: token for token,
                             idx in toolbox.tokenizer.get_vocab().items()}

                # Then create the mappings like we did with the Pinecone-friendly sparse format above.
                sparse_dict_tokens = {
                    idx2token[idx]: round(weight, 2) for idx, weight in zip(indices, values)
                }

                # Sort so we can see most relevant tokens first
                sparse_dict_tokens = {
                    k: v for k, v in sorted(
                        sparse_dict_tokens.items(),
                        key=lambda item: item[1],
                        reverse=True
                    )
                }
                print(sparse_dict_tokens)
            chunk_result.append(sparse)
    return chunk_result


def batch_create_embeddings(chunk):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        dense_future = executor.submit(
            lambda c: create_dense_embeddings(c), chunk)
        sparse_future = executor.submit(
            lambda c: create_sparse_embeddings(c), chunk)

        dense_embedding = dense_future.result()
        sparse_embedding = sparse_future.result()

        return dense_embedding, sparse_embedding


def create_index_if_missing():
    toolbox.index
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


def delete_if_exists(args):
    indices = pinecone.list_indexes()
    if any(map(lambda i: i == pinecone_index, indices)):
        print(f'Deleting {pinecone_index}')
        pinecone.delete_index(pinecone_index)
    else:
        print(f'Index {pinecone_index} doesn\'t exist')


def populate(args):
    create_index_if_missing()
    # load comments.jsonl into a dataframe
    with open(f'{path}') as f:
        df = pd.read_json(f, lines=True)
        print(f'Embedding {df.shape[0]} documents')
        print(f'{df.head()}\n')

        # Grab chunks of chunk_size documents
        for i in range(0, df.shape[0], chunk_size):
            chunk = df.iloc[i:i+chunk_size]
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
            print(f'Upserting {len(upserts)} documents')
            toolbox.index.upsert(upserts)
        print(
            f'Index {pinecone_index}:\n{toolbox.index.describe_index_stats()}')


def query(args):
    subject = args.subject
    print(f'Querying: {subject}')
    dense, sparse = batch_create_embeddings(list(subject))
    print(toolbox.index.query(vector=dense[0], sparse_vector=sparse[0],
                              top_k=2, include_metadata=True))


options = {
    "populate": populate,
    "delete": delete_if_exists,
    "query": query
}


def main():
    parser = ArgumentParser(prog='vector-manager',
                            description='Manages vector database data')

    parser.add_argument("action",
                        choices=["populate", "delete", "query"],
                        help="action to execute"
                        )
    parser.add_argument('-s', '--subject', type=str)

    # TODO add topk param
    # TODO improve accuracy, suspect that the order is altered in between the embedding and the upsert
    # TODO add weight between sparse and dense query

    args = parser.parse_args()

    # get the function from options dictionary
    func = options.get(args.action)
    func(args)


if __name__ == '__main__':
    main()
