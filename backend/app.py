from logger_setup import logger
from service.populate_service import schedule_populate_job
from service.websocket_server import serve
from flask_setup import app as test
from os import environ

enable_population_job = environ.get("ENABLE_POPULATION_JOB", "False") == "True"

# TODO clean up
app = test

if __name__ == "__main__":
    if enable_population_job:
        logger.info("Starting population job")
        schedule_populate_job()

    logger.info("Launching backend")
    serve()
