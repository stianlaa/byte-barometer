import {
  SimpleGrid,
  Box,
  Button,
  Heading,
  Flex,
  Divider,
  HStack,
  VStack,
  useMediaQuery,
} from "@chakra-ui/react";
import { GroupedComments, Settings } from "../../App";
import CommentStack from "./CommentStack";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { CommentWithSentiment } from "./Comment";
import { MOBILE_MEDIA_QUERY, NEGATIVE, POSITIVE, QUERY_COMMENT_COUNT } from "../../constants";

type CommentDisplayProps = {
  comments: GroupedComments;
  relevantComments: GroupedComments;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
};

type ToggleViewButtonProps = {
  text: string;
  enabled: boolean;
  onClick: () => void;
};

function ToggleViewButton({ text, enabled, onClick }: ToggleViewButtonProps) {
  return (
    <Flex direction="column" alignItems="flex-start">
      <Button
        color="beige.500"
        bgColor="transparent"
        size="s"
        onClick={onClick}
      >
        <Box p="0.25rem 0.25rem 0.25rem 0 ">
          {text}
          {enabled ? (
            <ViewIcon ml="0.25rem" bgColor="transparent" />
          ) : (
            <ViewOffIcon ml="0.25rem" bgColor="transparent" />
          )}
        </Box>
      </Button>
    </Flex>
  );
}

function CommentDisplay({
  comments,
  relevantComments,
  settings,
  setSettings,
}: CommentDisplayProps) {
  const [isLargerThan800] = useMediaQuery(MOBILE_MEDIA_QUERY)

  const allComments = comments.positive.concat(
    comments.neutral,
    comments.negative
  );
  const allRelevantComments = relevantComments.positive.concat(
    relevantComments.neutral,
    relevantComments.negative
  );

  const columnCount =
    (settings.showPositive ? 1 : 0) +
    (settings.showNeutral ? 1 : 0) +
    (settings.showNegative ? 1 : 0);

  const summarizeSentiment = (comments: CommentWithSentiment[]) => {
    const averageSentiment =
      comments
        .map(({ sentiment }) => {
          if (sentiment.label === POSITIVE) return sentiment.score;
          if (sentiment.label === NEGATIVE) return -sentiment.score;
          return 0.0;
        })
        .reduce((partialSum, entry) => partialSum + entry, 0) / comments.length;

    if (comments.length === 0) {
      return false;
    } else if (averageSentiment > 0.15) {
      return "Good";
    } else if (averageSentiment < -0.15) {
      return "Bad";
    }
    return "Neutral";
  };

  return (
    <>
      {allComments.length > 0 &&
        <VStack w="80%" ml="auto" mr="auto">
          <HStack ml="auto" mr="auto">
            <Heading>{summarizeSentiment(allComments)}</Heading>
          </HStack>
          <HStack ml="auto" mr="auto">
            {allRelevantComments.length}/{QUERY_COMMENT_COUNT} relevant comments,
          </HStack>

          <Divider
            borderColor="grey.300"
            m="0.25rem  auto 0.25rem auto"
            w="90%"
            borderWidth="2px 0 0 0"
          />

          <HStack>
            <ToggleViewButton
              text="Positive"
              enabled={settings.showPositive}
              onClick={() =>
                setSettings((prevSettings) => {
                  if (isLargerThan800) {
                    return {
                      ...prevSettings,
                      showPositive: !prevSettings.showPositive,
                    };
                  } else {
                    return { showNegative: false, showPositive: !prevSettings.showPositive, showNeutral: false }
                  }
                })
              }
            />
            <ToggleViewButton
              text="Neutral"
              enabled={settings.showNeutral}
              onClick={() =>
                setSettings((prevSettings) => {
                  if (isLargerThan800) {
                    return {
                      ...prevSettings,
                      showNeutral: !prevSettings.showNeutral,
                    };
                  } else {
                    return { showNeutral: !prevSettings.showNeutral, showNegative: false, showPositive: false }
                  }
                })
              }
            />
            <ToggleViewButton
              text="Negative"
              enabled={settings.showNegative}
              onClick={() =>
                setSettings((prevSettings) => {
                  if (isLargerThan800) {
                    return {
                      ...prevSettings,
                      showNegative: !prevSettings.showNegative,
                    };
                  } else {
                    return { showNegative: !prevSettings.showNegative, showPositive: false, showNeutral: false }
                  }
                })
              }
            />
          </HStack>
        </VStack>
      }

      <SimpleGrid columns={columnCount} spacing={10} mt="1rem">
        {settings.showPositive && (
          <CommentStack
            headingText="Positive"
            comments={relevantComments.positive}
          />
        )}
        {settings.showNeutral && (
          <CommentStack
            headingText="Neutral"
            comments={relevantComments.neutral}
          />
        )}
        {settings.showNegative && (
          <CommentStack
            headingText="Negative"
            comments={relevantComments.negative}
          />
        )}
      </SimpleGrid>
    </>
  );
}

export default CommentDisplay;
