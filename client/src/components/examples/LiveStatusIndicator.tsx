import LiveStatusIndicator from "../LiveStatusIndicator";

export default function LiveStatusIndicatorExample() {
  return (
    <div className="flex gap-4">
      <LiveStatusIndicator status="live" />
      <LiveStatusIndicator status="connecting" />
      <LiveStatusIndicator status="error" />
    </div>
  );
}
