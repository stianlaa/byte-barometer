import { utils } from "@pinecone-database/pinecone";
import { config } from "dotenv";

import { createEmbeddings } from "./embeddings.js";
import { getPineconeClient } from "./pinecone-client.js";
import {
  getEnv,
  getPopulateCommandLineArguments,
  sliceIntoChunks,
} from "./util.js";
import { getComments } from "./comment-fetcher.js";
import { createDocuments } from "./document-generator.js";

const { createIndexIfNotExists, chunkedUpsert } = utils;
const STEP_SIZE = 18000; // 5 hours
const CHUNK_SIZE = 100;

config();

const indexName = getEnv("PINECONE_INDEX");

const step = (current: number, to: number, stepSize: number) => {
  if (current + stepSize > to) return to;
  return current + stepSize;
};

const run = async () => {
  const { from, to, commentLimit } = getPopulateCommandLineArguments();
  console.log(
    "Populating index: ",
    indexName,
    "from",
    new Date(from * 1000),
    "to",
    new Date(to * 1000)
  );

  // Create a Pinecone index with dimension of 1536
  const pineconeClient = await getPineconeClient();
  await createIndexIfNotExists(pineconeClient, indexName, 1536);
  const index = pineconeClient.Index(indexName);

  // Fetch comments
  let queryFrom = from;
  let commentCount = 0;
  while (queryFrom < to) {
    let queryTo = step(queryFrom, to, STEP_SIZE);
    console.log("\nStep from", new Date(queryFrom * 1000));

    const commentBatch = await getComments(queryFrom, queryTo);
    commentCount += commentBatch.length;
    // Slice into chunks of 100 or less
    for (const commentChunk of sliceIntoChunks(commentBatch, CHUNK_SIZE)) {
      console.log(`  Processing ${commentChunk.length} comments`);

      // Split into documents
      const documents = createDocuments(commentChunk);

      // Create embeddings
      console.log("  Creating embeddings");
      const vectors = await createEmbeddings(documents);

      // Upsert embeddings
      console.log("  Upserting embeddings");
      await chunkedUpsert(index, vectors, "default");

      console.log(`  Inserted ${documents.length} documents`);
    }

    if (commentCount >= commentLimit) {
      console.log("Reached comment limit");
      break;
    }

    queryFrom = step(queryFrom, to, STEP_SIZE);
  }
};

run();
