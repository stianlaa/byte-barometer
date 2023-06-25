import * as dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response } from "express";
import { getCliArguments } from "./util.js";
import { handleQuery } from "./sentiment-service.js";

dotenv.config({ override: true });

// Define the shape of the data we expect in the body of the POST request
interface PostRequestBody {
  query: string;
  commentCount: number;
}

const run = async () => {
  // Get current run arguments
  const { query, commentCount } = getCliArguments();

  if (query && commentCount) {
    // If query and commentCount are provided, run the sentiment service
    const queryResult = await handleQuery(query, commentCount);
    console.debug("queryResult:", queryResult);
    return;
  } else {
    // If not, start the express server and listen for queries
    const port = 3000;

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.post<PostRequestBody>(
      "/query",
      async ({ body }: Request<PostRequestBody>, res: Response) => {
        const response = await handleQuery(body.query, body.commentCount);
        res.json(response);
      }
    );

    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  }
};

run();