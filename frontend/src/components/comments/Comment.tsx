import {
  Text,
  Box,
  Heading,
  HStack,
  Link,
  Center,
  Button,
} from "@chakra-ui/react";
import { parseId } from "../../document-util";
import SentimentTag from "./SentimentTag";
import { useState } from "react";

const AUTHOR_MAX_LEN = 10;

export type Sentiment = {
  label: string;
  score: number;
};

type Metadata = {
  author: string;
  storyId: string;
  context: string;
  parentId: string;
  storyUrl: string;
  createdAt: string;
  textStart: number;
  textEnd: number;
  commentText: string;
};

export type CommentWithSentiment = {
  id: string;
  score: number;
  metadata: Metadata;
  sentiment: Sentiment;
};

const createCommentText = (
  expanded: boolean,
  { commentText, textStart, textEnd }: Metadata
) => {
  if (expanded) {
    return (
      <>
        <Text>
          {commentText.substring(0, textStart)}
          <Text as="span" fontWeight="bold">
            {commentText.substring(textStart, textEnd)}
          </Text>
          {commentText.substring(textEnd)}
        </Text>
      </>
    );
  } else {
    return <Text>{commentText.substring(textStart, textEnd)}</Text>;
  }
};

function Comment({ id, metadata, sentiment }: CommentWithSentiment) {
  // TODO Find out why the slight offset of length, or different solution.
  const isCommentComplete =
    metadata.textStart === 0 &&
    metadata.textEnd === metadata.commentText.length - 4;

  const [expanded, setExpanded] = useState(false);
  const documentId = parseId(id);
  return (
    <Box
      backgroundColor="rgba(255, 255, 255, 0.15)"
      borderRadius="1rem"
      textAlign="left"
      p="1rem 1rem 0 1rem"
      w="100%"
    >
      <HStack spacing="1rem">
        <Heading size="xs">
          <Link
            href={`https://news.ycombinator.com/user?id=${metadata.author}`}
            isExternal
          >
            {metadata.author.substring(0, AUTHOR_MAX_LEN)}
          </Link>
        </Heading>
        <Link
          size="sm"
          href={`https://news.ycombinator.com/item?id=${metadata.storyId}`}
          isExternal
        >
          Story
        </Link>
        <Link
          href={`https://news.ycombinator.com/item?id=${documentId.id}`}
          isExternal
          mr="auto"
        >
          Comment 💬
        </Link>
        <SentimentTag sentiment={sentiment} />
      </HStack>
      <Box
        borderColor="grey.300"
        borderWidth="0 0 0 2px"
        m="0.25rem  auto 0 auto"
        pl="0.25rem"
      >
        {isCommentComplete
          ? metadata.commentText
          : createCommentText(expanded, metadata)}
      </Box>
      <Center mt="0.5rem" mb="0.5rem">
        {!isCommentComplete && (
          <Button
            w="40%"
            height="1rem"
            bg="transparent"
            _hover={{ bg: "grey.300" }}
            color="beige.700"
            fontWeight={500}
            aria-label={`${id}-expand-comment`}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        )}
      </Center>
    </Box>
  );
}

export default Comment;
