import { useState } from "react";
import TimeSeriesChart from "../TimeSeriesChart";

export default function TimeSeriesChartExample() {
  const [timeRange] = useState<"24h" | "7d" | "30d">("24h");

  const generateMockData = () => {
    const data = [];
    const now = new Date();
    const points = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 * 24 : 30 * 24;
    const interval = timeRange === "24h" ? 60 : timeRange === "7d" ? 60 : 60;

    for (let i = points; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * interval * 60 * 1000);
      data.push({
        timestamp,
        long: Math.floor(Math.random() * 30) + 10,
        short: Math.floor(Math.random() * 25) + 8,
      });
    }
    return data;
  };

  return <TimeSeriesChart data={generateMockData()} timeRange={timeRange} />;
}
