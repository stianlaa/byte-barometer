from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.on('query')
def handle_query(json):
    # Query specifies X number of results desired
    # Begin streaming these
    print('Received message:', str(json))
    socketio.emit('queryresponse', {'data': 'Server response!'})


print("SocketIO running")
socketio.run(app, port=3000)
