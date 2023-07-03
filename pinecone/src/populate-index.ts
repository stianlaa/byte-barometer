import { utils } from "@pinecone-database/pinecone";
import { config } from "dotenv";

import { createEmbeddings } from "./embeddings.js";
import { getPineconeClient } from "./pinecone-client.js";
import { getEnv, getPopulateCommandLineArguments } from "./util.js";
import { getComments } from "./comment-fetcher.js";
import { createDocuments } from "./document-generator.js";

const { createIndexIfNotExists, chunkedUpsert } = utils;

config();

const indexName = getEnv("PINECONE_INDEX");

const run = async () => {
  console.log("Populating index");
  const { commentCount } = getPopulateCommandLineArguments();

  // Fetch comments
  const comments = await getComments(commentCount);

  // Split into documents
  const documents = await createDocuments(comments);

  // Create a Pinecone index with dimension of 1536
  const pineconeClient = await getPineconeClient();
  await createIndexIfNotExists(pineconeClient, indexName, 1536);
  const index = pineconeClient.Index(indexName);

  // Start the batch embedding process
  const vectors = await createEmbeddings(documents);
  await chunkedUpsert(index, vectors, "default");

  console.log(`Inserted ${documents.length} documents into index ${indexName}`);
};

run();
