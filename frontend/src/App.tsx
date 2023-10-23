import "./index.css";
import { Box, Divider, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { CommentWithSentiment } from "./Comment";
import OpinionVisualizer from "./OpinionVisualizer";
import QueryInput from "./QueryInput";
import CommentDisplay from "./CommentDisplay";
import { RELEVANCE_LIMIT } from "./constants";

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
  const relevantComments: GroupedComments = {
    positive: comments.positive.filter((c) => c.score > RELEVANCE_LIMIT),
    neutral: comments.neutral.filter((c) => c.score > RELEVANCE_LIMIT),
    negative: comments.negative.filter((c) => c.score > RELEVANCE_LIMIT),
  };

  return (
    <Box
      height="100vh"
      overflowY="scroll"
      sx={{
        "::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
      }}
    >
      <Box>
        <Heading pt="1rem">Byte Barometer</Heading>
        <Divider
          borderColor="grey.300"
          m="0.25rem  auto 0.25rem auto"
          w="33%"
          borderWidth="2px 0 0 0"
        />
        <OpinionVisualizer
          positiveCount={relevantComments.positive.length}
          neutralCount={relevantComments.neutral.length}
          negativeCount={relevantComments.negative.length}
        />
        <QueryInput setComments={setComments} />
      </Box>

      <Divider
        borderColor="grey.300"
        m="0.25rem auto 0.25rem auto"
        w="80%"
        borderWidth="2px 0 0 0"
      />
      <CommentDisplay comments={comments} relevantComments={relevantComments} />
    </Box>
  );
}

export default App;
