from os import environ
import openai
from dotenv import load_dotenv

load_dotenv("../.env")

dense_model_id = "text-embedding-ada-002"

openai.api_key = environ["OPENAI_API_KEY"]


def create_dense_embeddings(chunk) -> list:
    # Create dense embeddings
    response = openai.Embedding.create(input=chunk, model=dense_model_id)

    # Access the relevant embeddings in the structure
    data = response["data"]
    embeddings = [entry["embedding"] for entry in data]

    return list(embeddings)
