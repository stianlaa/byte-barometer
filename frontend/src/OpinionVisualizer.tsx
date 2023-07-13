import { Box, Center } from "@chakra-ui/react";
import "./index.css";
import { CommentWithSentiment } from "./Comment";
import { VictoryPie } from "victory";

type OpinionVisualizerInput = {
  positiveComments: CommentWithSentiment[];
  neutralComments: CommentWithSentiment[];
  negativeComments: CommentWithSentiment[];
};

function OpinionVisualizer({
  positiveComments,
  neutralComments,
  negativeComments,
}: OpinionVisualizerInput) {
  const data = [
    { x: "Positive", y: positiveComments.length },
    { x: "Neutral", y: neutralComments.length },
    { x: "Negative", y: negativeComments.length },
  ];

  if (
    positiveComments.length === 0 &&
    neutralComments.length === 0 &&
    negativeComments.length === 0
  ) {
    return <Box mr="auto" />;
  } else {
    return (
      <Center mr="auto" ml="auto" w="100%">
        <svg viewBox="0 45 400 175" style={{ overflow: "hidden" }}>
          <VictoryPie
            standalone={false}
            width={400}
            height={400}
            colorScale={["tomato", "orange", "navy"]}
            cornerRadius={15}
            startAngle={-90}
            endAngle={90}
            data={data}
            labelRadius={({ innerRadius, radius }) =>
              ((radius as number) - (innerRadius as number)) * 0.75
            }
            innerRadius={30}
            labelPlacement="vertical"
            style={{
              data: {
                fillOpacity: 0.9,
                stroke: "black",
                strokeWidth: 3,
              },
              labels: {
                fill: "white",
                fontSize: 10,
                fontWeight: "bold",
                textAnchor: "middle",
              },
            }}
          />
        </svg>
      </Center>
    );
  }
}

export default OpinionVisualizer;
