from flask_setup import app
from datetime import datetime, timedelta
from client.paperspace_client import change_backend_state, get_deployment_status
from logger_setup import logger
from datetime import datetime
from threading import Lock
from schedule import every
import time

previous_activity = time.time()

TIME_LIMIT = 600 
APP_ID = "ea647862-7e3f-46ec-b2ee-efe0e841eb8f"

# Global variable to store the timestamp of the most recent availability check
checkin_lock = Lock()
most_recent_checkin = datetime.now()


@app.route("/checkin", methods=["GET"])
def checkin():
    with checkin_lock:
        global most_recent_checkin
        most_recent_checkin = datetime.now()
        return {}  # Status code 200 OK


def check_for_timeout():
    with checkin_lock:
        timed_out = datetime.now() - most_recent_checkin > timedelta(seconds=TIME_LIMIT)

        if timed_out:
            logger.warning(f"No checkin in over {TIME_LIMIT} seconds, shutting down")

            # Fetch deployment status for deployment spec
            deployment_status = get_deployment_status(APP_ID)

            # Change deployment state
            change_backend_state(deployment_status.spec, False)


def schedule_timeout_shutdown_job():
    every(10).seconds.do(check_for_timeout)
