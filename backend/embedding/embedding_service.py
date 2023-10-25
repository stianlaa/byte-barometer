from embedding.dense_embedding import create_dense_embeddings
from embedding.sparse_embedding import create_sparse_embeddings


CHUNK_SIZE = 100


def hybrid_scale(
    dense, sparse, alpha: float
) -> tuple[list[float], list[dict[str, dict]]]:
    # check alpha value is in range
    if alpha < 0 or alpha > 1:
        raise ValueError("Alpha must be between 0 and 1")
    # scale sparse and dense vectors to create hybrid search vecs
    hsparse = {
        "indices": sparse["indices"],
        "values": [v * (1 - alpha) for v in sparse["values"]],
    }
    hdense = [v * alpha for v in dense]
    return hdense, hsparse


def create_embeddings(text_list: list[str], alpha: float = None):
    dense = create_dense_embeddings(text_list)
    sparse = create_sparse_embeddings(text_list)

    if alpha is None:
        return (dense, sparse)
    else:
        return hybrid_scale(dense, sparse, alpha)
