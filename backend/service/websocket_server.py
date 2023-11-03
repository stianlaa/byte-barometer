from flask import request
from flask_setup import socketio, app
from action.query_index import Query, process_query

COMMENT_COUNT_LIMIT = 100
MESSAGE_LENGTH_LIMIT = 150


@app.route("/available", methods=["GET"])
def is_available():
    return {}  # Status code 200 OK


@socketio.on("query")
def handle_query(json: dict):
    # Parse query and add request session identifier
    query = Query(json["queryString"], json["queryCommentCount"])

    if query.query_comment_count > COMMENT_COUNT_LIMIT:
        raise Exception("Invalid comment count")
    if len(query.query_string) > MESSAGE_LENGTH_LIMIT:
        raise Exception("Query string exceeded limit")

    # Process query in background task as this may be long running
    socketio.start_background_task(
        target=process_query, query=query, socket_session_id=request.sid
    )


def serve():
    socketio.run(app)
