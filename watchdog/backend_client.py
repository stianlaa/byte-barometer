import requests
from os import environ
from logger_setup import logger

# "https://dea6478627e3f46ecb2eeefe0e841eb8f.clg07azjl.paperspacegradient.com/:3000"
PAPERSPACE_BACKEND_URL = environ.get("PAPERSPACE_BACKEND_URL", "http://localhost:3000") 

def checkin_with_backend() -> bool:
    try:
        response = requests.get(f"{PAPERSPACE_BACKEND_URL}/checkin")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        logger.info(f"Checkin returned not-ok status: {e}")
        return False
