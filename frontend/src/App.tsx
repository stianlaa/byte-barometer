import "./index.css";
import { Box, Divider, Heading, SimpleGrid, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { CommentWithSentiment } from "./Comment";
import Comment from "./Comment";
import OpinionVisualizer from "./OpinionVisualizer";
import { VISIBLE_COMMENTS } from "./constants";
import QueryInput from "./QueryInput";

export type GroupedComments = {
  positive: CommentWithSentiment[];
  neutral: CommentWithSentiment[];
  negative: CommentWithSentiment[];
};

function App() {
  const [comments, setComments] = useState<GroupedComments>({
    positive: [],
    neutral: [],
    negative: [],
  });

  return (
    <Box
      height="100vh"
      overflowY="scroll"
      sx={{
        "::-webkit-scrollbar": {
          display: "none",
        },
        "scrollbar-width": "none",
      }}
    >
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
        <Heading pt="1rem">
          {comments.positive.length +
            comments.neutral.length +
            comments.negative.length}
        </Heading>
        <OpinionVisualizer
          positiveCount={comments.positive.length}
          neutralCount={comments.neutral.length}
          negativeCount={comments.negative.length}
        />
        <QueryInput setComments={setComments} />
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
