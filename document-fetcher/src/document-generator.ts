import { Comment } from "./comment-fetcher.js";
import { tokenSplitText } from "./split/token-split.js";
import { sentenceSplitText } from "./split/sentence-split.js";

export type Document = {
  id: string;
  text: string;
  author: string;
  storyUrl: string;
  createdAt: string;
  parentId: number;
};

const enum SplitStrategy {
  TOKEN_SPLIT,
  SENTENCE_SPLIT,
}

const splitText = (splitStrategy: SplitStrategy, text: string): string[] => {
  switch (splitStrategy) {
    case SplitStrategy.TOKEN_SPLIT:
      return tokenSplitText(text);
    case SplitStrategy.SENTENCE_SPLIT:
      return sentenceSplitText(text);
  }
};

export const createDocuments = (comments: Comment[]): Document[] => {
  const documents: Document[] = [];

  for (const {
    id,
    commentText,
    author,
    storyUrl,
    createdAt,
    parentId,
  } of comments) {
    splitText(SplitStrategy.SENTENCE_SPLIT, commentText).forEach(
      (chunk, chunkIndex) => {
        documents.push({
          id: `${id}-${chunkIndex}`,
          text: chunk.trim(),
          author: author,
          storyUrl: storyUrl,
          createdAt: createdAt,
          parentId: parentId,
        });
      }
    );
  }
  return documents;
};
