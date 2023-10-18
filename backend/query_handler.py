from random import randint
from flask_setup import socketio
from pinecone_util import run_query

BATCH_SIZE = 3


class Query:
    def __init__(self, query_string: str, query_comment_count: str):
        self.query_string = query_string
        self.query_comment_count = query_comment_count


def process_query(query: Query, socket_session_id: str):
    print("Running Query")

    remaining_comments: int = query.query_comment_count
    while remaining_comments > 0:
        # Define batch size to request
        batch_size = min(BATCH_SIZE, remaining_comments)

        # Query batch
        matches = run_query(query.query_string, batch_size, 0.5)

        # Emit the mapped results
        data = [match.to_dict() for match in matches]
        socketio.emit("queryresponse", {'data': data}, to=socket_session_id)

        # Yield control to send message immediately
        socketio.sleep(0)

        # Determine remaining comments to fetch
        remaining_comments -= batch_size
