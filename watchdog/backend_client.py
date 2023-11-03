import requests
from os import environ

DEVELOPMENT_BACKEND_URL = "http://localhost:3000"
PAPERSPACE_BACKEND_URL = (
    "https://dea6478627e3f46ecb2eeefe0e841eb8f.clg07azjl.paperspacegradient.com/:3000"
)


def is_backend_available() -> bool:
    response = requests.get(f"{PAPERSPACE_BACKEND_URL}/available")
    return response.status_code == 200
