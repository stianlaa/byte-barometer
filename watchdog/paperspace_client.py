import requests
from os import environ

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


def get_deployment_status(app_id: str) -> DeploymentStatus:
    headers = {
        "accept": "application/json",
        "authorization": f"Bearer {PAPERSPACE_API_KEY}",
    }
    response = requests.get(f"{PAPERSPACE_URL}/{app_id}", headers=headers)
    j = response.json()
    return DeploymentStatus(
        name=j["name"],
        id=j["id"],
        projectId=j["projectId"],
        endpoint=j["endpoint"],
        enabled=j["latestSpec"]["data"]["enabled"] == "true",
        spec=j["latestSpec"],
    )


def wake_application(app_id: str, deployment_spec: str) -> bool:
    print("Wake app")
    headers = {
        "accept": "application/json",
        "authorization": f"Bearer {PAPERSPACE_API_KEY}",
    }
    adjusted_spec = deployment_spec
    # TODO adjust

    response = requests.post(
        f"{PAPERSPACE_URL}/{app_id}", headers=headers, data=adjusted_spec
    )
    return response.status_code == 200
