import axios from "axios";

const ALGOLIA_API_URL = "http://hn.algolia.com/api/v1/";

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

export type Comment = {
  id: string;
  author: string;
  storyUrl: string;
  commentText: string;
  createdAt: string;
  parentId: number;
};

export type CommentQueryResult = {
  comments: Comment[];
  from: number;
  to: number;
};

export const getComments = async (
  from: number,
  to: number
): Promise<Comment[]> => {
  const comments: Comment[] = [];
  const hitsPerPage = 100;
  const pageLimit = 100;

  try {
    // Outer loop, fetch frontpage stories from newest to oldest
    for (let storyPage = 0; storyPage < pageLimit; storyPage++) {
      const storyResponse = await axios.get<StoryResponse>(
        `${ALGOLIA_API_URL}search_by_date?tags=story,front_page&page=${storyPage}&hitsPerPage=${hitsPerPage}&numericFilters=created_at_i>${from},created_at_i<${to}`
      );

      // Mid loop, iterate over comments from each story
      for (let { objectID } of storyResponse.data.hits) {
        for (let commentPage = 0; commentPage < pageLimit; commentPage++) {
          const commentResponse = await axios.get<CommentResponse>(
            `${ALGOLIA_API_URL}search?tags=comment,story_${objectID}&page=${commentPage}&hitsPerPage=${hitsPerPage}`
          );

          // Inner loops, process comments into persistable documents
          for (let comment of commentResponse.data.hits) {
            comments.push({
              id: comment.objectID,
              author: comment.author,
              storyUrl: comment.story_url,
              commentText: comment.comment_text,
              createdAt: comment.created_at,
              parentId: comment.parent_id,
            });
          }

          if (commentPage >= commentResponse.data.nbPages) break;
        }
      }

      if (storyPage >= storyResponse.data.nbPages) break;
    }
  } catch (error) {
    console.error("Error during request: ", error);
  }
  return comments;
};
