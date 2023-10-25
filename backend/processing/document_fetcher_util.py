from bs4 import Comment
from backend.processing.dataclasses import Document
from logger_setup import logger
from typing import List

import requests
from html import unescape

from processing.split_util import sentence_split_text

ALGOLIA_API_URL = "http://hn.algolia.com/api/v1/"


def get_comments(from_time: int, to_time: int) -> List[Comment]:
    comments = []
    hits_per_page = 100
    page_limit = 100

    try:
        # Outer loop, fetch frontpage stories from newest to oldest
        for story_page in range(page_limit):
            story_response = requests.get(
                f"{ALGOLIA_API_URL}search_by_date?tags=story&page={story_page}&hitsPerPage={hits_per_page}&numericFilters=created_at_i>{from_time},created_at_i<{to_time}"
            )
            story_data = story_response.json()

            # Mid loop, iterate over comments from each story
            for story in story_data["hits"]:
                for comment_page in range(page_limit):
                    comment_response = requests.get(
                        f"{ALGOLIA_API_URL}search?tags=comment,story_{story['object_id']}&page={comment_page}&hitsPerPage={hits_per_page}"
                    )

                    comment_data = comment_response.json()

                    # Inner loops, process comments into persistable documents
                    for comment in comment_data["hits"]:
                        decoded_comment = unescape(comment["comment_text"])

                        print("comment string")

                        comments.append(
                            Comment(
                                id=comment["object_id"],
                                story_id=story["object_id"],
                                author=comment["author"],
                                story_url=comment["story_url"],
                                comment_text=decoded_comment,
                                created_at=comment["created_at"],
                                parent_id=comment["parent_id"],
                            )
                        )

                    if comment_page >= comment_data["nbPages"]:
                        break

            if story_page >= story_data["nbPages"]:
                break

    except Exception as e:
        logger.error(f"Error during request: {e}")

    return comments


def create_documents(comments: List[Comment]) -> List[Document]:
    documents: List[Document] = []

    for comment in comments:
        chunks = sentence_split_text(comment.comment_text)
        for chunk_index, chunk in enumerate(chunks):
            documents.append(
                Document(
                    f"{id}-{chunk_index}",
                    comment.story_id,
                    chunk.strip(),
                    comment.author,
                    comment.story_url,
                    comment.created_at,
                    comment.parent_id,
                )
            )

    return documents
