import "./index.css";
import { Box, Divider, Heading, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { CommentWithSentiment } from "./components/comments/Comment";
import OpinionVisualizer from "./components/visualization/OpinionVisualizer";
import QueryInput from "./components/query/QueryInput";
import CommentDisplay from "./components/comments/CommentDisplay";
import { RELEVANCE_LIMIT } from "./constants";
import InfoBar, { BackendStatus } from "./components/infobar/InfoBar";

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

  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    status: "NOT_FETCHED",
    deploymentSpec: undefined,
  });

  useEffect(() => {
    const fetchStatus = () => {
      setBackendStatus({ status: "RUNNING", deploymentSpec: undefined });
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
      {backendStatus.status == "RUNNING" ?
        (
          <QueryInput setComments={setComments} />
        ) :
        (<Box>
          <Heading size="sm">Hi there!</Heading>We're waking up the GPUs to do some processing<Spinner />
        </Box>)
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
