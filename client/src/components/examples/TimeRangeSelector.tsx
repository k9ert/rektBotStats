import { useState } from "react";
import TimeRangeSelector from "../TimeRangeSelector";

export default function TimeRangeSelectorExample() {
  const [selected, setSelected] = useState<"24h" | "7d" | "30d">("24h");

  return (
    <TimeRangeSelector
      selected={selected}
      onSelect={(range) => {
        console.log("Time range selected:", range);
        setSelected(range);
      }}
    />
  );
}
