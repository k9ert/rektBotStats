import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface DataPoint {
  timestamp: Date;
  long: number;
  short: number;
}

interface TimeSeriesChartProps {
  data: DataPoint[];
  timeRange: "24h" | "7d" | "30d";
}

export default function TimeSeriesChart({ data, timeRange }: TimeSeriesChartProps) {
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeRange === "24h") {
      return format(date, "HH:mm");
    } else if (timeRange === "7d") {
      return format(date, "MM/dd");
    } else {
      return format(date, "MM/dd");
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const chartData = data.map((d) => ({
    timestamp: d.timestamp.getTime(),
    long: d.long,
    short: d.short,
  }));

  return (
    <Card data-testid="card-chart">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Liquidations (USD) Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.375rem",
              }}
              labelFormatter={(label) => format(new Date(label), "MMM dd, yyyy HH:mm")}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="long"
              stroke="rgb(34 197 94)"
              strokeWidth={2}
              name="Long Rekt (USD)"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="short"
              stroke="rgb(239 68 68)"
              strokeWidth={2}
              name="Short Rekt (USD)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
