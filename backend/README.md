# Byte-Barometer Backend

This repository includes the backend implementation for the Byte-Barometer application, and subsequent utility for populating and managing the relevant vector database indices.

# Quick summary

The backend offers a websocket endpoint where clients can query for a subject making use of the hybrid embedding search capabilities of some vector databases. In short a query works as follows:

1. The query string is received over websocket, and the sender client id is noted
2. The query string is converted into a sparse and a dense embedding, using Splade and OpenAI
3. A weighting factor is applied to the sparse and dense vector to prioritize between semantic and conventional search.

4. A vector database query is performed to find the N closest entries sorted by relevancy.
5. Sequentially aspect based sentiment analysis is performen on the entries, with the query string as the aspect.
6. As results become available, they are emitted to the client who entered the query.

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
```

# Getting started

The backend application will regularly fetch, process and store new comments from hackernews so that they may be queried. However this will just happen to new comments, to populate the index with an initial set of data the `vector_manager.py` script should be used.

After initial setup, build the docker image if you haven't already

```bash
docker build -t byte-barometer .
```

Then run the backend using the docker compose file, keeping your working environment clean and separated. This assumes you've configured your .env file.

```bash
docker compose up
```

With the docker container running the backend should serve and maintain the stored data.
