import os
import pandas as pd
import openai
from dotenv import load_dotenv
import torch
from transformers import AutoTokenizer
from splade.models.transformer_rep import Splade
import pinecone


path = 'documents.jsonl'
chunk_size = 100

dense_model_id = "text-embedding-ada-002"  # $0.0001 / 1K tokens
sparse_model_id = "naver/splade-cocondenser-ensembledistil"
device = 'cpu'  # Would be ideal to use GPU
log_sparse = False


load_dotenv(".env")

# Expected environment
pinecone_index = os.environ['PINECONE_INDEX']

# OpenAI
# TODO Should be unneccessary, since we've got the environment variable set
openai.api_key = os.environ['OPENAI_API_KEY']

# Splade
sparse_model = Splade(sparse_model_id, agg='max')
sparse_model.eval()

# Pinecone
pinecone.init(
    api_key=os.environ['PINECONE_API_KEY'],
    environment=os.environ['PINECONE_ENVIRONMENT']
)


def create_dense_embeddings(text):
    # Create embeddings
    response = openai.Embedding.create(input=text, model=dense_model_id)
    return response['data'][0]['embedding']


def create_sparse_embeddings(text):
    tokenizer = AutoTokenizer.from_pretrained(sparse_model_id)
    tokens = tokenizer(text, return_tensors='pt')

    with torch.no_grad():
        sparse_embeddings = sparse_model(
            d_kwargs=tokens.to(device)
        )['d_rep'].squeeze()

        indices = sparse_embeddings.nonzero().squeeze().cpu().tolist()
        values = sparse_embeddings[indices].cpu().tolist()
        sparse = {'indices': indices, 'values': values}

        if log_sparse:
            idx2token = {idx: token for token,
                         idx in tokenizer.get_vocab().items()}

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

        return sparse


def create_index_if_missing():
    index_name = os.environ['PINECONE_INDEX']
    indices = pinecone.list_indexes()
    if any(map(lambda i: i == index_name, indices)):
        print(f'Index {index_name} already exists')
        return
    else:
        print(f'Creating index: {index_name}')
        pinecone.create_index(
            index_name,
            dimension=1536,
            metric="dotproduct",
            pod_type="s1"
        )


def main():
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

            # For each chunk, embed the text
            for _, row in chunk.iterrows():
                id = row['id']
                text = row['text']

                # TODO Do in parallel
                dense_embedding = create_dense_embeddings(text)
                sparse_embedding = create_sparse_embeddings(text)

                # Append all to upserts list
                upserts.append({
                    'id': id,
                    'values': dense_embedding,
                    'sparse_values': sparse_embedding,
                })

            # Upsert data
            print(f'Upserting {len(upserts)} documents')
            index = pinecone.GRPCIndex(pinecone_index)
            index.upsert(upserts)
        print(f'Index {pinecone_index}:\n{index.describe_index_stats()}')


if __name__ == '__main__':
    main()
