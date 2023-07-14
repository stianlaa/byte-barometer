import { Text, Box, Heading, HStack, Link } from "@chakra-ui/react";
import "./index.css";
import { parseId } from "./document-util";

type Sentiment = {
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
    <Box textAlign="left" p={"1rem"} mr="auto">
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
        <Box>{sentiment.score.toFixed(3)}</Box>
      </HStack>
      <Text
        paddingLeft={"0.25rem"}
        marginLeft={"0.25rem"}
        borderLeft="3px solid grey"
      >
        {metadata.context}
      </Text>
    </Box>
  );
}

export default Comment;
