import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  type?: "long" | "short" | "neutral";
}

export default function StatCard({ label, value, trend, type = "neutral" }: StatCardProps) {
  const typeColors = {
    long: "text-green-600 dark:text-green-400",
    short: "text-red-600 dark:text-red-400",
    neutral: "text-foreground",
  };

  return (
    <Card data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-3xl font-mono font-semibold ${typeColors[type]}`} data-testid="text-stat-value">
            {value.toLocaleString()}
          </p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.direction === "up" ? (
                <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span className={trend.direction === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {trend.percentage}%
              </span>
              <span className="text-muted-foreground ml-1">vs 24h ago</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
