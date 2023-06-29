import { Configuration, OpenAIApi } from "openai";
import { Vector } from "@pinecone-database/pinecone";
import { getEnv, sliceIntoChunks } from "./util.js";

export type DocumentWithId = {
  id: string;
  text: string;
};

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
  async embed(document: DocumentWithId): Promise<EmbeddingResult[]> {
    const { id, text } = document;

    if (!this.openaiClient) throw new Error("OpenAI client not initialized");

    const { data } = await this.openaiClient.createEmbedding({
      model: "text-embedding-ada-002",
      input: text,
    });

    return data.data.map((embeddingResult) => {
      return {
        id,
        metadata: {
          text,
        },
        values: embeddingResult.embedding,
      };
    });
  }

  // Batch an array of string and embed each batch
  // Call onDoneBatch with the embeddings of each batch
  async embedBatch(
    documents: DocumentWithId[],
    batchSize: number,
    onDoneBatch: (embeddings: Vector[]) => void
  ) {
    const batches = sliceIntoChunks<DocumentWithId>(documents, batchSize);
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
