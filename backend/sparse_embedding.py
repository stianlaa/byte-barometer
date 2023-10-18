import torch
from splade.models.transformer_rep import Splade
from transformers import AutoTokenizer
from dotenv import load_dotenv

dense_model_id = "text-embedding-ada-002"
sparse_model_id = "naver/splade-cocondenser-ensembledistil"

load_dotenv("../.env")


class Toolbox:
    def __init__(self):
        # Initialize and set up the Splade model
        print("Initializing Splade toolbox")
        self._sparse_model = Splade(sparse_model_id, agg='max')
        self._sparse_model.to('cpu')
        self._sparse_model.eval()

        # Initialize the tokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(sparse_model_id)

    @property
    def sparse_model(self):
        return self._sparse_model

    @property
    def tokenizer(self):
        return self._tokenizer


toolbox = Toolbox()


def create_sparse_embeddings(document_chunk):
    chunk_result = list([])
    for document_text in document_chunk:
        # Tokenize the document
        tokens = toolbox.tokenizer(document_text, return_tensors='pt')

        with torch.no_grad():
            # Create sparse embeddings
            sparse_embeddings = toolbox.sparse_model(
                d_kwargs=tokens.to('cpu')
            )['d_rep'].squeeze()

            # Map and gather sparse embeddings
            indices = sparse_embeddings.nonzero().squeeze().cpu().tolist()
            values = sparse_embeddings[indices].cpu().tolist()
            sparse = {'indices': indices, 'values': values}
            chunk_result.append(sparse)
    return chunk_result
