import axios from "axios";

const algoliaApiUrl = "http://hn.algolia.com/api/v1/";
const hitsPerPage = 1000;

const axiosClient = axios.create({
  baseURL: algoliaApiUrl,
});

type Comment = {
  id: number;
  created_at: string;
  author: string;
  text: string;
  points: number | null;
  parent_id: number;
};

type SearchResponse = {
  hits: Comment[];
  page: number;
  nbPages: number;
  hitsPerPage: number;
};

// TODO add date filter
// http://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>X,created_at_i<Y

export const fetchComments = async (
  query: string,
  pointLimit: number,
  commentCount: number
): Promise<Comment[]> => {
  const comments: Comment[] = [];

  try {
    // Query Algolia for the relevant comments until we have enough
    let page = 0;
    while (comments.length < commentCount) {
      const { data } = await axiosClient.get(
        `/search_by_date?query=${query}&tags=comment&page=${page}&hitsPerPage=${hitsPerPage}`
      );
      const response = data as SearchResponse;

      if (comments.length - response.hits.length > commentCount) {
        console.log("Grabbing all 1000: ", comments.length);
        comments.push.apply(comments, response.hits);
      } else {
        console.log("Slicing: ", commentCount - comments.length);
        comments.push.apply(
          comments,
          response.hits.slice(0, commentCount - comments.length)
        );
      }
      page += 1;
    }
  } catch (error) {
    console.error("Error during request: ", error);
  }

  console.log("Fetched", comments.length, "comments");

  return comments;
};
