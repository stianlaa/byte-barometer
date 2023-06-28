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
              tickLabels: { fill: "white", angle: 45, fontSize: 6 },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}`}
            style={{
              axisLabel: { fill: "white" },
              tickLabels: { fill: "white", fontSize: 6 },
            }}
          />
          <VictoryHistogram
            width={400} // example width
            height={400 * 0.6} // height is 60% of width
            style={{
              data: { fill: "#CD5C5C", stroke: "darkred", strokeWidth: 2 },
            }}
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
