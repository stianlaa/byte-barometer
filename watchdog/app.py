from os import environ
from flask import Flask
from datetime import datetime, timedelta
from threading import Thread
from enum import Enum
from paperspace_client import get_deployment_status, wake_application
from backend_client import is_backend_available
import time

app = Flask(__name__)

# Global variable to store the timestamp
most_recent_request = datetime.now()

# Backend sleep limit in seconds
TIME_LIMIT = 30
CHECK_TIMEOUT_INTERVAL = 3
APP_ID = "ea647862-7e3f-46ec-b2ee-efe0e841eb8f"
WAKE_ON_VISIT = environ.get("ENABLE_ON_VISIT", "False") == "True"


class BackendStatus(str, Enum):
    DISABLED = "DISABLED"
    WARM_UP = "WARM_UP"
    RUNNING = "RUNNING"
    UNKNOWN = "ERROR"


class StatusResponse:
    def __init__(
        self,
        status: BackendStatus,
        timestamp: datetime,
        deploymentSpec: str | None = None,
    ):
        self.status = status
        self.timestamp = timestamp
        self.deploymentSpec = deploymentSpec

    def to_dict(self):
        return {
            "status": self.status,
            "timestamp": self.timestamp,
            "deploymentSpec": self.deploymentSpec,
        }


@app.route("/status", methods=["GET"])
def get_status():
    global most_recent_request

    if WAKE_ON_VISIT:
        # Update timestamp
        most_recent_request = datetime.now()

    # Fetch status
    deployment_status = get_deployment_status(APP_ID)

    if deployment_status.enabled:
        if is_backend_available():
            # Update enabled flag

            print("Pretending to have started up backend")

            # Return status, and timeout
            return StatusResponse(
                BackendStatus.RUNNING,
                most_recent_request,
                deploymentSpec=deployment_status.spec,
            ).to_dict()
        else:
            return StatusResponse(
                BackendStatus.WARM_UP,
                most_recent_request,
                deploymentSpec=deployment_status.spec,
            ).to_dict()

    else:
        if WAKE_ON_VISIT:
            # Deployment isn't active but should be, activate
            waking_application = wake_application(APP_ID, deployment_status.spec)
            return StatusResponse(
                BackendStatus.WARM_UP if waking_application else BackendStatus.UNKNOWN,
                most_recent_request,
                deploymentSpec=deployment_status.spec,
            ).to_dict()

        return StatusResponse(
            BackendStatus.DISABLED,
            most_recent_request,
            deploymentSpec=deployment_status.spec,
        ).to_dict()


def background_task():
    global most_recent_request
    while True:
        print("Iteration in background task")
        time.sleep(CHECK_TIMEOUT_INTERVAL)
        timed_out = datetime.now() - most_recent_request > timedelta(seconds=TIME_LIMIT)
        backend_enabled = False  # TODO Fetch
        if timed_out and backend_enabled != False:
            print("Exceeded! Disabling backend and verifying status")
            # Should at this point disable the backend
            backend_enabled = False


if __name__ == "__main__":
    # Start the background thread
    thread = Thread(target=background_task)
    thread.daemon = True
    thread.start()

    # Start the Flask application
    app.run(host="0.0.0.0", port=2999)
