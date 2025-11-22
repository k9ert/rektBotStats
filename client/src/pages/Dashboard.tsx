import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import LiveStatusIndicator from "@/components/LiveStatusIndicator";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import StatCard from "@/components/StatCard";
import TimeSeriesChart from "@/components/TimeSeriesChart";

interface Stats {
  totalLong: number;
  totalShort: number;
  ratio: number;
}

interface TimeSeriesData {
  timestamp: string;
  long: number;
  short: number;
}

interface StatusData {
  status: "live" | "connecting" | "error";
  messageCount: number;
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats", timeRange],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: timeSeriesRaw, isLoading: timeSeriesLoading } = useQuery<TimeSeriesData[]>({
    queryKey: ["/api/timeseries", timeRange],
    refetchInterval: 30000,
  });

  const { data: statusData } = useQuery<StatusData>({
    queryKey: ["/api/status"],
    refetchInterval: 10000, // Check status every 10 seconds
  });

  const chartData = timeSeriesRaw?.map(d => ({
    timestamp: new Date(d.timestamp),
    long: d.long,
    short: d.short,
  })) || [];

  const totalLong = stats?.totalLong || 0;
  const totalShort = stats?.totalShort || 0;
  const ratio = stats?.ratio || 0;
  const status = statusData?.status || "connecting";

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
          {timeSeriesLoading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Loading chart data...
            </div>
          ) : (
            <TimeSeriesChart data={chartData} timeRange={timeRange} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsLoading ? (
              <>
                <div className="h-32 flex items-center justify-center text-muted-foreground border rounded-lg">
                  Loading...
                </div>
                <div className="h-32 flex items-center justify-center text-muted-foreground border rounded-lg">
                  Loading...
                </div>
                <div className="h-32 flex items-center justify-center text-muted-foreground border rounded-lg">
                  Loading...
                </div>
              </>
            ) : (
              <>
                <StatCard
                  label="Total Long Rekt"
                  value={totalLong}
                  type="long"
                />
                <StatCard
                  label="Total Short Rekt"
                  value={totalShort}
                  type="short"
                />
                <StatCard
                  label="Long/Short Ratio"
                  value={ratio}
                  type="neutral"
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
