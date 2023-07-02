import { utils } from "@pinecone-database/pinecone";
import cliProgress from "cli-progress";
import { config } from "dotenv";

import { embedder } from "./embeddings.js";
import { getPineconeClient } from "./pinecone-client.js";
import { getEnv, getPopulateCommandLineArguments } from "./util.js";
import { getComments } from "./comment-fetcher.js";
import { createDocuments } from "./document-generator.js";

// TODO create wonka pipeline to populate index

const { createIndexIfNotExists, chunkedUpsert } = utils;
const BATCH_SIZE = 10;

config();

const progressBar = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

const indexName = getEnv("PINECONE_INDEX");
let counter = 0;

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
  progressBar.start(documents.length, 0);
  await embedder.init();

  console.time("Upserting");
  await embedder.embedBatch(documents, BATCH_SIZE, async (embeddings) => {
    counter += embeddings.length;
    // Repeat upsert until successful

    for (let i = 0; i < 10; i++) {
      try {
        await chunkedUpsert(index, embeddings, "default");
        break;
      } catch (e) {
        console.log(e);
        // Wait for increasing amount of time
        await new Promise((resolve) => setTimeout(resolve, 1000 * i));
      }
    }

    progressBar.update(counter);
  });
  console.timeEnd("Upserting");

  progressBar.stop();
  console.log(`Inserted ${documents.length} documents into index ${indexName}`);
};

run();
