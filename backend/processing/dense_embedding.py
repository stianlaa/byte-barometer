import os
from openai import Embedding, api_key

from dotenv import load_dotenv

load_dotenv("../.env")

dense_model_id = "text-embedding-ada-002"

api_key = os.environ["OPENAI_API_KEY"]


def create_dense_embeddings(chunk) -> list:
    # Create dense embeddings
    response = Embedding.create(input=chunk, model=dense_model_id)

    # Access the relevant embeddings in the structure
    data = response["data"]
    embeddings = [entry["embedding"] for entry in data]

    return list(embeddings)
