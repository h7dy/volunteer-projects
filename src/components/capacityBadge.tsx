import { Badge } from "@/components/ui/badge";
import { Users, Infinity } from "lucide-react";

interface CapacityBadgeProps {
  current?: number;
  max?: number | null;
}

export function CapacityBadge({ current = 0, max }: CapacityBadgeProps) {
  const commonClasses = "gap-1.5 font-mono font-medium whitespace-nowrap items-center";

  // Case 1: Unlimited Capacity
  if (!max) {
    return (
      <Badge 
        variant="outline" 
        className={`${commonClasses} text-emerald-700 border-emerald-200 bg-emerald-50`}
      >
        <span>{current}</span>
        <span className="text-emerald-300">/</span>
        <Infinity className="h-3 w-3" />
      </Badge>
    );
  }

  // Case 2: Limited Capacity
  const isFull = current >= max;

  return (
    <Badge 
      variant={isFull ? "destructive" : "secondary"} 
      className={`${commonClasses} ${
        !isFull 
          ? "text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200" 
          : "border border-red-200" 
      }`}
    >
      <Users className="h-3 w-3 opacity-70" />
      <span>{current}</span>
      <span className="opacity-40 mx-0.5">/</span>
      <span>{max}</span>
    </Badge>
  );
}