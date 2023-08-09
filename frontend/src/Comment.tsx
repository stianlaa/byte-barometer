import { Text, Box, Heading, HStack, Link } from "@chakra-ui/react";
import "./index.css";
import { parseId } from "./document-util";
import SentimentTag from "./SentimentTag";

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
};

export type CommentWithSentiment = {
  id: string;
  metadata: Metadata;
  sentiment: Sentiment;
};

function Comment({ id, metadata, sentiment }: CommentWithSentiment) {
  const documentId = parseId(id);
  return (
    <Box
      backgroundColor="rgba(255, 255, 255, 0.15)"
      borderRadius="1rem"
      textAlign="left"
      p="1rem"
    >
      <HStack>
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
        >
          Comment
        </Link>
        <Link href={metadata.storyUrl} isExternal>
          Source
        </Link>
        <SentimentTag sentiment={sentiment} />
      </HStack>
      <Text pl="0.25rem" mt="0.5rem" ml="0.25rem">
        {metadata.context}
      </Text>
    </Box>
  );
}

export default Comment;
