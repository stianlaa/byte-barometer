import { useState } from "react";
import { Center, SimpleGrid, IconButton } from "@chakra-ui/react";
import { GroupedComments } from "./App";
import CommentStack from "./CommentStack";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

type CommentDisplayProps = {
  comments: GroupedComments;
};

function CommentDisplay({ comments }: CommentDisplayProps) {
  const [showPositive, setShowPositive] = useState<boolean>(true);
  const [showNeutral, setShowNeutral] = useState<boolean>(false);
  const [showNegative, setShowNegative] = useState<boolean>(true);
  const columnCount =
    (showPositive ? 1 : 0) + (showNeutral ? 1 : 0) + (showNegative ? 1 : 0);

  return (
    <>
      <SimpleGrid columns={3} spacing={10}>
        <Center>
          Positive
          <IconButton
            aria-label="Positive"
            bgColor="grey.700"
            color="beige.500"
            icon={showPositive ? <ViewIcon /> : <ViewOffIcon />}
            onClick={() => setShowPositive(!showPositive)}
          />
        </Center>
        <Center>
          Neutral
          <IconButton
            aria-label="Neutral"
            bgColor="grey.700"
            color="beige.500"
            icon={showNeutral ? <ViewIcon /> : <ViewOffIcon />}
            onClick={() => setShowNeutral(!showNeutral)}
          />
        </Center>
        <Center>
          Negative
          <IconButton
            aria-label="Negative"
            bgColor="grey.700"
            color="beige.500"
            icon={showNegative ? <ViewIcon /> : <ViewOffIcon />}
            onClick={() => setShowNegative(!showNegative)}
          />
        </Center>
      </SimpleGrid>
      <SimpleGrid columns={columnCount} spacing={10}>
        {showPositive && (
          <CommentStack headingText="Positive" comments={comments.positive} />
        )}
        {showNeutral && (
          <CommentStack headingText="Neutral" comments={comments.neutral} />
        )}
        {showNegative && (
          <CommentStack headingText="Negative" comments={comments.negative} />
        )}
      </SimpleGrid>
    </>
  );
}

export default CommentDisplay;
