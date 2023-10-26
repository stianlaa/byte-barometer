from logger_setup import logger
from embedding.embedding_service import create_embeddings
from pinecone import init, GRPCIndex, list_indexes, delete_index, create_index
from os import environ

from service.pinecone_dto import QueryResponse
from util.document_util import Document
import json

index = environ["PINECONE_INDEX"]
write_to_file = environ.get("WRITE_TO_FILE", "False") == "True"
file_path = "upsert_data.jsonl"


class Toolbox:
    def __init__(self):
        self._index = None
        self._lazy = environ.get("LAZY_INIT_MODELS", "False") == "True"

        if not self._lazy:
            self._initialize_index()

    def _initialize_index(self):
        logger.info("Initializing semantic toolbox")
        init(
            api_key=environ["PINECONE_API_KEY"],
            environment=environ["PINECONE_ENVIRONMENT"],
        )
        self._index = GRPCIndex(index)

    @property
    def index(self):
        return self._index

    @property
    def index(self):
        if self._lazy and self._index is None:
            self._initialize_index()
        return self._index


toolbox = Toolbox()


def create_index_if_missing():
    toolbox.index  # Initialize index if not already done
    indices = list_indexes()
    if any(map(lambda i: i == index, indices)):
        logger.info(f"Index {index} already exists")
        return
    else:
        logger.info(f"Creating index: {index}")
        create_index(index, dimension=1536, metric="dotproduct", pod_type="s1")
        logger.info(f"Index created")


def delete_if_exists():
    toolbox.index  # Initialize index if not already done
    indices = list_indexes()
    if any(map(lambda i: i == index, indices)):
        logger.info(f"Deleting {index}")
        delete_index(index)
    else:
        logger.info(f"Index {index} doesn't exist")


def upsert_document_chunk(documents: list[Document]):
    upsert_chunk = list()
    if len(documents) == 0:
        logger.info("Skipping empty documents list")
        return

    text_list = [document.text for document in documents]

    dense, sparse = create_embeddings(text_list)
    for document, dense_embedding, sparse_embedding in zip(documents, dense, sparse):
        upsert_data = {
            "id": document.id,
            "values": dense_embedding,
            "sparse_values": sparse_embedding,
            "metadata": {
                "author": document.author,
                "storyUrl": ("" if document.story_url is None else document.story_url),
                "parentId": document.parent_id,
                "storyId": document.story_id,
                "createdAt": document.created_at,
                "textStart": document.text_start,
                "textEnd": document.text_end,
                "commentText": document.comment_text,
            },
        }
        upsert_chunk.append(upsert_data)
        with open(file_path, "a") as file:
            tidy = upsert_data
            tidy["values"] = []
            tidy["sparse_values"] = []
            file.write(json.dumps(tidy) + "\n")

    # Upsert or persist data
    if not write_to_file:
        toolbox.index.upsert(upsert_chunk)


def run_query(query_text: str, top_k: int, alpha: float) -> list[QueryResponse]:
    # Create hybrid scale to weight between embeddings
    dense, sparse = create_embeddings([query_text], alpha)[0]

    # Query vector database for entries near embeddings
    query_result = toolbox.index.query(
        vector=dense,
        sparse_vector=sparse,
        top_k=top_k,
        include_metadata=True,
    )

    # Map to QueryResponse objects
    result_objects: list[QueryResponse] = []
    for match in query_result["matches"]:
        id = match["id"]
        score = match["score"]
        metadata = match["metadata"]
        result_objects.append(QueryResponse(id, score, metadata))
    return result_objects
