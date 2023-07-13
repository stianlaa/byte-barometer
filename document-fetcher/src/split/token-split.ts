import { encoding_for_model } from "tiktoken";

const chunkTokenLimit = 50;
export const embeddingModel = "text-embedding-ada-002";

export const tokenSplitText = (text: string): string[] => {
  // Token split strategy:
  // Goal: Take arbitrary text, and split it into chunks, each below N tokens.
  // 1. Take arbitrary string in, convert it to tokens as seen by the target model,
  // 2. For each of the splits, check if the length is below N tokens, otherwise repeat the process until we have a bunch of splits of sufficnet size.

  const encoder = encoding_for_model(embeddingModel);
  const encodedText = encoder.encode(text);

  const encodedTextArray: Uint32Array[] = [];
  recursiveTokenSplit(encodedText, (chunk) => encodedTextArray.push(chunk));

  const textDecoder = new TextDecoder();

  const chunks = encodedTextArray.map((c) => {
    const decodedTokens = encoder.decode(c);
    // Decode to text
    return textDecoder.decode(decodedTokens);
  });
  return chunks;
};

const recursiveTokenSplit = (
  encodedText: Uint32Array,
  persistChunk: (chunk: Uint32Array) => void
): void => {
  if (encodedText.length <= chunkTokenLimit) {
    persistChunk(encodedText);
  } else {
    const splitIndex = Math.floor(encodedText.length / 2);
    recursiveTokenSplit(encodedText.slice(0, splitIndex), persistChunk);
    recursiveTokenSplit(encodedText.slice(splitIndex), persistChunk);
  }
};
