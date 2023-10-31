import { io } from "socket.io-client";
import { CommentWithSentiment } from "./Comment";

const PATH = "localhost:3000";
// const PATH =
//   "https://d7448a61efcbb4bce938d4a324453df1d.clg07azjl.paperspacegradient.com/:3000";

export type QueryResponseBatch = { data: CommentWithSentiment[] };
export const socket = io(PATH);
