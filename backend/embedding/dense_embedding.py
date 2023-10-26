from os import environ
import openai

DENSE_MODEL_ID = "text-embedding-ada-002"

openai.api_key = environ["OPENAI_API_KEY"]


def create_dense_embeddings(text_list: list[str]) -> list:
    # Create dense embeddings
    response = openai.Embedding.create(input=text_list, model=DENSE_MODEL_ID)

    # Access the relevant embeddings in the structure
    data = response["data"]
    embeddings = [entry["embedding"] for entry in data]

    return list(embeddings)
