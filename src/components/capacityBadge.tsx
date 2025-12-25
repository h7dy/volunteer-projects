import { Badge } from "@/components/ui/badge";
import { Users, Infinity } from "lucide-react";

interface CapacityBadgeProps {
  current?: number;
  max?: number | null;
}

export function CapacityBadge({ current = 0, max }: CapacityBadgeProps) {
  // Scenario 1: Unlimited Capacity (max is null/0/undefined)
  if (!max) {
    return (
      <Badge 
        variant="outline" 
        className="gap-1.5 font-mono font-medium text-emerald-700 border-emerald-200 bg-emerald-50"
      >
        {current} / <Infinity className="h-3 w-3" />
      </Badge>
    );
  }

  // Scenario 2: Limited Capacity
  const isFull = current >= max;

  return (
    <Badge 
      variant={isFull ? "destructive" : "secondary"} 
      className={`gap-1.5 font-mono font-medium ${
        !isFull ? "text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200" : ""
      }`}
    >
      <Users className="h-3 w-3" />
      {current} / {max}
    </Badge>
  );
}