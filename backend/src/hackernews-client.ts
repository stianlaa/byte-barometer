import axios from "axios";

const ALGOLIA_API_URL = "http://hn.algolia.com/api/v1/";

export type Comment = {
  id: number;
  story_id: number;
  story_url: string;
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
  return comments;
};
