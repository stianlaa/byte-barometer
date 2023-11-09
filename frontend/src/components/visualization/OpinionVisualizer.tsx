import { VictoryPie } from "victory";
import { NEGATIVE, NEUTRAL, POSITIVE } from "../../constants";
import { Settings } from "../../App";

type OpinionVisualizerProps = {
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  settings: Settings;
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
  settings,
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
        padAngle={2}
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
          data: {
            strokeWidth: 2,
            stroke: ({ datum }) => {
              if (datum.x === POSITIVE) {
                return settings.showPositive ? "#849896" : "#749189";
              } else if (datum.x === NEUTRAL) {
                return settings.showNeutral ? "#828282" : "#6B6B6B";
              } else {
                return settings.showNegative ? "#9F6E6E" : "#945d5d";
              }
            },
          },
        }}
        events={[
          {
            target: "data",
            eventHandlers: {
              onClick: (_a, clickTarget) => {
                setSettings((prev) => {
                  const s: Settings = { ...prev };
                  if (clickTarget.index === 0) {
                    s.showPositive = !prev.showPositive;
                  } else if (clickTarget.index === 1) {
                    s.showNeutral = !prev.showNeutral;
                  } else {
                    s.showNegative = !prev.showNegative;
                  }
                  return s;
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
