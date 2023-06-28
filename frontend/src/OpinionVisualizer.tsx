import { Box } from "@chakra-ui/react";
import "./index.css";
import { CommentWithSentiment } from "./Comment";
import { VictoryAxis, VictoryChart, VictoryHistogram } from "victory";

type OpinionVisualizerInput = {
  positiveComments: CommentWithSentiment[];
  negativeComments: CommentWithSentiment[];
};

function OpinionVisualizer({
  positiveComments,
  negativeComments,
}: OpinionVisualizerInput) {
  const data = [...positiveComments, ...negativeComments].map((comment) => {
    return { x: comment.positive - comment.negative };
  });
  if (data.length === 0) {
    return <Box textAlign="left" p={"1rem"} mr="auto"></Box>;
  } else {
    return (
      <Box textAlign="left" p={"1rem"} mr="auto">
        <VictoryChart domainPadding={{ y: 0 }}>
          <VictoryAxis
            tickFormat={(t) => `${t}`}
            tickValues={[-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1]}
            style={{
              axisLabel: { fill: "white" },
              tickLabels: { fill: "white", angle: 45, fontSize: 6 },
              axis: { stroke: "white" },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}`}
            style={{
              axisLabel: { fill: "white" },
              tickLabels: { fill: "white", fontSize: 6 },
              axis: { stroke: "white" },
            }}
          />
          <VictoryHistogram
            style={{ data: { fill: "#F1737F" } }}
            cornerRadius={3}
            bins={[-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1]}
            data={data}
          />
        </VictoryChart>
      </Box>
    );
  }
}

export default OpinionVisualizer;
