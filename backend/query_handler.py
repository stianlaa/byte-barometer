import random
from flask_setup import socketio


class Query:
    def __init__(self, query_string: str, query_comment_count: str):
        self.query_string = query_string
        self.query_comment_count = query_comment_count


def create_comment(query, label):
    comment = {
        'data': [
            {
                'id': f'unique-id-${str(random.randint(0, 50000))}',
                'metadata': {
                    'author': query,
                    'storyId': "string;",
                    'context': "string;",
                    'parentId': "string;",
                    'storyUrl': "string;",
                    'createdAt': "string;",
                },
                'sentiment': {
                    'label': label,
                    'score': 0,
                }
            }
        ]
    }
    return comment


def process_query(query: Query, socket_session_id: str):
    # Fetch and process X queries
    comment = create_comment(query.query_string, 'Positive')

    socketio.emit("queryresponse", comment, to=socket_session_id)
