from os import environ
from flask import Flask
from flask_socketio import SocketIO
from enum import Enum
from paperspace_client import get_deployment_status, change_backend_state
from backend_client import checkin_with_backend
from logger_setup import logger
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", logging=True)

# Global variable indicating enabled status
backend_enabled = None

# Backend sleep limit in seconds
APP_ID = "ea647862-7e3f-46ec-b2ee-efe0e841eb8f"
WAKE_ON_VISIT = environ.get("WAKE_ON_VISIT", "False") == "True"


class BackendStatus(str, Enum):
    DISABLED = "DISABLED"
    WARM_UP = "WARM_UP"
    RUNNING = "RUNNING"
    UNKNOWN = "UNKNOWN"


class StatusResponse:
    def __init__(
        self,
        status: BackendStatus,
        deploymentSpec: str | None = None,
    ):
        self.status = status
        self.deploymentSpec = deploymentSpec

    def to_dict(self):
        return {
            "status": self.status,
            "deploymentSpec": self.deploymentSpec,
        }


@app.route("/status", methods=["GET"])
def wake_and_get_app_status():
    """Check in or wake up the backend, then return the current status of the backend."""

    # Fetch status
    deployment_status = get_deployment_status(APP_ID)

    if deployment_status.enabled:
        if checkin_with_backend():
            # Return status, and timeout
            return StatusResponse(
                BackendStatus.RUNNING,
                deploymentSpec=deployment_status.spec,
            ).to_dict()
        else:
            return StatusResponse(
                BackendStatus.WARM_UP,
                deploymentSpec=deployment_status.spec,
            ).to_dict()

    else:
        if WAKE_ON_VISIT:
            # Deployment isn't active but should be, activate
            change_accepted = change_backend_state(deployment_status.spec, True)
            return StatusResponse(
                BackendStatus.WARM_UP if change_accepted else BackendStatus.UNKNOWN,
                deploymentSpec=deployment_status.spec,
            ).to_dict()

        return StatusResponse(
            BackendStatus.DISABLED,
            deploymentSpec=deployment_status.spec,
        ).to_dict()


if __name__ == "__main__":
    # Start the Flask application
    logger.info("Starting watchdog flask app")
    socketio.run(app, host="0.0.0.0", port=2999)
