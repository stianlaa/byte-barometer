import { DocumentWithId } from "./embeddings.js";
import axios from "axios";

const ALGOLIA_API_URL = "http://hn.algolia.com/api/v1/";
const DOCUMENT_SIZE_LIMIT = 200;

type StoryItem = {
  objectID: string;
  title: string;
  points: number;
  url: string;
  num_comments: number;
  created_at: string;
};

type StoryResponse = {
  hits: StoryItem[];
  page: number;
  nbPages: number;
  hitsPerPage: number;
};

type CommentItem = {
  objectID: string;
  author: string;
  story_url: string;
  comment_text: string;
  created_at: string;
  parent_id: number;
};

type CommentResponse = {
  hits: CommentItem[];
  page: number;
  nbPages: number;
  hitsPerPage: number;
};

// TODO Which embedding model are you using, and what chunk sizes does it perform optimally on? For instance, sentence-transformer models work well on individual sentences, but a model like text-embedding-ada-002 performs better on chunks containing 256 or 512 tokens.
// TODO Make sensible chunks: https://www.pinecone.io/learn/chunking-strategies/
const chunkComment = (comment: CommentItem): DocumentWithId[] => {
  const documents: DocumentWithId[] = [];

  // Simple, naive chunking, count up to character limit
  const commentText = comment.comment_text;

  // TODO remove htmltags and other noise
  // TODO alternatively, investigate direct fetching from HN API
  let start = 0;
  let end = DOCUMENT_SIZE_LIMIT;
  let chunk = 0;
  while (start < commentText.length) {
    documents.push({
      id: `${comment.objectID}-${chunk++}`,
      text: commentText.substring(start, end),
    });
    start = end;
    end = Math.min(commentText.length, end + DOCUMENT_SIZE_LIMIT);
  }
  return documents;
};

export const getDocuments = async (
  commentCount: number
): Promise<DocumentWithId[]> => {
  const documents: DocumentWithId[] = [];
  const hitsPerPage = 10;
  const pageLimit = 10;

  try {
    // Outer loop, fetch frontpage stories from newest to oldest
    for (let storyPage = 0; storyPage < pageLimit; storyPage++) {
      const storyResponse = await axios.get<StoryResponse>(
        `${ALGOLIA_API_URL}search_by_date?tags=story,front_page&page=${storyPage}&hitsPerPage=${hitsPerPage}`
      );

      // Mid loop, iterate over comments from each story
      for (let { objectID } of storyResponse.data.hits) {
        for (let commentPage = 0; commentPage < pageLimit; commentPage++) {
          const commentResponse = await axios.get<CommentResponse>(
            `${ALGOLIA_API_URL}search?tags=comment,story_${objectID}&page=${commentPage}&hitsPerPage=${hitsPerPage}`
          );

          // Inner loops, process comments into persistable documents
          for (let comment of commentResponse.data.hits) {
            const commentDocuments = chunkComment(comment);

            for (let document of commentDocuments) {
              if (documents.length >= commentCount) {
                return documents;
              }
              documents.push(document);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error during request: ", error);
  }

  return documents;
};
