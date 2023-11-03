from os import environ
from flask import Flask
from flask_socketio import SocketIO
from datetime import datetime, timedelta
from threading import Thread
from enum import Enum
from paperspace_client import get_deployment_status, change_backend_state
from backend_client import is_backend_available
from logger_setup import logger
import time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", logging=True)

# Global variable to store the timestamp
most_recent_request = datetime.now()

# Global variable indicating enabled status
backend_enabled = None

# Backend sleep limit in seconds
TIME_LIMIT = 30
CHECK_TIMEOUT_INTERVAL = 10
APP_ID = "ea647862-7e3f-46ec-b2ee-efe0e841eb8f"
WAKE_ON_VISIT = environ.get("WAKE_ON_VISIT", "False") == "True"


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
def wake_and_get_app_status():
    """Return the current status of the backend, and wake backend if relevant"""
    global most_recent_request
    global backend_enabled

    if WAKE_ON_VISIT:
        # Update timestamp
        logger.info("Refreshing timeout limit")
        most_recent_request = datetime.now()

    # Fetch status
    deployment_status = get_deployment_status(APP_ID)

    if deployment_status.enabled:
        if is_backend_available():
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
        if WAKE_ON_VISIT and not backend_enabled:
            # Deployment isn't active but should be, activate
            change_accepted = change_backend_state(deployment_status.spec, True)
            if change_accepted:
                backend_enabled = True
            return StatusResponse(
                BackendStatus.WARM_UP if change_accepted else BackendStatus.UNKNOWN,
                most_recent_request,
                deploymentSpec=deployment_status.spec,
            ).to_dict()

        return StatusResponse(
            BackendStatus.DISABLED,
            most_recent_request,
            deploymentSpec=deployment_status.spec,
        ).to_dict()


def watchdog_task():
    """Disable the deployment temporarily if it has been up too long"""
    global most_recent_request
    global backend_enabled
    while True:
        time.sleep(CHECK_TIMEOUT_INTERVAL)
        timed_out = datetime.now() - most_recent_request > timedelta(seconds=TIME_LIMIT)
        deployment_status = get_deployment_status(APP_ID)

        backend_enabled = deployment_status.enabled if deployment_status else False

        if timed_out and backend_enabled == True:
            logger.info("Backend timed out - disabling")
            change_backend_state(deployment_status.spec, False)


if __name__ == "__main__":
    # Start the background thread
    logger.info("Launching watchdog background task")
    thread = Thread(target=watchdog_task)
    # thread.daemon = True
    thread.start()

    # Start the Flask application
    logger.info("Starting watchdog flask app")
    socketio.run(app, host="0.0.0.0", port=2999)
