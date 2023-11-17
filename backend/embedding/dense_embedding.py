# from logger_setup import logger
from os import environ
from sentence_transformers import SentenceTransformer
import torch

DENSE_MODEL_ID = "all-MiniLM-L6-v2"


class Toolbox:
    def __init__(self):
        self._lazy = environ.get("LAZY_INIT_MODELS", "False") == "True"
        self._sentence_transformer = None

        if not self._lazy:
            self._initialize_pipeline()

    def _initialize_pipeline(self):
        # logger.info("Initializing Dense embedding toolbox")
        self._sentence_transformer = SentenceTransformer(DENSE_MODEL_ID)

    @property
    def sentence_transformer(self):
        if self._lazy and self._sentence_transformer is None:
            self._initialize_pipeline()
        return self._sentence_transformer


toolbox = Toolbox()


def create_dense_embeddings(text_list) -> list:
    embeddings = toolbox.sentence_transformer.encode(text_list)
    return list(embeddings)


OPENAI_MODEL_ID = "text-embedding-ada-002"


def openai_create_dense_embeddings(text_list: list[str]) -> list:
    import openai

    openai.api_key = environ["OPENAI_API_KEY"]

    # Create dense embeddings
    response = openai.Embedding.create(input=text_list, model=OPENAI_MODEL_ID)

    # Access the relevant embeddings in the structure
    data = response["data"]
    embeddings = [entry["embedding"] for entry in data]

    return list(embeddings)


if __name__ == "__main__":
    # result = create_dense_embeddings(["The answer to life is"])
    hf_result = create_dense_embeddings(
        ["The answer to life is", "another example is "]
    )
    print(f"size 2: {len(hf_result)}")
    print(f"size 384: {len(hf_result[0])}")

    openai_result = openai_create_dense_embeddings(
        ["The answer to life is", "another example is "]
    )
    print(f"size 2: {len(openai_result)}")
    print(f"size 1536: {len(openai_result[0])}")
