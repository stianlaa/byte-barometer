import "./index.css";
import { Box, Divider, Heading, Spinner, VStack, useMediaQuery } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { CommentWithSentiment } from "./components/comments/Comment";
import OpinionVisualizer from "./components/visualization/OpinionVisualizer";
import QueryInput from "./components/query/QueryInput";
import CommentDisplay from "./components/comments/CommentDisplay";
import { MOBILE_MEDIA_QUERY, RELEVANCE_LIMIT } from "./constants";
import InfoBar, { BackendStatus } from "./components/infobar/InfoBar";
import { BACKEND_URL } from "./socket-setup";

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
    showPositive: false,
    showNeutral: false,
    showNegative: false,
  });

  const [isLargerThan800] = useMediaQuery(MOBILE_MEDIA_QUERY)
  useEffect(() => {
    if (isLargerThan800) {
      setSettings({
        showPositive: true,
        showNeutral: false,
        showNegative: true,
      });
    }
    else {
      setSettings({
        showPositive: true,
        showNeutral: false,
        showNegative: false,
      });
    }

  }, [isLargerThan800])


  const [backendStatus, setBackendStatus] = useState<BackendStatus>(BackendStatus.UNKNOWN);

  useEffect(() => {
    const fetchStatus = () => {
      fetch(`${BACKEND_URL}/checkin`, { method: "GET" })
        .then((response) => {
          if (response.ok) {
            setBackendStatus(BackendStatus.RUNNING);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setBackendStatus(BackendStatus.ERROR);
        });

    };

    // Fetch immediately on mount
    fetchStatus();

    const intervalId = setInterval(fetchStatus, 20000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

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
      <Heading pt="1rem" size="lg">Byte Barometer</Heading>
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
      {backendStatus == BackendStatus.RUNNING ?
        (
          <QueryInput setComments={setComments} />
        ) :
        (<VStack>
          <Heading size="sm">Hi there!</Heading>
          <Box>
            We're waiting for the backend to respond
          </Box>
          <Spinner />
        </VStack>)
      }
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

      <InfoBar backendStatus={backendStatus} />
    </Box>
  );
}

export default App;
