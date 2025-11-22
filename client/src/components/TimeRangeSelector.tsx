import { Button } from "@/components/ui/button";

interface TimeRangeSelectorProps {
  selected: "24h" | "7d" | "30d";
  onSelect: (range: "24h" | "7d" | "30d") => void;
}

export default function TimeRangeSelector({ selected, onSelect }: TimeRangeSelectorProps) {
  const ranges: Array<{ value: "24h" | "7d" | "30d"; label: string }> = [
    { value: "24h", label: "24H" },
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-border bg-background" data-testid="selector-timerange">
      {ranges.map((range, index) => (
        <Button
          key={range.value}
          variant={selected === range.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onSelect(range.value)}
          className={`
            ${index === 0 ? "rounded-r-none" : ""}
            ${index === ranges.length - 1 ? "rounded-l-none" : ""}
            ${index > 0 && index < ranges.length - 1 ? "rounded-none" : ""}
          `}
          data-testid={`button-timerange-${range.value}`}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
