import { Configuration, CreateEmbeddingResponse, OpenAIApi } from "openai";
import { Vector } from "@pinecone-database/pinecone";
import { getEnv } from "./util.js";
import { Document } from "./document-generator.js";
import { config } from "dotenv";

config();

// $0.0001 / 1K tokens
// TODO - add tokenizing and pricing calculation to the script
export const EMBEDDING_MODEL = "text-embedding-ada-002";

const configuration = new Configuration({
  apiKey: getEnv("OPENAI_API_KEY"),
});
const openaiClient = new OpenAIApi(configuration);

type EmbeddingResult = {
  id: string;
  metadata: {
    text: string;
  };
  values: number[];
};

export const embed = async (document: Document): Promise<EmbeddingResult[]> => {
  const { id, text } = document;
  if (!openaiClient) throw new Error("OpenAI client not initialized");

  let data: CreateEmbeddingResponse | null = null;

  for (let i = 0; i < 10; i++) {
    try {
      const response = await openaiClient.createEmbedding({
        model: EMBEDDING_MODEL,
        input: text,
      });
      data = response.data;
      break;
    } catch (e) {
      console.warn(e);
      // Wait for increasing amount of time
      await new Promise((resolve) => setTimeout(resolve, 1000 * i));
    }
  }

  return data
    ? data.data.map((embeddingResult) => {
        return {
          id,
          metadata: {
            text,
          },
          values: embeddingResult.embedding,
        };
      })
    : [];
};

export const createEmbeddings = async (
  batch: Document[]
): Promise<Vector[]> => {
  return await Promise.all(batch.map((document) => embed(document)))
    .then((embeddings) => embeddings.flat())
    .then((embeddings) =>
      embeddings.map((embedding) => {
        return {
          id: embedding.id,
          metadata: embedding.metadata,
          values: embedding.values,
        };
      })
    );
};
