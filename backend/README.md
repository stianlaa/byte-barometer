# Pinecone

This repo has a few purposes, it serves as a backend for the byte-barometer application offering hybrid search of the pinecone index, and manages embedding and upserting to pinecone.

## Configuration

Create an `.env` file in the root of the project and add your Pinecone API key and environment details:

```sh
OPENAI_API_KEY=<api-key>
PINECONE_ENVIRONMENT=<environment>
PINECONE_API_KEY=<api-key>
PINECONE_INDEX=<index-name>
```

## Inspiration

https://docs.pinecone.io/docs/hybrid-search & https://docs.pinecone.io/docs/ecommerce-search
https://github.com/pinecone-io/examples/blob/master/search/hybrid-search/medical-qa/pubmed-splade.ipynb
