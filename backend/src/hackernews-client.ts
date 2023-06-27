import axios from "axios";

const ALGOLIA_API_URL = "http://hn.algolia.com/api/v1/";
const hitsPerPage = 100;

export type Comment = {
  id: number;
  story_id: number;
  parent_id: number;
  objectID: number;
  created_at: string;
  author: string;
  comment_text: string;
  points: number | null;
};

type SearchResponse = {
  hits: Comment[];
  page: number;
  nbPages: number;
  hitsPerPage: number;
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
    while (comments.length < commentCount) {
      const { data } = await axios.get(
        `${ALGOLIA_API_URL}search_by_date?query=${query}&tags=comment&page=${page}&hitsPerPage=${hitsPerPage}&numericFilters=created_at_i>${fromSeconds}`
      );
      const { hits } = data as SearchResponse;
      if (hits.length + comments.length < commentCount) {
        // If we have room for all the comments, just add them
        comments.push.apply(comments, hits);
      } else {
        // Otherwise, we need to slice the response to get the right number of comments
        const commentSlice = hits.slice(0, commentCount - hitsPerPage);
        comments.push.apply(comments, commentSlice);
      }

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
  return comments;
};
