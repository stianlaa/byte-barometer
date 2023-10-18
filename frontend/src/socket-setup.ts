import { io } from "socket.io-client";
import { CommentWithSentiment } from "./Comment";

const PATH = "localhost:3000";

export type QueryResponseBatch = { data: CommentWithSentiment[] };
export const socket = io(PATH);

socket.on("connection", async (socket: any) => {
  socket.onAny((temp: any) => {
    console.log("Onany: ", temp);
  });
});
