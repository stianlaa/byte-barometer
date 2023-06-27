import { Text, Box, Heading } from "@chakra-ui/react";
import "./index.css";

export type CommentWithSentiment = {
  objectID: number;
  parentID: number;
  author: string;
  commentText: string;
  positive: number;
  negative: number;
  neutral: number;
};

function Comment({ commentText, author }: CommentWithSentiment) {
  return (
    <Box w="100%">
      <Heading size="sm">{author}</Heading>
      <Text>{commentText}</Text>
    </Box>
  );
}

export default Comment;
