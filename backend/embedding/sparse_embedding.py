from logger_setup import logger
from torch import no_grad, cuda
from splade.models.transformer_rep import Splade
from transformers import AutoTokenizer
from os import environ

SPARSE_MODEL_ID = "naver/splade-cocondenser-ensembledistil"


class Toolbox:
    def __init__(self):
        self._tokenizer = None
        self._lazy = environ.get("LAZY_INIT_MODELS", "False") == "True"

        if not self._lazy:
            self._initialize_tokenizer()

    def _initialize_tokenizer(self):
        self._lazy = environ.get("LAZY_INIT_MODELS", "False") == "True"
        self._sparse_model = Splade(SPARSE_MODEL_ID, agg="max")

        if environ.get("ENABLE_GPU", "False") == "True":
            logger.info("Initializing Splade toolbox with GPU")
            self._sparse_model.to(0)
        else:
            logger.info("Initializing Splade toolbox with CPU")
            logger.info("Initializing Dense embedding toolbox with CPU")
            self._sparse_model.to("cpu")

        # Eval now? Shouldn't be neccessary I think?
        self._sparse_model.eval()

        # Initialize the tokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(SPARSE_MODEL_ID)

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
            device = 0 if environ.get("ENABLE_GPU", "False") == "True" else "cpu"

            # Create sparse embeddings
            sparse_embeddings = toolbox.sparse_model(d_kwargs=tokens.to(device))[
                "d_rep"
            ].squeeze()

            # Map and gather sparse embeddings
            indices = sparse_embeddings.nonzero().squeeze().cpu().tolist()
            values = sparse_embeddings[indices].cpu().tolist()
            sparse = {"indices": indices, "values": values}
            chunk_result.append(sparse)

    return chunk_result
