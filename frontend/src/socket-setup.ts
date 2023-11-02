import { io } from "socket.io-client";
import { CommentWithSentiment } from "./components/comments/Comment";

const ENV = process.env.NODE_ENV;

const DEV_URL = "localhost:3000";
const PRODUCTION_URL =
  "https://dea6478627e3f46ecb2eeefe0e841eb8f.clg07azjl.paperspacegradient.com";

const URL = ENV === "development" ? DEV_URL : PRODUCTION_URL;

export type QueryResponseBatch = { data: CommentWithSentiment[] };
export const socket = io(URL);
