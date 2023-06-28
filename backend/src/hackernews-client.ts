import axios from "axios";

const ALGOLIA_API_URL = "http://hn.algolia.com/api/v1/";

const COMMENT_SIZE_LIMIT = 200;

export type Comment = {
  id: number;
  story_id: number;
  story_url: string;
  parent_id: number;
  objectID: number;
  created_at: string;
  author: string;
  comment_text: string;
  query_match: string;
  points: number | null;
};

type SearchResponse = {
  hits: Comment[];
  page: number;
  nbPages: number;
  hitsPerPage: number;
};

const queryMatch = (query: string, comment: Comment) => {
  // Extract the sentences surrounding the query string from the comment
  const commentText = comment.comment_text;
  if (commentText.includes(query)) {
    const queryIndex = commentText.indexOf(query);
    const start = Math.max(0, queryIndex - COMMENT_SIZE_LIMIT / 2);
    const end = Math.min(
      commentText.length,
      queryIndex + COMMENT_SIZE_LIMIT / 2
    );
    return commentText.substring(start, end);
  } else {
    // Return first 200 characters or entire comment if small enough
    return commentText.substring(0, COMMENT_SIZE_LIMIT);
  }
};

export const fetchComments = async (
  query: string,
  commentCount: number,
  fromSeconds: number
): Promise<Comment[]> => {
  const comments: Comment[] = [];

  try {
    // Query Algolia for the relevant comments until we have enough
    let page = 0;
    while (commentCount > comments.length) {
      const requestHits = Math.min(
        commentCount - comments.length,
        commentCount
      );
      const { data } = await axios.get<SearchResponse>(
        `${ALGOLIA_API_URL}search?query=${query}&tags=comment&page=${page}&hitsPerPage=${requestHits}&numericFilters=created_at_i>${fromSeconds}`
      );
      comments.push.apply(comments, data.hits);
      if (page + 1 < data.nbPages) {
        page += 1;
      } else {
        console.warn("No more pages to fetch", data.nbPages);
        break;
      }
    }
  } catch (error) {
    console.error("Error during request: ", error);
  }

  // Add the query match to the comment
  return comments.map((comment) => ({
    ...comment,
    query_match: queryMatch(query, comment),
  }));
};
