import * as dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { fetchComments } from "./hackernews-client.js";

dotenv.config();

const getCliArguments = () => {
  const argv = yargs(hideBin(process.argv))
    .option("pointLimit", {
      alias: "p",
      type: "number",
      description: "minimum number of points on parent post to include",
      demandOption: true,
    })
    .option("commentCount", {
      alias: "c",
      type: "number",
      description: "number of comments to fetch",
      demandOption: true,
    })

    .parseSync();

  const { pointLimit, commentCount } = argv;
  if (!pointLimit || !commentCount) {
    console.error("Please provide a pointLimit and commentCount");
    process.exit(1);
  }

  return { pointLimit, commentCount };
};

export const run = async () => {
  // Get current run arguments
  const { pointLimit, commentCount } = getCliArguments();

  // Search Hacker News for the relevant comments
  const comments = await fetchComments("react", pointLimit, commentCount);

  console.log("pointLimit: ", pointLimit, "commentCount:", commentCount);
};

run();
