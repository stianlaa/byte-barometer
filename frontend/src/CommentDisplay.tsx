import { useState } from "react";
import {
  SimpleGrid,
  HStack,
  Box,
  Button,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { GroupedComments } from "./App";
import CommentStack from "./CommentStack";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { CommentWithSentiment } from "./Comment";
import { NEGATIVE, POSITIVE } from "./constants";

type CommentDisplayProps = {
  comments: GroupedComments;
  relevantComments: GroupedComments;
};

type ToggleViewButtonProps = {
  text: string;
  enabled: boolean;
  onClick: () => void;
};

function ToggleViewButton({ text, enabled, onClick }: ToggleViewButtonProps) {
  return (
    <Flex direction="column" alignItems="flex-start">
      <Button
        color="beige.500"
        bgColor="transparent"
        size="s"
        onClick={onClick}
      >
        <Box p="0.25rem 0.25rem 0.25rem 0 ">
          {text}
          {enabled ? (
            <ViewIcon ml="0.25rem" bgColor="transparent" />
          ) : (
            <ViewOffIcon ml="0.25rem" bgColor="transparent" />
          )}
        </Box>
      </Button>
    </Flex>
  );
}

function CommentDisplay({ comments, relevantComments }: CommentDisplayProps) {
  const [showPositive, setShowPositive] = useState<boolean>(true);
  const [showNeutral, setShowNeutral] = useState<boolean>(false);
  const [showNegative, setShowNegative] = useState<boolean>(true);

  const allComments = comments.positive.concat(
    comments.neutral,
    comments.negative
  );
  const allRelevantComments = relevantComments.positive.concat(
    relevantComments.neutral,
    relevantComments.negative
  );

  const columnCount =
    (showPositive ? 1 : 0) + (showNeutral ? 1 : 0) + (showNegative ? 1 : 0);

  const summarizeSentiment = (comments: CommentWithSentiment[]) => {
    const averageSentiment =
      comments
        .map(({ sentiment }) => {
          if (sentiment.label === POSITIVE) return sentiment.score;
          if (sentiment.label === NEGATIVE) return -sentiment.score;
          return 0.0;
        })
        .reduce((partialSum, entry) => partialSum + entry, 0) / comments.length;

    if (averageSentiment > 0.15) {
      return "Good " + averageSentiment.toFixed(2);
    } else if (averageSentiment < -0.15) {
      return "Bad " + averageSentiment.toFixed(2);
    }
    return "Neutral " + averageSentiment.toFixed(2);
  };

  return (
    <>
      <HStack>
        {allComments.length > 0 ? (
          <>
            <Box w="40%">
              <Heading>{summarizeSentiment(allComments)}</Heading>
            </Box>
            <Flex w="30%" direction="column" alignItems="flex-start">
              <p>{allRelevantComments.length} Relevant comments, of which</p>
              <p>{relevantComments.positive.length} are positive</p>
              <p>{relevantComments.negative.length} are negative</p>
            </Flex>
          </>
        ) : (
          <Box w="70%">Awaiting results</Box>
        )}

        <Flex direction="column" alignItems="flex-start">
          <ToggleViewButton
            text="Positive"
            enabled={showPositive}
            onClick={() => setShowPositive(!showPositive)}
          />
          <ToggleViewButton
            text="Neutral"
            enabled={showNeutral}
            onClick={() => setShowNeutral(!showNeutral)}
          />
          <ToggleViewButton
            text="Negative"
            enabled={showNegative}
            onClick={() => setShowNegative(!showNegative)}
          />
        </Flex>
      </HStack>

      <SimpleGrid columns={columnCount} spacing={10}>
        {showPositive && (
          <CommentStack
            headingText="Positive"
            comments={relevantComments.positive}
          />
        )}
        {showNeutral && (
          <CommentStack
            headingText="Neutral"
            comments={relevantComments.neutral}
          />
        )}
        {showNegative && (
          <CommentStack
            headingText="Negative"
            comments={relevantComments.negative}
          />
        )}
      </SimpleGrid>
    </>
  );
}

export default CommentDisplay;
