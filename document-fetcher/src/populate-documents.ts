import { config } from "dotenv";
import fs from "fs";
import { getComments } from "./comment-fetcher.js";
import { Document, createDocuments } from "./document-generator.js";
import yargs from "yargs";

const STEP_SIZE = 3600; // 1 hours
const CHUNK_SIZE = 100;
const FILE_NAME = "documents.jsonl";

config();

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
    .option("commentLimit", {
      alias: "c",
      type: "number",
      description: "limit the number of comments to fetch",
      default: 100,
      demandOption: false,
    })
    .parseSync();

  const { from, to, last, commentLimit } = argv;

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
    return { from: now - Math.floor(last), to: now, commentLimit };
  }

  if (!from || !to) {
    console.error("Please provide both from and to");
    process.exit(1);
  }

  return { from, to, commentLimit };
};

const run = () => {
  const { from, to, commentLimit } = getCommandLineArguments();
  console.log(
    "Fetching documents from:",
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
