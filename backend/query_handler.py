from flask_setup import socketio
from pinecone_util import QueryResponse, run_query, run_sentiment_analysis

BATCH_SIZE = 1


class Query:
    def __init__(self, query_string: str, query_comment_count: str):
        self.query_string = query_string
        self.query_comment_count = query_comment_count


def batchify(elements, batch_size):
    # Convenient to split list into batches
    return [elements[i:i + batch_size] for i in range(0, len(elements), batch_size)]


def process_query(query: Query, socket_session_id: str):
    print("Running Query")

    # Query batch
    query_response_list = run_query(
        query.query_string, query.query_comment_count, 0.5)

    # Batch query responses
    print('batchify')
    batches: list[QueryResponse] = batchify(query_response_list, BATCH_SIZE)

    for batch in batches:
        # Apply sentiment analysis
        print('sentiment analysis')
        matches = run_sentiment_analysis(query.query_string, batch)

        # Emit the mapped results
        print('mapping and emitting')
        data = [match.to_dict() for match in matches]
        socketio.emit("queryresponse", {'data': data}, to=socket_session_id)

        # Yield control to send message immediately
        socketio.sleep(0)
