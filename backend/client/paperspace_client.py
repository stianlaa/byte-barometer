import requests
from os import environ
from logger_setup import logger
import json

PAPERSPACE_API_KEY = environ.get("PAPERSPACE_API_KEY")
PAPERSPACE_URL = "https://api.paperspace.com/v1/deployments"

class DeploymentStatus:
    def __init__(
        self,
        name: str,
        id: str,
        projectId: str,
        endpoint: str,
        enabled: bool,
        spec: str,
    ):
        self.id = id
        self.name = name
        self.projectId = projectId
        self.endpoint = endpoint
        self.enabled = enabled
        self.spec = spec


def get_deployment_status(app_id: str) -> DeploymentStatus | None:
    headers = {
        "accept": "application/json",
        "authorization": f"Bearer {PAPERSPACE_API_KEY}",
    }
    response = requests.get(f"{PAPERSPACE_URL}/{app_id}", headers=headers)
    if response.status_code == 200:
        response_json = response.json()

        return DeploymentStatus(
            name=response_json["name"],
            id=response_json["id"],
            projectId=response_json["projectId"],
            endpoint=response_json["endpoint"],
            enabled=response_json["latestSpec"]["data"]["enabled"] == True,
            spec=response_json["latestSpec"],
        )
    else:
        logger.warning(response.json())
        return None


def change_backend_state(deployment_spec: str, enabled: bool) -> bool:
    logger.info(f"Changing deployment state to: {enabled}")
    headers = {
        "accept": "application/jswatchdog/paperspace_client.pyon",
        "content-type": "application/json",
        "authorization": f"Bearer {PAPERSPACE_API_KEY}",
    }

    config = deployment_spec["data"]
    config["enabled"] = enabled

    payload = {
        "deploymentId": "ea647862-7e3f-46ec-b2ee-efe0e841eb8f",
        "projectId": "plf3fs5whu1",
        "config": config,
    }

    json_payload = json.dumps(payload)
    response = requests.post(f"{PAPERSPACE_URL}", headers=headers, data=json_payload)

    if response.status_code == requests.codes.ok:
        return True
    else:
        logger.warning(f"Non-ok response during state change {response.json()}")
        return False
