import {
  Box,
  Button,
  Divider,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { ArrowRightIcon } from "@chakra-ui/icons";
import { useState, KeyboardEvent } from "react";
import axios from "axios";
import { CommentWithSentiment } from "./Comment";
import Comment from "./Comment";
import OpinionVisualizer from "./OpinionVisualizer";
import { Spinner } from "@chakra-ui/react";
import {
  NEGATIVE,
  NEUTRAL,
  PORT,
  POSITIVE,
  REQUEST_COMMENTS,
  VISIBLE_COMMENTS,
} from "./constants";
import "./index.css";

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [queryString, setQueryString] = useState<string>("");
  const [groupedComments, setGroupedComments] = useState<
    Map<string, CommentWithSentiment[]> | undefined
  >(undefined);

  const querySubject = async (query: string) => {
    setLoading(true);
    const response = await axios.post<CommentWithSentiment[]>(
      `http://localhost:${PORT}/query`,
      {
        query,
        commentCount: REQUEST_COMMENTS,
      }
    );
    setGroupedComments(
      response.data.reduce(
        (acc, comment) => {
          acc.get(comment.sentiment.label)?.push(comment);
          return acc;
        },
        new Map<string, CommentWithSentiment[]>([
          [POSITIVE, []],
          [NEUTRAL, []],
          [NEGATIVE, []],
        ])
      )
    );

    setLoading(false);
  };

  const handleCompletion = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && queryString) {
      querySubject(queryString);
    }
  };

  return (
    <Box boxShadow="dark-lg" height="100vh" overflow="scroll">
      <Box>
        <Heading pt="1rem">Byte Barometer</Heading>
        <Divider pt="1rem" mb="0.25rem" mr="auto" ml="auto" w="50%" />

        <OpinionVisualizer groupedComments={groupedComments} />

        <InputGroup size="md" width={"50%"} mr="auto" ml="auto" mb={5}>
          <Input
            pr="9rem"
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            placeholder={`What does Hackernews think about.. React.js`} // TODO: change to random subject
            color="white"
            onKeyDown={handleCompletion}
          />
          <InputRightElement>
            <Button
              onClick={() => {
                querySubject(queryString);
              }}
            >
              {loading ? (
                <Box>
                  <Spinner />
                </Box>
              ) : (
                <ArrowRightIcon />
              )}
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>

      <Divider mt={"0.25rem"} mb={"0.25rem"} />

      <SimpleGrid columns={2} spacing={10}>
        <VStack h="auto">
          <Heading size="sm" mt={"0.25rem"}>
            Negative
          </Heading>
          {groupedComments
            ?.get(NEGATIVE)
            ?.slice(0, VISIBLE_COMMENTS)
            .sort((a, b) => b.sentiment.score - a.sentiment.score)
            .map((comment) => (
              <Comment key={comment.id} {...comment} />
            ))}
        </VStack>
        <VStack h="auto">
          <Heading size="sm" mt={"0.25rem"}>
            Positive
          </Heading>
          {groupedComments
            ?.get(POSITIVE)
            ?.slice(0, VISIBLE_COMMENTS)
            .sort((a, b) => b.sentiment.score - a.sentiment.score)
            .map((comment) => (
              <Comment key={comment.id} {...comment} />
            ))}
        </VStack>
      </SimpleGrid>
    </Box>
  );
}

export default App;
