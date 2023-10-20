from flask_setup import socketio
from processing.pinecone_util import QueryResponse, run_query, run_sentiment_analysis
from time import time


BATCH_SIZE = 2
# Minimal delay time between each batch, this is to give a consistent feeling of the streaming
MIN_BATCH_DELAY_S = 0.1


class Query:
    def __init__(self, query_string: str, query_comment_count: str):
        self.query_string = query_string
        self.query_comment_count = query_comment_count


def batchify(elements, batch_size):
    # Convenient to split list into batches
    return [elements[i : i + batch_size] for i in range(0, len(elements), batch_size)]


def process_query(query: Query, socket_session_id: str):
    # Query batch
    query_response_list = run_query(query.query_string, query.query_comment_count, 0.5)

    # Batch query responses
    batches: list[QueryResponse] = batchify(query_response_list, BATCH_SIZE)

    prev_batch = time()
    for batch in batches:
        # Apply sentiment analysis
        matches = run_sentiment_analysis(query.query_string, batch)

        # Emit the mapped results
        data = [match.to_dict() for match in matches]
        socketio.emit("queryresponse", {"data": data}, to=socket_session_id)

        # Yield control to send message immediately
        passed_seconds = time() - prev_batch
        wait_seconds = min(passed_seconds, MIN_BATCH_DELAY_S)

        print(f"Waiting {wait_seconds}")
        socketio.sleep(wait_seconds)
