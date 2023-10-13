import { Box, Divider, Heading, SimpleGrid, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { CommentWithSentiment } from "./Comment";
import Comment from "./Comment";
import OpinionVisualizer from "./OpinionVisualizer";
import { NEGATIVE, NEUTRAL, POSITIVE, VISIBLE_COMMENTS } from "./constants";
import "./index.css";
import QueryInput from "./QueryInput";

const emptyMap = () => {
  return new Map<string, CommentWithSentiment[]>([
    [POSITIVE, []],
    [NEUTRAL, []],
    [NEGATIVE, []],
  ]);
};

function App() {
  const [groupedComments, setGroupedComments] = useState(emptyMap());

  const onQuery = () => setGroupedComments(emptyMap);
  const onReceiveResultBatch = (comments: CommentWithSentiment[]) => {
    // TODO have to use setState
    const extendedMap = new Map<string, CommentWithSentiment[]>(
      groupedComments
    );
    comments.forEach((comment) => {
      console.log("Pushing ", comment);
      groupedComments.get(comment.sentiment.label)?.push(comment);
      console.log("Result ", groupedComments);
    });
    setGroupedComments(extendedMap);
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

        <OpinionVisualizer groupedComments={groupedComments} />
        <QueryInput
          onQuery={onQuery}
          onReceiveResultBatch={onReceiveResultBatch}
        />
      </Box>

      <Divider borderColor="grey.500" mt={"0.25rem"} mb={"0.25rem"} />

      <SimpleGrid columns={2} spacing={10}>
        <VStack h="auto" ml="1rem">
          <Heading size="xl" mt={"0.25rem"}>
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
        <VStack h="auto" mr="1rem">
          <Heading size="xl" mt={"0.25rem"}>
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
      </SimpleGrid>
    </Box>
  );
}

export default App;
