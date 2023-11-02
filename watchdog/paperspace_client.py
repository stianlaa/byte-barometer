import requests
from os import environ

PAPERSPACE_URL = "https://api.paperspace.com/v1/deployments"
PAPERSPACE_API_KEY = environ.get("PAPERSPACE_API_KEY")


def get_app_status(app_id: str):
    headers = {
        "accept": "application/json",
        "authorization": f"Bearer {PAPERSPACE_API_KEY}",
    }
    response = requests.get(f"{PAPERSPACE_URL}/{app_id}", headers=headers)
    print(response.text)
    return response.text
