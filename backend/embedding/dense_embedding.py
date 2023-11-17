# from logger_setup import logger
from os import environ
from transformers import pipeline

DENSE_MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"


class Toolbox:
    def __init__(self):
        self._lazy = environ.get("LAZY_INIT_MODELS", "False") == "True"
        self._dense_model = None

        if not self._lazy:
            self._initialize_pipeline()

    def _initialize_pipeline(self):
        # logger.info("Initializing dense embedding toolbox")
        print("Applying inference pipeline")
        self._dense_model = pipeline(
            "feature-extraction", model=DENSE_MODEL_ID, framework="pt", device=0
        )

    @property
    def dense_model(self):
        if self._lazy and self._dense_model is None:
            self._initialize_pipeline()
        return self._dense_model


toolbox = Toolbox()


def create_dense_embeddings(text_list) -> list:
    embeddings = toolbox.dense_model(text_list)
    # print(embeddings)
    return embeddings


def openai_create_dense_embeddings(text_list: list[str]) -> list:
    import openai

    openai.api_key = environ["OPENAI_API_KEY"]

    # Create dense embeddings
    response = openai.Embedding.create(input=text_list, model="text-embedding-ada-002")

    # Access the relevant embeddings in the structure
    data = response["data"]
    embeddings = [entry["embedding"] for entry in data]

    return list(embeddings)


if __name__ == "__main__":
    # result = create_dense_embeddings(["The answer to life is"])
    result = create_dense_embeddings(["The answer to life is", "another example is "])

    # print(f"The result: {result}")
    print(f"size 1: {len(result)}")
    print(f"size 2: {len(result[0])}")
    print(f"size: 7: {len(result[0][0])}")
    print(f"size: 384: {len(result[0][0][0])}")

    openai_result = openai_create_dense_embeddings(
        ["The answer to life is", "another example is "]
    )
    print(f"size 1: {len(result)}")
    print(f"size 2: {len(result[0])}")
    print(f"size: 7: {len(result[0][0])}")
    print(f"size: 384: {len(result[0][0][0])}")
