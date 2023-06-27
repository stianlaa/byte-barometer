import {
  Box,
  Divider,
  Heading,
  Input,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import "./index.css";
import { useState, KeyboardEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { CommentWithSentiment } from "./Comment";
import Comment from "./Comment";

const VISIBLE_COMMENTS = 3;
const PORT = 3000;

// TODO replace with varying example
const exampleSubject = "Tesla";

function App() {
  const [queryString, setQueryString] = useState<string>(exampleSubject);
  const [positiveComments, setPositiveComments] = useState<
    CommentWithSentiment[]
  >([]);
  const [negativeComments, setNegativeComments] = useState<
    CommentWithSentiment[]
  >([]);

  const querySubject = (subject: string) => {
    axios
      .post(`http://localhost:${PORT}/query`, {
        query: subject,
        commentCount: 2,
      })
      .then((response: AxiosResponse<CommentWithSentiment[]>) => {
        console.log(response);
        const data = response.data;
        console.log(response);
        setPositiveComments(
          data.filter(({ positive, negative }) => positive > negative)
        );
        setNegativeComments(
          data.filter(({ positive, negative }) => positive < negative).reverse()
        );
      });
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
        <Input
          value={queryString}
          onChange={(e) => setQueryString(e.target.value)}
          m={5}
          p={5}
          placeholder={`What does hackernews think about.. ${exampleSubject}`}
          color="white"
          size="md"
          w="80%"
          onKeyDown={handleCompletion}
        />
      </Box>

      <Divider mt={"0.25rem"} mb={"0.25rem"} />

      <SimpleGrid columns={2} spacing={10}>
        <VStack h="auto">
          <Heading size="sm">Positive</Heading>
          {positiveComments.length > 0
            ? positiveComments
                .slice(0, VISIBLE_COMMENTS)
                .sort((a, b) => b.positive - a.positive)
                .map((comment) => (
                  <Comment key={comment.objectID} {...comment} />
                ))
            : null}
        </VStack>
        <VStack h="auto">
          <Heading size="sm">Negative</Heading>
          {negativeComments.length > 0
            ? negativeComments
                .slice(0, VISIBLE_COMMENTS)
                .sort((a, b) => b.negative - a.negative)
                .map((comment) => <Comment {...comment} />)
            : null}
        </VStack>
      </SimpleGrid>
    </Box>
  );
}

export default App;
