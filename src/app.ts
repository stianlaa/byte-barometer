import * as dotenv from "dotenv";
import { fetchComments } from "./hackernews-client.js";
import { inferSentiment } from "./sentiment-client.js";
import { getCliArguments } from "./util.js";

dotenv.config({ override: true });

export const run = async () => {
  // Get current run arguments
  const { query, commentCount } = getCliArguments();

  // Search Hacker News for the relevant comments since last year
  const fromSeconds = Math.floor(Date.now() / 1000) - 31536000;
  const comments = await fetchComments(query, commentCount, fromSeconds);

  // Infer the sentiment of the comments with regards to the query
  const inferredSentimentArray = await inferSentiment(comments);

  for (let sentinment of inferredSentimentArray) {
    console.log(sentinment.comment_text, sentinment.sentiment, "\n");
  }
};

run();
