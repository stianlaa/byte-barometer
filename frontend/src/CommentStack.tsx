import { VStack } from "@chakra-ui/react";
import Comment, { CommentWithSentiment } from "./Comment";
import { VISIBLE_COMMENTS } from "./constants";

type CommentStackProps = {
  headingText: string;
  comments: CommentWithSentiment[];
};

function CommentStack({ comments }: CommentStackProps) {
  return (
    <VStack>
      {comments
        ?.slice(0, VISIBLE_COMMENTS)
        .sort((a, b) => b.score - a.score)
        .map((comment) => (
          <Comment key={`${comment.id}`} {...comment} />
        ))}
    </VStack>
  );
}

export default CommentStack;
