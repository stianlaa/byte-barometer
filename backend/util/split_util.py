from logger_setup import logger
import re
import tiktoken

chunk_min_token_limit = 50
chunk_max_token_limit = 200

encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")

separators = [r"\.", r"\!", r"\?", r"\n"]


def token_split_text(text: str, prev_chunk_length: int) -> list:
    """
    Sentence split strategy:
    Goal: Take arbitrary text, and split it into chunks, each below N tokens.
    This is done by looking forward to the next potential text split, creating
    the candidate chunk, and checking if it is below N tokens.

    1. Take arbitrary string in, split it by the separators.
    2. From the start select first split element, count the token length of current chunk.
    3. If the token length is below N, add the next split element to the current chunk, and repeat step 3.
    """
    chunks = []
    split_text = re.split("|".join(separators), text)

    chunk_aggregate = ""
    for elem in split_text:
        candidate_chunk = chunk_aggregate + elem

        # Count the tokens in the candidate chunk
        encoded_candidate_text = encoding.encode(candidate_chunk)
        token_length = len(encoded_candidate_text)

        # Split, given that the chunk exceeds the limit and is shorter than the previous chunk
        if token_length > chunk_max_token_limit and token_length < prev_chunk_length:
            logger.info(f"Warning: Chunk too large: {candidate_chunk}")
            split_chunks = token_split_text(candidate_chunk, token_length)
            chunks.extend(split_chunks)
            chunk_aggregate = ""
        elif token_length > chunk_min_token_limit:
            chunks.append(candidate_chunk)
            chunk_aggregate = ""
        else:
            chunk_aggregate = candidate_chunk

    return chunks


def sentence_split_text(text: str) -> list[str]:
    """
    Sentence split strategy:
    Goal: Take arbitrary text, and split it into chunks, each below N tokens. This is done by looking forward to
    next potential text split, creating the candidate chunk and checking if it is below N tokens.
    """
    chunks = []
    split_text = re.split("|".join(separators), text)

    chunk_aggregate = ""
    for i in range(len(split_text)):
        candidate_chunk = chunk_aggregate + split_text[i]

        # Count the tokens in the candidate chunk
        encoded_candidate_text = encoding.encode(candidate_chunk)
        token_length = len(encoded_candidate_text)

        if token_length > chunk_max_token_limit:
            logger.info(f"Warning: Chunk too large: {candidate_chunk}")
            split_chunks = token_split_text(candidate_chunk, token_length)
            chunks.extend(split_chunks)
            chunk_aggregate = ""
        elif token_length > chunk_min_token_limit:
            # The candidate is sufficiently large, so we can add it to the chunks and reset the aggregate
            chunks.append(candidate_chunk)
            chunk_aggregate = ""
        else:
            # The candidate is still too small, so the aggregate is now the candidate
            chunk_aggregate = candidate_chunk

    return chunks
