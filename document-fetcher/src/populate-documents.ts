import { config } from "dotenv";
import fs from "fs";
import {
  getEnv,
  getPopulateCommandLineArguments,
  sliceIntoChunks,
} from "./util.js";
import { getComments } from "./comment-fetcher.js";
import { Document, createDocuments } from "./document-generator.js";

const STEP_SIZE = 3600; // 1 hours
const CHUNK_SIZE = 100;
const FILE_NAME = "documents.jsonl";

config();

const indexName = getEnv("PINECONE_INDEX");

const step = (current: number, to: number, stepSize: number) => {
  if (current + stepSize > to) return to;
  return current + stepSize;
};

const writeToFile = (documents: Document[], fileName: string) => {
  // Append stringified documents to file
  const file = fs.createWriteStream(fileName, { flags: "a" });
  file.write(documents.map((d) => JSON.stringify(d)).join("\n") + "\n");
  file.end();
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

  // Fetch comments
  let queryFrom = from;
  let commentCount = 0;
  while (queryFrom < to) {
    let queryTo = step(queryFrom, to, STEP_SIZE);
    console.log("\nStep from", new Date(queryFrom * 1000));

    const commentBatch = await getComments(queryFrom, queryTo);
    commentCount += commentBatch.length;
    // TODO current commentLimit should be changed to use slice and break after whatever remains has been processed

    // Slice into chunks of 100 or less
    for (const commentChunk of sliceIntoChunks(commentBatch, CHUNK_SIZE)) {
      console.log(`  Processing ${commentChunk.length} comments`);

      // Split into documents
      const documents = createDocuments(commentChunk);

      // Write to file
      console.log("  Writing to file");
      await writeToFile(documents, FILE_NAME);
    }

    if (commentCount >= commentLimit) {
      console.log("Reached comment limit");
      break;
    }

    queryFrom = step(queryFrom, to, STEP_SIZE);
  }
};

run();
