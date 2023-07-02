import { config } from "dotenv";
import { getPineconeClient } from "./pinecone-client.js";
import { getEnv, validateEnvironmentVariables } from "./util.js";

config();
const indexName = getEnv("PINECONE_INDEX");

const run = async () => {
  validateEnvironmentVariables();

  // Initialize the Pinecone client
  const pineconeClient = await getPineconeClient();

  const indexList = await pineconeClient.listIndexes();
  if (indexList.includes(indexName)) {
    await pineconeClient.deleteIndex({
      indexName,
    });
  } else {
    console.warn(`Index ${indexName} does not exist`);
  }
};

run();
