import axios, { AxiosError, AxiosResponse } from "axios";
import { getEnv } from "./util.js";
import { Comment } from "./hackernews-client.js";

const MAX_RETRIES = 5;
const DELAY = 5000;
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
  queryMatch: string;
  positive: number;
  negative: number;
  neutral: number;
  storyUrl: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Await huggingface model loaded
export const awaitModelLoaded = async () => {
  let retries = 0;
  while (retries <= MAX_RETRIES) {
    try {
      const response: AxiosResponse = await axios.get(
        `${HUGGING_FACE_URL}models/${MODEL}`,
        {
          headers: { Authorization: `Bearer ${getEnv("HUGGINGFACE_API_KEY")}` },
        }
      );
      return response.data; // If successful, return the data
    } catch (error: any) {
      console.log("ERROR: ", error);

      if (error.response && error.response.status === 503) {
        retries++;
        console.log(
          `Request failed with status code 503. Retry attempt: ${retries}`
        );
        await delay(DELAY); // If a 503 error, delay the next request
      } else {
        throw error; // If it's a different error, throw it
      }
    }
  }
  console.log("Model is loaded");
};

export const inferSentiment = async (
  query: string,
  comments: Comment[]
): Promise<CommentWithSentiment[]> => {
  const inferredSentimentArray: CommentWithSentiment[] = [];
  const inputs = comments.map(
    (comment) => `[CLS] ${comment.query_match} [SEP] ${query} [SEP]`
  );

  if (inputs.length === 0) {
    console.log("No comments to infer sentiment");
    return [];
  } else {
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
        queryMatch: comment.query_match,
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
  }
  return inferredSentimentArray;
};
