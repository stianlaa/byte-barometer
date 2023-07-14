import { Center } from "@chakra-ui/react";
import { VictoryPie } from "victory";
import { NEGATIVE, NEUTRAL, POSITIVE } from "./constants";
import { CommentWithSentiment } from "./Comment";

type OpinionVisualizerProps = {
  groupedComments: Map<string, CommentWithSentiment[]> | undefined;
};

function OpinionVisualizer({ groupedComments }: OpinionVisualizerProps) {
  const data = [
    { x: POSITIVE, y: groupedComments?.get(POSITIVE)?.length || 0 },
    { x: NEUTRAL, y: groupedComments?.get(NEUTRAL)?.length || 0 },
    { x: NEGATIVE, y: groupedComments?.get(NEGATIVE)?.length || 0 },
  ];
  return (
    <Center mr="auto" ml="auto" w="100%">
      <svg viewBox="0 45 400 165" style={{ overflow: "hidden" }}>
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

export default OpinionVisualizer;
