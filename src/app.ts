import * as dotenv from "dotenv";
import { fetchComments } from "./hackernews-client.js";
import { awaitModelLoaded, inferSentiment } from "./sentiment-client.js";
import { getCliArguments } from "./util.js";

dotenv.config({ override: true });

export const run = async () => {
  // Get current run arguments
  const { query, commentCount } = getCliArguments();

  // Ensure model is ready
  await awaitModelLoaded();

  // Search Hacker News for the relevant comments since last year
  const fromSeconds = Math.floor(Date.now() / 1000) - 31536000;
  const comments = await fetchComments(query, commentCount, fromSeconds);

  // Infer the sentiment of the comments with regards to the query
  const inferredSentimentArray = await inferSentiment(query, comments);

  // Sort the inferredSentimentArray by sentiment score, 1 to -1 (positive to negative)
  const sortedSentiment = inferredSentimentArray.sort(
    (a, b) => a.positive - a.negative - (b.positive - b.negative)
  );

  // Select the top 3 negative and positive comments
  for (const sentiment of sortedSentiment) {
    console.log(sentiment);
  }
};

run();
