import { Tag } from "@chakra-ui/react";
import { Sentiment } from "./Comment";
import { NEGATIVE, POSITIVE } from "../../constants";

const UPPER_LIMIT = 1.0;
const MIDDLE_LIMIT = 0.9;
const LOWER_LIMIT = 0.5;

type SentimentProps = {
  sentiment: Sentiment;
};

type TagProps = {
  text: string;
  color: string;
};

function findTagProps({ score, label }: Sentiment): TagProps {
  if (label === POSITIVE) {
    if (score <= UPPER_LIMIT && score > MIDDLE_LIMIT) {
      return { text: "Great", color: "tealgreen" };
    } else if (score <= MIDDLE_LIMIT && score > LOWER_LIMIT) {
      return { text: "Good", color: "tealgreen" };
    }
  } else if (label === NEGATIVE) {
    if (score <= UPPER_LIMIT && score > MIDDLE_LIMIT) {
      return { text: "Terrible", color: "red" };
    } else if (score <= MIDDLE_LIMIT && score > LOWER_LIMIT) {
      return { text: "Bad", color: "red" };
    }
  }
  return { text: "OK", color: "grey" };
}

function SentimentTag({ sentiment }: SentimentProps) {
  const { color, text } = findTagProps(sentiment);
  return <Tag colorScheme={color}>{text}</Tag>;
}

export default SentimentTag;
