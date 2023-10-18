import { Center } from "@chakra-ui/react";
import { VictoryPie } from "victory";
import { NEGATIVE, NEUTRAL, POSITIVE } from "./constants";
import { useEffect, useCallback } from "react";

type OpinionVisualizerProps = {
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
};

const mapInputData = ({
  positiveCount,
  neutralCount,
  negativeCount,
}: OpinionVisualizerProps) => {
  return positiveCount + neutralCount + negativeCount === 0
    ? [
        { x: POSITIVE, y: 0 },
        { x: NEUTRAL, y: 0 },
        { x: NEGATIVE, y: 0 },
      ]
    : [
        { x: POSITIVE, y: positiveCount },
        { x: NEUTRAL, y: neutralCount },
        { x: NEGATIVE, y: negativeCount },
      ];
};

function OpinionVisualizer(props: OpinionVisualizerProps) {
  useEffect(() => {
    console.log(`comments changed: ${JSON.stringify(props)}`);
  }, [props]);

  return (
    <Center mr="auto" ml="auto" w="100%">
      <svg viewBox="0 45 400 165" style={{ overflow: "hidden" }}>
        <VictoryPie
          key="ByteBarometerOpinionVisualizer"
          // animate={{ duration: 400 }} // Somewhat iffy render as jitter
          standalone={false}
          width={400}
          height={400}
          colorScale={["#749189", "#6B6B6B", "#945d5d"]}
          cornerRadius={15}
          startAngle={-90}
          endAngle={90}
          data={mapInputData(props)}
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
