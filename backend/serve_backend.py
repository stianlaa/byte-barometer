from api import query_endpoint
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO


def main():
    print('Serving index')
    app = Flask(__name__)
    CORS(app)

    app.route('/query', methods=['POST'])(query_endpoint)

    socketio = SocketIO(app)
    socketio.run(app, port=3000)


if __name__ == '__main__':

    main()
