import axios from "axios";
import { getEnv } from "./util.js";
import { Comment } from "./hackernews-client.js";

const MODEL = "yangheng/deberta-v3-large-absa-v1.1";
const HUGGING_FACE_URL = "https://api-inference.huggingface.co/";

const POSITIVE = "Positive";
const NEGATIVE = "Negative";

type CommentWithSentiment = {
  objectID: number;
  parentID: number;
  storyID: number;
  author: string;
  commentText: string;
  positive: number;
  negative: number;
  neutral: number;
  storyUrl: string;
};

// Await huggingface model loaded
export const awaitModelLoaded = async () => {
  for (let retries = 0; retries < 5; retries++) {
    try {
      console.log("Checking if model is loaded");
      await axios.get(`${HUGGING_FACE_URL}models/${MODEL}`, {
        headers: { Authorization: `Bearer ${getEnv("HUGGINGFACE_API_KEY")}` },
      });
      console.log("Model is loaded");
      return;
    } catch (error) {
      console.log("Should check 503 and retry");
      // Wait for 6 seconds
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }
  }
};

export const inferSentiment = async (
  query: string,
  comments: Comment[]
): Promise<CommentWithSentiment[]> => {
  const inferredSentimentArray: CommentWithSentiment[] = [];
  const inputs = comments.map(
    (comment) => `[CLS] ${comment.comment_text} [SEP] ${query} [SEP]`
  );

  // Time request
  console.time("Infer sentiment");
  const { data } = await axios.post(
    `${HUGGING_FACE_URL}models/${MODEL}`,
    inputs,
    {
      headers: { Authorization: `Bearer ${getEnv("HUGGINGFACE_API_KEY")}` },
    }
  );
  console.timeEnd("Infer sentiment");

  // Enumerate the comments and their inferred sentiment
  for (const [index, comment] of comments.entries()) {
    let inferredSentiment: CommentWithSentiment = {
      objectID: comment.objectID,
      parentID: comment.parent_id,
      storyID: comment.story_id,
      author: comment.author,
      commentText: comment.comment_text,
      storyUrl: comment.story_url,
      positive: 0,
      negative: 0,
      neutral: 0,
    };
    for (const sentiment of data[index]) {
      if (sentiment.label === POSITIVE) {
        inferredSentiment.positive = sentiment.score;
      } else if (sentiment.label === NEGATIVE) {
        inferredSentiment.negative = sentiment.score;
      } else {
        inferredSentiment.neutral = sentiment.score;
      }
    }
    inferredSentimentArray.push(inferredSentiment);
  }
  return inferredSentimentArray;
};
