from logger_setup import logger
from torch import no_grad
from splade.models.transformer_rep import Splade
from transformers import AutoTokenizer
from os import environ

sparse_model_id = "naver/splade-cocondenser-ensembledistil"


class Toolbox:
    def __init__(self):
        self._tokenizer = None
        self._lazy = environ.get("LAZY_INIT_MODELS", "False") == "True"

        if not self._lazy:
            self._initialize_tokenizer()

    def _initialize_tokenizer(self):
        logger.info("Initializing Splade toolbox")
        self._lazy = environ.get("LAZY_INIT_MODELS", "False") == "True"
        self._sparse_model = Splade(sparse_model_id, agg="max")
        self._sparse_model.to("cpu")
        self._sparse_model.eval()

        # Initialize the tokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(sparse_model_id)

    @property
    def sparse_model(self):
        return self._sparse_model

    @property
    def tokenizer(self):
        return self._tokenizer

    @property
    def tokenizer(self):
        if self._lazy and self._tokenizer is None:
            self._initialize_tokenizer()
        return self._tokenizer


toolbox = Toolbox()


def create_sparse_embeddings(document_chunk) -> list:
    chunk_result = list([])
    for document_text in document_chunk:
        # Tokenize the document
        tokens = toolbox.tokenizer(document_text, return_tensors="pt")

        with no_grad():
            # Create sparse embeddings
            sparse_embeddings = toolbox.sparse_model(d_kwargs=tokens.to("cpu"))[
                "d_rep"
            ].squeeze()

            # Map and gather sparse embeddings
            indices = sparse_embeddings.nonzero().squeeze().cpu().tolist()
            values = sparse_embeddings[indices].cpu().tolist()
            sparse = {"indices": indices, "values": values}
            chunk_result.append(sparse)
    return chunk_result
