import { config } from "dotenv";
import { embed } from "./embeddings.js";
import { getPineconeClient } from "./pinecone-client.js";
import {
  getEnv,
  getQueryingCommandLineArguments,
  validateEnvironmentVariables,
} from "./util.js";

config();

const indexName = getEnv("PINECONE_INDEX");

const run = async () => {
  validateEnvironmentVariables();
  const pineconeClient = await getPineconeClient();
  const { query, topK } = getQueryingCommandLineArguments();

  // Insert the embeddings into the index
  const index = pineconeClient.Index(indexName);

  // Embed the query
  const queryEmbedding = await embed({
    id: "placeholder",
    text: query,
  });

  let queryEmbeddingValues = queryEmbedding.map((value) => value.values);
  if (queryEmbeddingValues.length !== 1) {
    console.error("Query embedding is not a single vector");
  }

  // Query the index
  const results = await index.query({
    queryRequest: {
      vector: queryEmbeddingValues[0],
      topK,
      includeMetadata: true,
      includeValues: false,
      namespace: "default",
    },
  });

  // Print the results
  console.log("Results:");
  console.log(
    results.matches?.map((match) => ({
      ...match,
    }))
  );
};

run();
