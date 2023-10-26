from logger_setup import logger
from service.hackernews_dto import Comment
from html import unescape
import requests
import time

ALGOLIA_API_URL = "http://hn.algolia.com/api/v1/"
PAGE_LIMIT = 100
HITS_PER_PAGE = 200
MAX_RETRIES = 3
DELAY_BETWEEN_RETRIES = 5  # in seconds


def get_comments(from_time: int, to_time: int) -> list[Comment]:
    comments = []
    for comment_page in range(PAGE_LIMIT):
        comment_response = None
        for attempt in range(MAX_RETRIES):
            try:
                comment_response = requests.get(
                    f"{ALGOLIA_API_URL}search_by_date?tags=comment&page={comment_page}&hitsPerPage={HITS_PER_PAGE}&numericFilters=created_at_i>{from_time},created_at_i<{to_time}"
                )
                comment_response.raise_for_status()  # Raises an exception for HTTP errors
                break
            except requests.RequestException as e:
                if attempt < MAX_RETRIES - 1:  # i.e. if not the last attempt
                    print(f"Error: {e}. Retrying in {DELAY_BETWEEN_RETRIES} seconds...")
                    time.sleep(DELAY_BETWEEN_RETRIES)
                    continue
                else:
                    raise  # re-raise the last exception if all retries failed

        if comment_response is None:
            logger.error(f"Comment fetching failed after {MAX_RETRIES} retries")
        comment_data = comment_response.json()

        if comment_page >= comment_data["nbPages"]:
            break

        # Inner loops, process comments into persistable documents
        for comment in comment_data["hits"]:
            decoded_comment = unescape(comment["comment_text"])

            comments.append(
                Comment(
                    id=comment["objectID"],
                    story_id=comment["story_id"],
                    author=comment["author"],
                    story_url=(comment["story_url"] if "story_url" in comment else ""),
                    comment_text=decoded_comment,
                    created_at=comment["created_at"],
                    parent_id=comment["parent_id"],
                )
            )
    return comments
