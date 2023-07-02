import { encoding_for_model } from "tiktoken";
import { EMBEDDING_MODEL } from "../embeddings.js";
import { tokenSplitText } from "./token-split.js";

const chunkMinTokenLimit = 15;
const chunkMaxTokenLimit = 200;

const separators = ["\\.", "\\!", "\\?", "\\n"];
export const sentenceSplitText = (text: string): string[] => {
  // Sentence split strategy:
  // Goal: Take arbitrary text, and split it into chunks, each below N tokens. This is done by looking forward to next potential text split, creating the candidate chunk and checking if it is below N tokens.

  // 1. Take arbitrary string in, split it by the separators.
  // 2. From the start select first split element, count the token length of current chunk.
  // 3. If the token length is below N, add the next split element to the current chunk, and repeat step 3.
  const encoder = encoding_for_model(EMBEDDING_MODEL);

  const chunks: string[] = [];
  const splitText = text.split(new RegExp(separators.join("|"), "g"));

  let chunkAggregate = "";
  for (let i = 0; i < splitText.length; i++) {
    const candidateChunk = chunkAggregate + splitText[i];

    // Count the tokens in the candidate chunk
    const encodedCandidateText = encoder.encode(candidateChunk);
    const tokenLength = encodedCandidateText.length;

    if (tokenLength > chunkMaxTokenLimit) {
      console.warn(`Chunk too large: ${candidateChunk}`);
      const splitChunks = tokenSplitText(candidateChunk);
      chunks.push(...splitChunks);
      chunkAggregate = "";
    } else if (tokenLength > chunkMinTokenLimit) {
      // The candidate is sufficiently large, so we can add it to the chunks and reset the aggregate
      chunks.push(candidateChunk);
      chunkAggregate = "";
    } else {
      // The candidate is still too small, so the aggregate is now he candidate
      chunkAggregate = candidateChunk;
    }
  }
  return chunks;
};
