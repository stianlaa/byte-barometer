from processing.split_util import sentence_split_text
from logger_setup import logger
from processing.dataclasses import Comment, Document
from processing.hackernews_client import get_comments
from processing.pinecone_util import upsert_document_chunk
from datetime import datetime
from typing import List
import time

CHUNK_SIZE = 100
STEP_SIZE = 3600


def step(current: int, to: int, step_size: int) -> int:
    if current + step_size > to:
        return to
    return current + step_size


def slice_into_chunks(arr: list, chunk_size: int) -> list:
    return [arr[i : i + chunk_size] for i in range(0, len(arr), chunk_size)]


def create_documents(comments: List[Comment]) -> List[Document]:
    documents: List[Document] = []

    for comment in comments:
        chunks = sentence_split_text(comment.comment_text)
        for chunk_index, chunk in enumerate(chunks):
            documents.append(
                Document(
                    id=f"{comment.id}-{chunk_index}",
                    story_id=comment.story_id,
                    text=chunk.strip(),
                    author=comment.author,
                    story_url=comment.story_url,
                    created_at=comment.created_at,
                    parent_id=comment.parent_id,
                )
            )

    return documents


def populate(last: int, document_limit: int):
    # Define outer bounds of data to populate using
    populate_from = time.time() - last
    populate_to = time.time()

    # Fetch comments
    query_from = populate_from
    document_count = 0
    while query_from < populate_to:
        chunk_start = time.time()
        query_to = step(query_from, populate_to, STEP_SIZE)

        logger.info(
            f'Fetching from {datetime.fromtimestamp(query_from).strftime("%B %d, %Y %I:%M:%S")} to {datetime.fromtimestamp(query_to).strftime("%B %d, %Y %I:%M:%S")}'
        )

        comments = get_comments(query_from, query_to)

        logger.info(f"Processing {len(comments)} comments")

        # Slice into chunks
        comment_chunks: List[List[Comment]] = slice_into_chunks(comments, CHUNK_SIZE)
        for comment_chunk in comment_chunks:
            # Split into documents
            documents = create_documents(comment_chunk)

            # Update current document count
            document_count += len(documents)

            if document_count >= document_limit:
                # We've reached the limit, slice off excess and store remainder
                document_batch = documents[0 : (document_count - document_limit)]

                # Write last part of batch to file
                logger.info(f"Processing {len(document_batch)} documents")
                upsert_document_chunk(document_batch)
                break
            else:
                # Add entire batch of doucments, write to file
                logger.info(f"Processing {len(documents)} documents")
                upsert_document_chunk(documents)

        # Check if we have reached the document limit
        if document_count >= document_limit:
            logger.info(f"Document limit {document_limit} reached")
            break
        else:
            # Report progress and speed
            chunk_end = time.time()
            doc_rate = len(comments) / (chunk_end - chunk_start)
            logger.info(
                f"Processed and stored {len(comments)} comments at {doc_rate:.2f} comments/second"
            )
            # Update query window
            query_from = step(query_from, populate_to, STEP_SIZE)
