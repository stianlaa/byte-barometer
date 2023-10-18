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
import { useState, useEffect, KeyboardEvent } from "react";
import { ArrowRightIcon } from "@chakra-ui/icons";
import { socket, QueryResponseBatch } from "./socket-setup";

type Query = {
  queryString: string;
  queryCommentCount: number;
};

export type QueryInputProps = {
  onReceiveResultBatch: (batch: CommentWithSentiment[]) => void;
};

function QueryInput({ onReceiveResultBatch }: QueryInputProps) {
  const [queryString, setQueryString] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const querySubject = async (queryString: string) => {
    setLoading(true);

    const query: Query = {
      queryString,
      queryCommentCount: 5,
    };
    socket.emit("query", query);

    setLoading(false);
  };

  const handleCompletion = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && queryString) querySubject(queryString);
  };

  useEffect(() => {
    if (!socket.hasListeners("queryresponse")) {
      socket.on("queryresponse", (batch: QueryResponseBatch) =>
        onReceiveResultBatch(batch.data)
      );
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
          onClick={() => querySubject(queryString)}
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
