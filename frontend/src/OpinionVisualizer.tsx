import { Center } from "@chakra-ui/react";
import { VictoryPie } from "victory";
import { NEGATIVE, NEUTRAL, POSITIVE } from "./constants";
import { CommentWithSentiment } from "./Comment";

type OpinionVisualizerProps = {
  groupedComments: Map<string, CommentWithSentiment[]> | undefined;
};

function mapVisualizerData(
  positiveCount: number | undefined,
  neutralCount: number | undefined,
  negativeCount: number | undefined
) {
  if (!positiveCount && !neutralCount && !negativeCount) {
    // Undefined or all 0, without data we just display equal piechunks for aestetic reasons
    return [
      { x: POSITIVE, y: 1 },
      { x: NEUTRAL, y: 1 },
      { x: NEGATIVE, y: 1 },
    ];
  }
  return [
    { x: POSITIVE, y: positiveCount },
    { x: NEUTRAL, y: neutralCount },
    { x: NEGATIVE, y: negativeCount },
  ];
}

function OpinionVisualizer({ groupedComments }: OpinionVisualizerProps) {
  const data = mapVisualizerData(
    groupedComments?.get(POSITIVE)?.length,
    groupedComments?.get(NEUTRAL)?.length,
    groupedComments?.get(NEGATIVE)?.length
  );
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
          labels={({ datum }) => (datum.y === 0 ? "" : datum.x)}
          labelRadius={({ innerRadius, radius }) =>
            ((radius as number) - (innerRadius as number)) * 0.75
          }
          innerRadius={30}
          labelPlacement="vertical"
          style={{
            labels: {
              fill: "#DDD8C4",
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
