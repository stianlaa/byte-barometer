import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const sliceIntoChunks = <T>(arr: T[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable not set`);
  }
  return value;
}

export const validateEnvironmentVariables = () => {
  getEnv("OPENAI_API_KEY");
  getEnv("PINECONE_API_KEY");
  getEnv("PINECONE_ENVIRONMENT");
  getEnv("PINECONE_INDEX");
};

export const getQueryingCommandLineArguments = () => {
  const argv = yargs(hideBin(process.argv))
    .option("query", {
      alias: "q",
      type: "string",
      description: "Your query",
      demandOption: true,
    })
    .option("topK", {
      alias: "k",
      type: "number",
      description: "number of results to return",
      demandOption: true,
    })

    .parseSync();

  const { query, topK } = argv;
  if (!query) {
    console.error("Please provide a query");
    process.exit(1);
  }

  return { query, topK };
};

export const getPopulateCommandLineArguments = () => {
  const argv = yargs(hideBin(process.argv))
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
