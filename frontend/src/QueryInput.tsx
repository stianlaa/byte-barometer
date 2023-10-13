import "./index.css";
import { CommentWithSentiment } from "./Comment";
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { io } from "socket.io-client";
import { ArrowRightIcon } from "@chakra-ui/icons";

const PATH = "localhost:3000";

type QueryResponseBatch = { data: CommentWithSentiment[] };

export type QueryInputProps = {
  onQuery: () => void;
  onReceiveResultBatch: (batch: CommentWithSentiment[]) => void;
};

function QueryInput({ onQuery, onReceiveResultBatch }: QueryInputProps) {
  const [queryString, setQueryString] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const socket = useRef(io(PATH));

  const querySubject = async (queryString: string) => {
    setLoading(true);
    onQuery();
    socket.current.emit("query", { queryString });
    setLoading(false);
  };

  const handleCompletion = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && queryString) querySubject(queryString);
  };

  useEffect(() => {
    if (!socket.current.hasListeners("queryresponse")) {
      socket.current.on("queryresponse", (batch: QueryResponseBatch) => {
        console.log("Result received", batch);
        onReceiveResultBatch(batch.data);
      });

      console.log(socket.current);
    }
  }, []);

  return (
    <InputGroup
      size="lg"
      width={"75%"}
      mr="auto"
      ml="auto"
      mb={5}
      // TODO Style with gradient border trick
      // background: linear-gradient(to right, red, purple);
      // padding: 3px;
    >
      <Input
        fontSize={20}
        color="grey.900"
        bgColor="beige.500"
        borderColor="grey.500"
        value={queryString}
        onChange={(e) => setQueryString(e.target.value)}
        placeholder={`What does Hackernews think about.. Rust?`} // TODO: change to random subject
        onKeyDown={handleCompletion}
      />
      <InputRightElement>
        <Button
          size="s"
          bgColor="beige.500"
          onClick={() => {
            querySubject(queryString);
          }}
        >
          {loading ? (
            <Box bgColor="beige.500">
              <Spinner />
            </Box>
          ) : (
            <ArrowRightIcon />
          )}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}

export default QueryInput;
