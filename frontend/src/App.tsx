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
import "./index.css";
import { useState, KeyboardEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { CommentWithSentiment } from "./Comment";
import Comment from "./Comment";
import OpinionVisualizer from "./OpinionVisualizer";
import { Spinner } from "@chakra-ui/react";

const VISIBLE_COMMENTS = 5;
const REQUEST_COMMENTS = 30;
const PORT = 3000;

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [queryString, setQueryString] = useState<string>("");
  const [positiveComments, setPositiveComments] = useState<
    CommentWithSentiment[]
  >([]);
  const [negativeComments, setNegativeComments] = useState<
    CommentWithSentiment[]
  >([]);

  const querySubject = (subject: string) => {
    setLoading(true);
    axios
      .post(`http://localhost:${PORT}/query`, {
        query: subject,
        commentCount: REQUEST_COMMENTS,
      })
      .then((response: AxiosResponse<CommentWithSentiment[]>) => {
        const data = response.data;
        setPositiveComments(
          data.filter(({ positive, negative }) => positive > negative)
        );
        setNegativeComments(
          data.filter(({ positive, negative }) => positive < negative).reverse()
        );
      })
      .catch((error) => {
        console.log(error);
      });
    setLoading(false);
  };

  const handleCompletion = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && queryString) {
      querySubject(queryString);
    }
  };

  return (
    <Box w="100%" bgColor="var(--bg-dark)" color="var(--text-light)">
      <Box w="100%">
        <Heading>Byte Barometer</Heading>
        <Divider mt={"0.25rem"} mb={"0.25rem"} />

        <OpinionVisualizer
          positiveComments={positiveComments}
          negativeComments={negativeComments}
        />

        <InputGroup size="md" width={"50%"} mr="auto" ml="auto" mb={5}>
          <Input
            pr="9rem"
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            placeholder={`What does hackernews think about.. React.js`} // TODO: change to random subject
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
          {negativeComments.length > 0
            ? negativeComments
                .slice(0, VISIBLE_COMMENTS)
                .sort((a, b) => b.negative - a.negative)
                .map((comment) => (
                  <Comment key={comment.objectID} {...comment} />
                ))
            : null}
        </VStack>
        <VStack h="auto">
          <Heading size="sm" mt={"0.25rem"}>
            Positive
          </Heading>
          {positiveComments.length > 0
            ? positiveComments
                .slice(0, VISIBLE_COMMENTS)
                .sort((a, b) => b.positive - a.positive)
                .map((comment) => (
                  <Comment key={comment.objectID} {...comment} />
                ))
            : null}
        </VStack>
      </SimpleGrid>
    </Box>
  );
}

export default App;
