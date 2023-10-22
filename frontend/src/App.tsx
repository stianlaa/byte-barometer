import "./index.css";
import { Box, Divider, Heading, SimpleGrid } from "@chakra-ui/react";
import { useState } from "react";
import { CommentWithSentiment } from "./Comment";
import OpinionVisualizer from "./OpinionVisualizer";
import QueryInput from "./QueryInput";
import CommentStack from "./CommentStack";

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
          positiveCount={comments.positive.length}
          neutralCount={comments.neutral.length}
          negativeCount={comments.negative.length}
        />
        <QueryInput setComments={setComments} />
      </Box>

      <Divider
        borderColor="grey.300"
        m="0.25rem auto 0.25rem auto"
        w="80%"
        borderWidth="2px 0 0 0"
      />
      <SimpleGrid columns={3} spacing={10}>
        <CommentStack headingText="Positive" comments={comments.positive} />
        <CommentStack headingText="Neutral" comments={comments.neutral} />
        <CommentStack headingText="Negative" comments={comments.negative} />
      </SimpleGrid>
    </Box>
  );
}

export default App;
