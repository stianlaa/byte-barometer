import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable not set`);
  }
  return value;
};

export const getCliArguments = () => {
  const argv = yargs(hideBin(process.argv))
    .option("query", {
      alias: "q",
      type: "string",
      description: "search query string",
      demandOption: true,
    })
    .option("commentCount", {
      alias: "c",
      type: "number",
      description: "number of comments to fetch",
      demandOption: true,
    })

    .parseSync();

  const { query, commentCount } = argv;
  if (!query || !commentCount) {
    console.error("Please provide a pointLimit and commentCount");
    process.exit(1);
  }

  return { query, commentCount };
};
