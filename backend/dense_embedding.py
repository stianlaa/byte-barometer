import os
import openai
from dotenv import load_dotenv

dense_model_id = "text-embedding-ada-002"

load_dotenv("../.env")

openai.api_key = os.environ['OPENAI_API_KEY']


async def create_dense_embeddings(chunk):
    # Create dense embeddings
    response = openai.Embedding.create(input=chunk, model=dense_model_id)

    # Extract embeddings from response
    embeddings = map(lambda entry: entry['embedding'], response['data'])
    return list(embeddings)
