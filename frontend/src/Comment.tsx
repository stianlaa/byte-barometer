import { Text, Box, Heading, HStack, Link } from "@chakra-ui/react";
import "./index.css";

export type DocumentId = {
  id: string;
  partIndex: number;
};

export const parseId = (id: string): DocumentId => {
  // Id's are in the form {id}-{partIndex}
  const parts = id.split("-");
  return { id: parts[0], partIndex: parseInt(parts[1]) };
};

export type Sentiment = {
  label: string;
  score: number;
};

export type CommentWithSentiment = {
  id: string;
  // parentID: number;
  // storyID: number;
  // author: string;
  commentText: string;
  context: string;
  sentiment: Sentiment;
  storyUrl: string;
};

function Comment({ id, context, storyUrl, sentiment }: CommentWithSentiment) {
  const documentId = parseId(id);
  return (
    <Box textAlign="left" p={"1rem"} mr="auto">
      <HStack>
        <Heading size="sm">{"author"}</Heading>
        {/* <Link
          href={`https://news.ycombinator.com/item?id=${storyID}`}
          isExternal
        >
          Story
        </Link> */}
        <Link
          href={`https://news.ycombinator.com/item?id=${documentId.id}`}
          isExternal
        >
          Comment
        </Link>
        <Link href={storyUrl} isExternal>
          Source
        </Link>
        <Box>{sentiment.score.toFixed(3)}</Box>
      </HStack>
      <Text
        paddingLeft={"0.25rem"}
        marginLeft={"0.25rem"}
        borderLeft="3px solid grey"
      >
        {context}
      </Text>
    </Box>
  );
}

export default Comment;
