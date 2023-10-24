import { VictoryPie } from "victory";
import { NEGATIVE, NEUTRAL, POSITIVE } from "./constants";
import { Settings } from "./App";

type OpinionVisualizerProps = {
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
};

const mapInputData = (
  positiveCount: number,
  neutralCount: number,
  negativeCount: number
) => {
  return positiveCount + neutralCount + negativeCount === 0
    ? [
        { x: POSITIVE, y: 1 },
        { x: NEUTRAL, y: 1 },
        { x: NEGATIVE, y: 1 },
      ]
    : [
        { x: POSITIVE, y: positiveCount },
        { x: NEUTRAL, y: neutralCount },
        { x: NEGATIVE, y: negativeCount },
      ];
};

function OpinionVisualizer({
  positiveCount,
  neutralCount,
  negativeCount,
  setSettings,
}: OpinionVisualizerProps) {
  return (
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
        data={mapInputData(positiveCount, neutralCount, negativeCount)}
        labels={({ datum }) => {
          if (datum.x === POSITIVE) return "👍";
          // else if (datum.x === NEUTRAL) return "";
          else if (datum.x === NEGATIVE) return "👎";
          else return "";
        }}
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
        events={[
          {
            target: "data",
            eventHandlers: {
              onClick: (_a, clickTarget) => {
                setSettings((prevSettings) => {
                  const returnSettings: Settings = { ...prevSettings };
                  if (clickTarget.index === 0) {
                    returnSettings.showPositive = !prevSettings.showPositive;
                  } else if (clickTarget.index === 1) {
                    returnSettings.showNeutral = !prevSettings.showNeutral;
                  } else {
                    returnSettings.showNegative = !prevSettings.showNegative;
                  }
                  return returnSettings;
                });
                return [{ target: "data" }, { target: "labels" }];
              },
            },
          },
        ]}
      />
    </svg>
  );
}

export default OpinionVisualizer;
