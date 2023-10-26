import "./index.css";
import {
  Box,
  Divider,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  VStack,
  Text,
  Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { CommentWithSentiment } from "./Comment";
import OpinionVisualizer from "./OpinionVisualizer";
import QueryInput from "./QueryInput";
import CommentDisplay from "./CommentDisplay";
import { RELEVANCE_LIMIT } from "./constants";
import { ExternalLinkIcon, QuestionIcon, SearchIcon } from "@chakra-ui/icons";

export type GroupedComments = {
  positive: CommentWithSentiment[];
  neutral: CommentWithSentiment[];
  negative: CommentWithSentiment[];
};

export type Settings = {
  showPositive: boolean;
  showNeutral: boolean;
  showNegative: boolean;
};

function App() {
  const [comments, setComments] = useState<GroupedComments>({
    positive: [],
    neutral: [],
    negative: [],
  });
  const relevantComments: GroupedComments = {
    positive: comments.positive.filter((c) => c.score > RELEVANCE_LIMIT),
    neutral: comments.neutral.filter((c) => c.score > RELEVANCE_LIMIT),
    negative: comments.negative.filter((c) => c.score > RELEVANCE_LIMIT),
  };

  const [settings, setSettings] = useState<Settings>({
    showPositive: true,
    showNeutral: false,
    showNegative: true,
  });

  return (
    <Box
      height="100vh"
      overflowY="scroll"
      sx={{
        "::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
      }}
    >
      <Heading pt="1rem">Byte Barometer</Heading>
      <Divider
        borderColor="grey.300"
        m="0.25rem  auto 0.25rem auto"
        w="33%"
        borderWidth="2px 0 0 0"
      />
      <OpinionVisualizer
        positiveCount={relevantComments.positive.length}
        neutralCount={relevantComments.neutral.length}
        negativeCount={relevantComments.negative.length}
        settings={settings}
        setSettings={setSettings}
      />
      <QueryInput setComments={setComments} />

      <Divider
        borderColor="grey.300"
        m="0.25rem auto 0.25rem auto"
        w="80%"
        borderWidth="2px 0 0 0"
      />
      <CommentDisplay
        comments={comments}
        relevantComments={relevantComments}
        settings={settings}
        setSettings={setSettings}
      />

      <Box position="absolute" top="1rem" left="1rem">
        <Popover>
          <PopoverTrigger>
            <IconButton
              size="lg"
              bg="transparent"
              color="beige.700"
              aria-label="Disclaimer"
              icon={<QuestionIcon w="70%" h="70%" />}
            />
          </PopoverTrigger>
          <PopoverContent p={4} bg="grey.500" w="40%" borderColor="grey.300">
            <PopoverArrow />
            <PopoverCloseButton size="md" m="0.5rem" p="0.5rem" />
            <PopoverBody>
              <VStack spacing={2}>
                <Heading size="md">Hi there!</Heading>
                <Text>
                  This is one of my side projects, so there might be a bug or
                  two hiding around. Check out the
                  <Link
                    href="https://github.com/stianlaa/byte-barometer"
                    isExternal
                    color="poolgreen.200"
                  >
                    {" "}
                    source code <ExternalLinkIcon mx="2px" />
                  </Link>
                  and if you're feeling adventurous, throw in a pull request.
                </Text>
                <Text>
                  New comments are added continiously and automatically, but
                  I've capped it at the latest 500,000 to save on costs.
                </Text>
                <Text>
                  About the sentiment analysis it is aspect based around your
                  query subject. So long queries confuse it somewhat.
                </Text>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </Box>
  );
}

export default App;
