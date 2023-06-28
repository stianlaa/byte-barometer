import { Text, Box, Heading, HStack, Link } from "@chakra-ui/react";
import "./index.css";

export type CommentWithSentiment = {
  objectID: number;
  parentID: number;
  storyID: number;
  author: string;
  commentText: string;
  queryMatch: string;
  positive: number;
  negative: number;
  neutral: number;
  storyUrl: string;
};

function Comment({
  queryMatch,
  author,
  storyUrl,
  objectID,
  storyID,
  positive,
  negative,
}: CommentWithSentiment) {
  return (
    <Box textAlign="left" p={"1rem"} mr="auto">
      <HStack>
        <Heading size="sm">{author}</Heading>
        <Link
          href={`https://news.ycombinator.com/item?id=${storyID}`}
          isExternal
        >
          Story
        </Link>
        <Link
          href={`https://news.ycombinator.com/item?id=${objectID}`}
          isExternal
        >
          Comment
        </Link>
        <Link href={storyUrl} isExternal>
          Source
        </Link>
        <Box>{(positive - negative).toFixed(3)}</Box>
      </HStack>
      <Text
        paddingLeft={"0.25rem"}
        marginLeft={"0.25rem"}
        borderLeft="3px solid grey"
      >
        {queryMatch}
      </Text>
    </Box>
  );
}

export default Comment;
