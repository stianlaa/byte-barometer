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
    console.log("queryResult:", queryResult);
    return;
  } else {
    // If not, start the express server and listen for queries
    const port = 3000;

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.post("/query", async (req: Request, res: Response) => {
      // TypeScript will now know the shape of req.body
      const body: PostRequestBody = req.body;

      console.log(`Query: ${body.query}`);
      console.log(`CommentCount: ${body.commentCount}`);

      const response = await handleQuery(body.query, body.commentCount);
      res.json(response);
    });

    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  }
};

run();
