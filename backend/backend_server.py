from flask import Flask
from flask_socketio import SocketIO
import random

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.on('query')
def handle_query(json):
    # Query specifies X number of results desired
    # Begin streaming these
    print('Received message:', str(json))
    socketio.emit('queryresponse', {
        'data': [
            {
                'id': f'unique-id-${str(random.randint(0, 50000))}',
                'metadata': {
                    'author': "string;",
                    'storyId': "string;",
                    'context': "string;",
                    'parentId': "string;",
                    'storyUrl': "string;",
                    'createdAt': "string;",
                },
                'sentiment': {
                    'label': "Positive",
                    'score': 0,
                }
            }
        ]
    }
    )


print("SocketIO running")
socketio.run(app, port=3000)
