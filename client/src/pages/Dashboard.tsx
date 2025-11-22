import { useState } from "react";
import { BarChart3 } from "lucide-react";
import LiveStatusIndicator from "@/components/LiveStatusIndicator";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import StatCard from "@/components/StatCard";
import TimeSeriesChart from "@/components/TimeSeriesChart";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [status] = useState<"live" | "connecting" | "error">("live");

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

  const chartData = generateMockData();

  const totalLong = chartData.reduce((sum, d) => sum + d.long, 0);
  const totalShort = chartData.reduce((sum, d) => sum + d.short, 0);
  const ratio = totalShort > 0 ? (totalLong / totalShort).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold" data-testid="text-title">
              Rektbot Analytics
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
            <LiveStatusIndicator status={status} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-12">
          <TimeSeriesChart data={chartData} timeRange={timeRange} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total Long Rekt"
              value={totalLong}
              type="long"
              trend={{ direction: "up", percentage: 12.5 }}
            />
            <StatCard
              label="Total Short Rekt"
              value={totalShort}
              type="short"
              trend={{ direction: "down", percentage: 8.3 }}
            />
            <StatCard
              label="Long/Short Ratio"
              value={parseFloat(ratio.toString())}
              type="neutral"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
