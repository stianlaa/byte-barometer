import { Center } from "@chakra-ui/react";
import { VictoryPie } from "victory";
import { NEGATIVE, NEUTRAL, POSITIVE } from "./constants";
import { CommentWithSentiment } from "./Comment";

type OpinionVisualizerProps = {
  groupedComments: Map<string, CommentWithSentiment[]> | undefined;
};

function OpinionVisualizer({ groupedComments }: OpinionVisualizerProps) {
  const data = [
    { x: POSITIVE, y: groupedComments?.get(POSITIVE)?.length || 1 },
    { x: NEUTRAL, y: groupedComments?.get(NEUTRAL)?.length || 1 },
    { x: NEGATIVE, y: groupedComments?.get(NEGATIVE)?.length || 1 },
  ];
  return (
    <Center mr="auto" ml="auto" w="100%">
      <svg viewBox="0 45 400 165" style={{ overflow: "hidden" }}>
        <VictoryPie
          animate={{ duration: 1000 }}
          standalone={false}
          width={400}
          height={400}
          colorScale={["#749189", "#6B6B6B", "#945d5d"]}
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
            labels: {
              fill: "#DDD8C4",
              fontSize: 6,
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
