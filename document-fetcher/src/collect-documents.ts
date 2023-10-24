import { config } from "dotenv";
import fs from "fs";
import { getComments } from "./comment-fetcher.js";
import { Document, createDocuments } from "./document-generator.js";
import yargs from "yargs";

const STEP_SIZE = 3600; // 1 hour
const CHUNK_SIZE = 100;
const FILE_NAME = "documents.jsonl";

config();

const step = (current: number, to: number, stepSize: number) => {
  if (current + stepSize > to) return to;
  return current + stepSize;
};

const writeToFile = (
  documents: Document[],
  fileName: string,
  lastLine: boolean = false
) => {
  // Append stringified documents to file
  const file = fs.createWriteStream(fileName, { flags: "a" });
  file.write(
    documents.map((d) => JSON.stringify(d)).join("\n") + lastLine ? "" : "\n"
  );
  file.end();
};

const sliceIntoChunks = <T>(arr: T[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

const getCommandLineArguments = () => {
  const argv = yargs(process.argv)
    .option("from", {
      alias: "f",
      type: "number",
      description: "lower time boundary in seconds to query for comments",
      demandOption: false,
    })
    .option("to", {
      alias: "t",
      type: "number",
      description: "upper time boundary in seconds to query for comments",
      demandOption: false,
    })
    .option("last", {
      alias: "l",
      type: "number",
      description: "sets 'from' to (now - last) and 'to' to now",
      demandOption: false,
    })
    .option("documentLimit", {
      alias: "d",
      type: "number",
      description: "limit the number of documents to fetch",
      default: 100,
      demandOption: false,
    })
    .parseSync();

  const { from, to, last, documentLimit } = argv;

  if (last) {
    if (from || to) {
      console.error("Please provide only one of from, to, or last");
      process.exit(1);
    }
    if (last < 0) {
      console.error("Please provide a positive value for last");
      process.exit(1);
    }

    // Get now seconds since epoch
    const now = Math.floor(Date.now() / 1000);
    return { from: now - Math.floor(last), to: now, documentLimit };
  }

  if (!from || !to) {
    console.error("Please provide both from and to");
    process.exit(1);
  }

  return { from, to, documentLimit };
};

const run = async () => {
  const { from, to, documentLimit } = getCommandLineArguments();
  console.log(
    "Fetching " + documentLimit + " documents from:",
    new Date(from * 1000),
    "to",
    new Date(to * 1000)
  );

  // Fetch comments
  let queryFrom = from;
  let documentCount = 0;
  while (queryFrom < to) {
    let queryTo = step(queryFrom, to, STEP_SIZE);
    console.log("\nStep from", new Date(queryFrom * 1000));

    let commentBatch = await getComments(queryFrom, queryTo);

    // Slice into chunks of 100 or less
    for (const commentChunk of sliceIntoChunks(commentBatch, CHUNK_SIZE)) {
      console.log(`  Processing ${commentChunk.length} comments`);

      // Split into documents
      const documents = createDocuments(commentChunk);

      // Update current document count
      documentCount += documents.length;

      if (documentCount > documentLimit) {
        // We've reached the limit, slice off excess and store remainder
        const documentBatch = documents.slice(documentCount - documentLimit);

        // Write last part of batch to file
        writeToFile(documentBatch, FILE_NAME, true);
        console.log(`Reached document limit: ${documentLimit}`);
        return;
      } else {
        // Add entire batch of doucments, write to file
        console.log(`  Writing ${documents.length} documents to file`);
        writeToFile(documents, FILE_NAME);
      }
    }

    queryFrom = step(queryFrom, to, STEP_SIZE);
  }
};

run();
