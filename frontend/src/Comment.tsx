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
      maxW={"100%"}
    >
      <HStack>
        <Heading size="sm" mr="auto">
          <Link
            href={`https://news.ycombinator.com/user?id=${metadata.author}`}
            isExternal
          >
            {metadata.author}
          </Link>
        </Heading>
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
      <HStack justify="space-between">
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
          Comment 💬
        </Link>
        <Link href={metadata.storyUrl} isExternal>
          Source 🔗
        </Link>
      </HStack>
    </Box>
  );
}

export default Comment;
