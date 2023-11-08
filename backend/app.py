from dotenv import load_dotenv

load_dotenv("../.env")

from logger_setup import logger
from service.websocket_server import setup_websocket_endpoints
from service.populate_service import schedule_populate_job
from service.shutdown_service import schedule_timeout_shutdown_job
from util.schedule_util import run_continuously
from flask_setup import socketio, app
from os import environ

enable_population_job = environ.get("ENABLE_POPULATION_JOB", "False") == "True"
shutdown_on_timeout = environ.get("SHUTDOWN_ON_TIMEOUT", "False") == "True"

if enable_population_job:
    logger.info("Scheduling population job")
    schedule_populate_job()
else:
    logger.warning("Not starting population job")

if shutdown_on_timeout:
    logger.info("Scheduling timeout shutdown job")
    schedule_timeout_shutdown_job()
else:
    logger.warning("Not shutting down on timeout")

if enable_population_job or shutdown_on_timeout:
    # Start schedule run thread with interval
    run_continuously(1)

setup_websocket_endpoints()

if __name__ == "__main__":
    logger.info("Launching backend")
    socketio.run(app, port=3000)
