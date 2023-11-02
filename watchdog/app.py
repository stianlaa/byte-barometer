from flask import Flask
from datetime import datetime, timedelta
from threading import Thread
import time
from paperspace_client import get_app_status

app = Flask(__name__)

# Global variable to store the timestamp
last_timestamp = datetime.now()

# Flag for backend state, None implies unknown
backend_enabled = None

# Backend sleep limit in seconds
TIME_LIMIT = 30
CHECK_TIMEOUT_INTERVAL = 3
APP_ID = "ea647862-7e3f-46ec-b2ee-efe0e841eb8f"

PAPERSPACE_URL = "https://api.paperspace.com/v1/deployments"


def background_task():
    global last_timestamp
    global backend_enabled
    while True:
        time.sleep(CHECK_TIMEOUT_INTERVAL)
        timed_out = datetime.now() - last_timestamp > timedelta(seconds=TIME_LIMIT)
        if timed_out and backend_enabled != False:
            print("Exceeded! Disabling backend and verifying status")
            # Should at this point disable the backend
            backend_enabled = False


@app.route("/status", methods=["GET"])
def update_timestamp():
    global last_timestamp
    global backend_enabled

    # Fetch status
    status = get_app_status(APP_ID)

    # Update enabled flag
    # Update timestamp
    last_timestamp = datetime.now()

    print("Pretending to have started up backend")
    backend_enabled = True  # TODO remove, this should reflect actual state
    # Return status, and timeout
    return {
        "message": "Timestamp updated",
        "timestamp": last_timestamp.isoformat(),
        "backend_enabled": backend_enabled,
    }


if __name__ == "__main__":
    # Start the background thread
    thread = Thread(target=background_task)
    thread.daemon = True
    thread.start()

    # Start the Flask application
    app.run(host="0.0.0.0", port=2999)
