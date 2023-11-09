# Byte-Barometer Backend

This directory defines the backend for the Byte-Barometer application. It also provides utility for populating the relevant vector database indices.

# Quick summary

The backend application offers a websocket endpoint where clients can query for a subject making use of the hybrid embedding search capabilities of some vector databases. In short a query involves the following steps:

1. The query string is received over websocket, and the sender client id is noted.
2. The query string is converted into a [sparse embedding](https://www.pinecone.io/learn/splade/) and a [dense embedding](https://platform.openai.com/docs/guides/embeddings), using Splade and OpenAI respectively. These are weighted to prioritize between semantic and conventional search.

3. A vector database query is performed to find the N closest entries sorted by relevancy.
4. Aspect based sentiment analysis is applied on the entries, with the query string as the aspect, and as results become available they are published back to the client.

## System setup

The backend has been containerized, but in order to make use of the GPU acceleration it is neccessary to install the nvidia-container-toolkit on the host system [NVIDIA container toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/1.14.3/install-guide.html). Ensure that `nvidia-smi` corresponds as expected in the host and container system.

## Configuration

Create an `.env` file in the root of the project and add your Pinecone API key and environment details:

```sh
HUGGINGFACE_API_KEY=<api_key>
OPENAI_API_KEY=<api-key>
PINECONE_ENVIRONMENT=<environment>
PINECONE_API_KEY=<api-key>
PINECONE_INDEX=<index-name>
ENABLE_GPU=True
```

# Getting started

The backend application will regularly fetch, process and store new comments from hackernews so that they may be queried. However this will just happen to new comments, to populate the index with an initial set of data you can do as follows:

```bash
docker run --gpus all -v .:/app -it --env-file ../.env --entrypoint python3 byte-barometer populate.py -l 72000 -d 10000
```

After initial setup, build the docker image if you haven't already

```bash
docker build -t byte-barometer .
```

Then run the backend using the docker compose file, keeping your working environment clean and separated. This assumes you've configured your .env file already.

```bash
docker compose up
```

With the docker container running the backend should serve and maintain the vector database data.
