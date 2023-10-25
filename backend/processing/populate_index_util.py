from logger_setup import logger
from processing.document_fetcher_util import create_documents, get_comments, Comment
from processing.pinecone_util import (
    create_index_if_missing,
    upsert_document_chunk,
)
import os
import time
from datetime import datetime
from typing import List

CHUNK_SIZE = 100
STEP_SIZE = 3600

index = os.environ["PINECONE_INDEX"]


def step(current: float, to: float, step_size: float) -> float:
    if current + step_size > to:
        return to
    return current + step_size


def slice_into_chunks(arr: list, chunk_size: int) -> list:
    return [arr[i : i + chunk_size] for i in range(0, len(arr), chunk_size)]


def populate(last: int, document_limit: int):
    create_index_if_missing()

    # Fetch comments
    populate_from = time.time() - last
    populate_to = time.time()

    query_from = populate_from
    document_count = 0
    while populate_from < populate_to:
        query_to = step(query_from, populate_to, STEP_SIZE)

        logger.info(
            f'Step from {datetime.fromtimestamp(query_from).strftime("%B %d, %Y %I:%M:%S")}'
        )

        comments = get_comments(query_from, query_to)

        logger.info(f"Processing ${len(comments)} comments")

        # Slice into chunks
        comment_chunks: List[List[Comment]] = slice_into_chunks(comments, CHUNK_SIZE)
        for comment_chunk in comment_chunks:
            # Split into documents
            documents = create_documents(comment_chunk)

            # Update current document count
            document_count += len(documents)

            if document_count > document_limit:
                # We've reached the limit, slice off excess and store remainder
                document_batch = documents[0, (document_count - document_limit)]

                # Write last part of batch to file
                # upsert_document_chunk(document_batch)
                logger.info(f"Reached document limit: ${document_limit}")
                logger.info(
                    f"Upserting {len(document_batch)} documents, {document_count}"
                )
                return
            else:
                # Add entire batch of doucments, write to file
                logger.info(f"Upserting {len(documents)} documents, {document_count}")
                # upsert_document_chunk(documents)

        query_from = step(query_from, populate_to, STEP_SIZE)
