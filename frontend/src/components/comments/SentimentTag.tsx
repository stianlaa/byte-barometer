import { Tag, useColorModeValue } from "@chakra-ui/react";
import { Sentiment } from "./Comment";
import { NEGATIVE, POSITIVE } from "../../constants";

const UPPER_LIMIT = 1.0;
const MIDDLE_LIMIT = 0.9;
const LOWER_LIMIT = 0.5;

type SentimentProps = {
  sentiment: Sentiment;
};

function GreatTag() {
  const bg = useColorModeValue("tealgreen.600", "tealgreen.400");
  const color = useColorModeValue("tealgreen.800", "tealgreen.600");
  return (
    <Tag bg={bg} color={color}>
      Great
    </Tag>
  );
}

function GoodTag() {
  const bg = useColorModeValue("tealgreen.400", "tealgreen.200");
  const color = useColorModeValue("tealgreen.800", "tealgreen.600");
  return (
    <Tag bg={bg} color={color}>
      Good
    </Tag>
  );
}

function NeutralTag() {
  const bg = useColorModeValue("grey.700", "grey.500");
  const color = useColorModeValue("grey.900", "grey.700");
  return (
    <Tag bg={bg} color={color}>
      Ok
    </Tag>
  );
}

function BadTag() {
  const bg = useColorModeValue("red.400", "red.200");
  const color = useColorModeValue("red.800", "red.400");
  return (
    <Tag bg={bg} color={color}>
      Bad
    </Tag>
  );
}

function TerribleTag() {
  const bg = useColorModeValue("red.700", "red.500");
  const color = useColorModeValue("red.900", "red.700");

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
