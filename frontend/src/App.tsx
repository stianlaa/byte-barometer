import "./index.css";
import { Box, Divider, Heading, SimpleGrid, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { CommentWithSentiment } from "./Comment";
import Comment from "./Comment";
import OpinionVisualizer from "./OpinionVisualizer";
import { NEGATIVE, NEUTRAL, POSITIVE, VISIBLE_COMMENTS } from "./constants";
import QueryInput from "./QueryInput";

export type StateType = {
  positive: CommentWithSentiment[];
  neutral: CommentWithSentiment[];
  negative: CommentWithSentiment[];
};

function App() {
  const initialState: StateType = {
    positive: [],
    neutral: [],
    negative: [],
  };

  const [comments, setComments] = useState<StateType>(initialState);

  const onReceiveResultBatch = (receivedComments: CommentWithSentiment[]) => {
    const state: StateType = { ...comments };
    receivedComments.forEach((comment) => {
      switch (comment.sentiment.label) {
        case POSITIVE:
          state.positive.push(comment);
          break;
        case NEUTRAL:
          state.neutral.push(comment);
          break;
        case NEGATIVE:
          state.negative.push(comment);
          break;
        default:
          break;
      }
    });
    setComments(state);
  };

  return (
    <Box height="100vh" overflow="scroll">
      <Box>
        <Heading pt="1rem">Byte Barometer</Heading>
        <Divider
          borderColor="grey.500"
          pt="1rem"
          mb="0.25rem"
          mr="auto"
          ml="auto"
          w="50%"
        />
        <OpinionVisualizer
          positiveCount={comments.positive.length}
          neutralCount={comments.neutral.length}
          negativeCount={comments.negative.length}
        />
        <QueryInput onReceiveResultBatch={onReceiveResultBatch} />
      </Box>

      <Divider borderColor="grey.500" mt={"0.25rem"} mb={"0.25rem"} />

      <SimpleGrid columns={3} spacing={10}>
        <VStack h="auto" ml="1rem">
          <Heading size="xl" mt={"0.25rem"}>
            Positive
          </Heading>
          {comments.positive
            ?.slice(0, VISIBLE_COMMENTS)
            .sort((a, b) => b.sentiment.score - a.sentiment.score)
            .map((comment) => (
              <Comment key={`positive-${comment.id}`} {...comment} />
            ))}
        </VStack>
        <VStack h="auto" mr="1rem">
          <Heading size="xl" mt={"0.25rem"}>
            Neutral
          </Heading>
          {comments.neutral
            ?.slice(0, VISIBLE_COMMENTS)
            .sort((a, b) => b.sentiment.score - a.sentiment.score)
            .map((comment) => (
              <Comment key={`neutral-${comment.id}`} {...comment} />
            ))}
        </VStack>
        <VStack h="auto" mr="1rem">
          <Heading size="xl" mt={"0.25rem"}>
            Negative
          </Heading>
          {comments.negative
            ?.slice(0, VISIBLE_COMMENTS)
            .sort((a, b) => b.sentiment.score - a.sentiment.score)
            .map((comment) => (
              <Comment key={`negative-${comment.id}`} {...comment} />
            ))}
        </VStack>
      </SimpleGrid>
    </Box>
  );
}

export default App;
