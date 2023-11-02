import { CommentWithSentiment } from "../comments/Comment";
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import {
  useState,
  useEffect,
  KeyboardEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { ArrowRightIcon } from "@chakra-ui/icons";
import { socket, QueryResponseBatch } from "../../socket-setup";
import { GroupedComments } from "../../App";
import {
  EXAMPLE_SUBJECTS,
  NEGATIVE,
  NEUTRAL,
  POSITIVE,
  QUERY_COMMENT_COUNT,
} from "../../constants";

type Query = {
  queryCommentCount: number;
  queryString: string;
};

export type QueryInputProps = {
  setComments: Dispatch<SetStateAction<GroupedComments>>;
};

const exampleSubject =
  EXAMPLE_SUBJECTS[Math.floor(Math.random() * EXAMPLE_SUBJECTS.length)];

function QueryInput({ setComments }: QueryInputProps) {
  const [queryString, setQueryString] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const querySubject = async (queryString: string) => {
    setLoading(true);
    setComments({
      positive: [],
      neutral: [],
      negative: [],
    });
    const query: Query = {
      queryString,
      queryCommentCount: QUERY_COMMENT_COUNT,
    };
    socket.emit("query", query);
  };

  const handleCompletion = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && queryString) querySubject(queryString);
  };

  useEffect(() => {
    const onReceiveResultBatch = (receivedComments: CommentWithSentiment[]) => {
      setComments((prevComments: GroupedComments) => {
        const newGroupedComments: GroupedComments = {
          positive: [...prevComments.positive],
          neutral: [...prevComments.neutral],
          negative: [...prevComments.negative],
        };

        receivedComments.forEach((comment) => {
          switch (comment.sentiment.label) {
            case POSITIVE:
              newGroupedComments.positive.push(comment);
              break;
            case NEUTRAL:
              newGroupedComments.neutral.push(comment);
              break;
            case NEGATIVE:
              newGroupedComments.negative.push(comment);
              break;
            default:
              break;
          }
        });
        return newGroupedComments;
      });
    };

    if (!socket.hasListeners("queryresponse")) {
      socket.on("queryresponse", (batch: QueryResponseBatch) => {
        onReceiveResultBatch(batch.data);
        setLoading(false);
      });
    }
    // Only setComments as dependency since we're now working with the latest state directly in setComments
  }, [setComments]);

  return (
    <InputGroup size="lg" width={"75%"} mr="auto" ml="auto" mb={5}>
      <Input
        fontSize={20}
        color="grey.900"
        bgColor="beige.500"
        borderColor="grey.500"
        value={queryString}
        onChange={(e) => setQueryString(e.target.value)}
        placeholder={`What does Hackernews think about.. ${exampleSubject}?`}
        onKeyDown={handleCompletion}
        sx={{
          "::placeholder": {
            color: "black",
          },
        }}
      />
      <InputRightElement>
        {/* TODO use, dedicated spinner function */}
        {/* https://chakra-ui.com/docs/components/icon-button/props */}

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
