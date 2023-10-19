# Byte-Barometer Backend

This repository includes the backend implementation for the Byte-Barometer application, and subsequent utility for populating and managing the relevant vector database indices.

# Quick summary

The backend offers a websocket endpoint where clients can query for a subject making use of the hybrid embedding search capabilities of some vector databases. In short a query works as follows:

1. The query string is received
2. The query string is converted into a sparse and a dense embedding, using Splade and OpenAI
3. A weighting factor is applied to the sparse and dense vector to prioritize between semantic and conventional search.

4. A vector database query is performed to find the N closest entries sorted by relevancy.
5. Sequentially aspect based sentiment analysis is performen on the entries, with the query string as the aspect.
6. As results become available, they are emitted to the client who entered the query.

# Getting started

TODO containerize such that the installation and running is trivial

## Configuration

Create an `.env` file in the root of the project and add your Pinecone API key and environment details:

```sh
OPENAI_API_KEY=<api-key>
PINECONE_ENVIRONMENT=<environment>
PINECONE_API_KEY=<api-key>
PINECONE_INDEX=<index-name>
```
