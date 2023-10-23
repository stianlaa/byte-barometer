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
  score: number;
  metadata: Metadata;
  sentiment: Sentiment;
};

function Comment({ id, score, metadata, sentiment }: CommentWithSentiment) {
  const documentId = parseId(id);
  return (
    <Box
      backgroundColor="rgba(255, 255, 255, 0.15)"
      borderRadius="1rem"
      textAlign="left"
      p="1rem"
      maxW={"100%"}
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
        m="0.25rem  auto 0.25rem auto"
        borderWidth="0 0 0 2px"
        pl="0.25rem"
        pb="0.25rem"
      >
        {metadata.context}
      </Text>
    </Box>
  );
}

export default Comment;
