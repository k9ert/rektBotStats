import StatCard from "../StatCard";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        label="Total Long Rekt"
        value={1247}
        type="long"
        trend={{ direction: "up", percentage: 12.5 }}
      />
      <StatCard
        label="Total Short Rekt"
        value={892}
        type="short"
        trend={{ direction: "down", percentage: 8.3 }}
      />
      <StatCard
        label="Long/Short Ratio"
        value={1.4}
        type="neutral"
      />
    </div>
  );
}
