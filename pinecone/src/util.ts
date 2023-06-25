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
    .option("commentCount", {
      alias: "c",
      type: "number",
      description: "number of comments to fetch",
      demandOption: true,
    })

    .parseSync();

  const { commentCount } = argv;
  if (!commentCount) {
    console.error("Please provide a comment count");
    process.exit(1);
  }

  return { commentCount };
};
