import fs from "fs";
import { getComments } from "./comment-fetcher.js";
import { Document, createDocuments } from "./document-generator.js";
import { getCommandLineArguments, sliceIntoChunks, step } from "./util.js";

const STEP_SIZE = 3600; // 1 hour
const CHUNK_SIZE = 100;
const FILE_NAME = "documents.jsonl";

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

const main = async () => {
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
        console.log(documents);
        writeToFile(documents, FILE_NAME);
      }
    }

    queryFrom = step(queryFrom, to, STEP_SIZE);
  }
};

main();
