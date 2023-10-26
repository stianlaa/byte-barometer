import {
  Text,
  Box,
  Heading,
  HStack,
  Link,
  Center,
  Button,
} from "@chakra-ui/react";
import "./index.css";
import { parseId } from "./document-util";
import SentimentTag from "./SentimentTag";
import { useState } from "react";

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

function Comment({ id, metadata, sentiment }: CommentWithSentiment) {
  const [expanded, setExpanded] = useState(false);
  const documentId = parseId(id);
  return (
    <Box
      backgroundColor="rgba(255, 255, 255, 0.15)"
      borderRadius="1rem"
      textAlign="left"
      p="1rem 1rem 0 1rem"
      maxW="100%"
    >
      <HStack spacing="1rem">
        <Heading size="sm">
          <Link
            href={`https://news.ycombinator.com/user?id=${metadata.author}`}
            isExternal
          >
            {metadata.author}
          </Link>
        </Heading>
        <Link
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
      <Text
        borderColor="grey.300"
        m="0.25rem  auto 0 auto"
        borderWidth="0 0 0 2px"
        pl="0.25rem"
      >
        {expanded
          ? `${metadata.commentText}`
          : `${metadata.commentText.substring(
              metadata.textStart,
              metadata.textEnd
            )}`}
      </Text>
      <Center>
        <Button
          mt="0.5rem"
          mb="0.5rem"
          w="40%"
          height="1rem"
          bg="transparent"
          _hover={{ bg: "grey.300" }}
          color="beige.700"
          fontWeight={500}
          aria-label={`${id}-expand-comment`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "collapse" : "expand"}
        </Button>
      </Center>
    </Box>
  );
}

export default Comment;
