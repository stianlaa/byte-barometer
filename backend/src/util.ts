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
      demandOption: false,
    })
    .option("commentCount", {
      alias: "c",
      type: "number",
      description: "number of comments to fetch",
      demandOption: false,
    })
    .parseSync();
  const { query, commentCount } = argv;
  return { query, commentCount };
};
