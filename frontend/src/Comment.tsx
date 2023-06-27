import { Text, Box, Heading, HStack, Link } from "@chakra-ui/react";
import "./index.css";

export type CommentWithSentiment = {
  objectID: number;
  parentID: number;
  storyID: number;
  author: string;
  commentText: string;
  positive: number;
  negative: number;
  neutral: number;
  storyUrl: string;
};

const MAX_COMMENT_LENGTH = 200;

function Comment({
  commentText,
  author,
  storyUrl,
  objectID,
  storyID,
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
      </HStack>

      <Text>{commentText.slice(0, MAX_COMMENT_LENGTH)}</Text>
    </Box>
  );
}

export default Comment;
