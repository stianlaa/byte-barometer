import axios from "axios";
import { getEnv } from "./util.js";
import { Comment } from "./hackernews-client.js";

const MODEL = "yangheng/deberta-v3-large-absa-v1.1";
const HUGGING_FACE_URL = "https://api-inference.huggingface.co/";

type Sentiment = {
  label: string;
  score: number;
};

type InferredSentiment = {
  comment_text: string;
  sentiment: Sentiment[];
};

export const inferSentiment = async (comments: Comment[]) => {
  const inferredSentimentArray: InferredSentiment[] = [];
  for (const comment of comments) {
    const { data } = await axios.post(
      `${HUGGING_FACE_URL}models/${MODEL}`,
      comment.comment_text,
      {
        headers: { Authorization: `Bearer ${getEnv("HUGGINGFACE_API_KEY")}` },
      }
    );
    inferredSentimentArray.push({
      comment_text: comment.comment_text,
      sentiment: data[0], // TODO add batch support somehow?
    });
  }
  return inferredSentimentArray;
};
