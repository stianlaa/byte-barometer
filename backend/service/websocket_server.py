from flask import request
from flask_setup import socketio, app
from action.query_index import Query, process_query


@socketio.on("query")
def handle_query(json: dict):
    # Parse query and add request session identifier
    query = Query(json["queryString"], json["queryCommentCount"])

    # Process query in background task as this may be long running
    socketio.start_background_task(
        target=process_query, query=query, socket_session_id=request.sid
    )


def serve():
    socketio.run(app, port=3000, allow_unsafe_werkzeug=True, host="0.0.0.0")
