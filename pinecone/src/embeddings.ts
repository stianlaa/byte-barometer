import { Configuration, CreateEmbeddingResponse, OpenAIApi } from "openai";
import { Vector } from "@pinecone-database/pinecone";
import { getEnv, sliceIntoChunks } from "./util.js";
import { Document } from "./document-generator.js";

// $0.0001 / 1K tokens
// TODO - add tokenizing and pricing calculation to the script
export const EMBEDDING_MODEL = "text-embedding-ada-002";

type EmbeddingResult = {
  id: string;
  metadata: {
    text: string;
  };
  values: number[];
};

class Embedder {
  openaiClient: OpenAIApi | null = null;

  // Initialize the pipeline
  async init() {
    const configuration = new Configuration({
      apiKey: getEnv("OPENAI_API_KEY"),
    });
    this.openaiClient = new OpenAIApi(configuration);
  }

  // Embed a single string
  async embed(document: Document): Promise<EmbeddingResult[]> {
    const { id, text } = document;

    if (!this.openaiClient) throw new Error("OpenAI client not initialized");

    let data: CreateEmbeddingResponse | null = null;

    for (let i = 0; i < 10; i++) {
      try {
        const response = await this.openaiClient.createEmbedding({
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
  }

  // Batch an array of string and embed each batch
  // Call onDoneBatch with the embeddings of each batch
  async embedBatch(
    documents: Document[],
    batchSize: number,
    onDoneBatch: (embeddings: Vector[]) => void
  ) {
    const batches = sliceIntoChunks<Document>(documents, batchSize);
    for (const batch of batches) {
      console.time("Embedding batch");
      const embeddings = await Promise.all(
        batch.map((document) => this.embed(document))
      );
      console.timeEnd("Embedding batch");

      await onDoneBatch(embeddings.flatMap((embedding) => embedding));
    }
  }
}

const embedder = new Embedder();

export { embedder };
