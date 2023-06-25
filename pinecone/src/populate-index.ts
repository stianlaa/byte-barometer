import { utils } from "@pinecone-database/pinecone";
import cliProgress from "cli-progress";
import { config } from "dotenv";

import { embedder } from "./embeddings.js";
import { getPineconeClient } from "./pinecone-client.js";
import { getEnv, getPopulateCommandLineArguments } from "./util.js";
import { getDocuments } from "./document-fetcher.js";

const { createIndexIfNotExists, chunkedUpsert } = utils;

config();

const progressBar = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

// const indexName = getEnv("PINECONE_INDEX");
const indexName = getEnv("PINECONE_INDEX");
let counter = 0;

const run = async () => {
  console.log("Starting");
  const { commentCount } = getPopulateCommandLineArguments();

  // Fetch relevant documents
  const documents = await getDocuments(commentCount);

  console.log(`Fetched ${documents.length} documents`);

  // Create a Pinecone index with dimension of1536
  const pineconeClient = await getPineconeClient();
  await createIndexIfNotExists(pineconeClient, indexName, 1536);
  const index = pineconeClient.Index(indexName);

  // Start the batch embedding process
  progressBar.start(documents.length, 0);
  await embedder.init();

  await embedder.embedBatch(documents, 1, async (embeddings) => {
    counter += embeddings.length;
    // Whenever the batch embedding process returns a batch of embeddings, upsert them into the index
    await chunkedUpsert(index, embeddings, "default");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    progressBar.update(counter);
  });

  progressBar.stop();
  console.log(`Inserted ${documents.length} documents into index ${indexName}`);
};

run();
