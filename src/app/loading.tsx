import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}