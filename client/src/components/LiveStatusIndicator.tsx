import { Badge } from "@/components/ui/badge";
import { Wifi } from "lucide-react";

interface LiveStatusIndicatorProps {
  status: "live" | "connecting" | "error";
}

export default function LiveStatusIndicator({ status }: LiveStatusIndicatorProps) {
  const statusConfig = {
    live: {
      text: "Live",
      variant: "default" as const,
      showPulse: true,
    },
    connecting: {
      text: "Connecting...",
      variant: "secondary" as const,
      showPulse: false,
    },
    error: {
      text: "Error",
      variant: "destructive" as const,
      showPulse: false,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className="gap-2" data-testid="badge-status">
      <Wifi className="h-3 w-3" />
      <span className="relative flex items-center gap-2">
        {config.showPulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
          </span>
        )}
        {config.text}
      </span>
    </Badge>
  );
}
