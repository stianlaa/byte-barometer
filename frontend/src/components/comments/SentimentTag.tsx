import { Tag } from "@chakra-ui/react";
import { Sentiment } from "./Comment";
import { NEGATIVE, POSITIVE } from "../../constants";

const UPPER_LIMIT = 1.0;
const MIDDLE_LIMIT = 0.9;
const LOWER_LIMIT = 0.5;

type SentimentProps = {
  sentiment: Sentiment;
};

function GreatTag() {
  const bg = "tealgreen.500";
  const color = "tealgreen.900";
  return (
    <Tag bg={bg} color={color}>
      Great
    </Tag>
  );
}

function GoodTag() {
  const bg = "tealgreen.400";
  const color = "tealgreen.800";
  return (
    <Tag bg={bg} color={color}>
      Good
    </Tag>
  );
}

function NeutralTag() {
  const bg = "beige.400";
  const color = "grey.600";
  return (
    <Tag bg={bg} color={color}>
      Ok
    </Tag>
  );
}

function BadTag() {
  const bg = "red.300";
  const color = "red.800";
  return (
    <Tag bg={bg} color={color}>
      Bad
    </Tag>
  );
}

function TerribleTag() {
  const bg = "red.500";
  const color = "red.900";

  return (
    <Tag bg={bg} color={color}>
      Terrible
    </Tag>
  );
}

function SentimentTag({ sentiment }: SentimentProps) {
  const { score, label } = sentiment;
  if (label === POSITIVE) {
    if (score <= UPPER_LIMIT && score > MIDDLE_LIMIT) {
      return <GreatTag />;
    } else if (score <= MIDDLE_LIMIT && score > LOWER_LIMIT) {
      return <GoodTag />;
    }
  } else if (label === NEGATIVE) {
    if (score <= UPPER_LIMIT && score > MIDDLE_LIMIT) {
      return <TerribleTag />;
    } else if (score <= MIDDLE_LIMIT && score > LOWER_LIMIT) {
      return <BadTag />;
    }
  }
  return <NeutralTag />;
}

export default SentimentTag;
