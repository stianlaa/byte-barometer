import { VStack } from "@chakra-ui/react";
import Comment, { CommentWithSentiment } from "./Comment";

type CommentStackProps = {
  headingText: string;
  comments: CommentWithSentiment[];
};

function CommentStack({ comments }: CommentStackProps) {
  return (
    <VStack>
      {comments
        .sort((a, b) => b.score - a.score)
        .map((comment) => (
          <Comment key={`${comment.id}`} {...comment} />
        ))}
    </VStack>
  );
}

export default CommentStack;
