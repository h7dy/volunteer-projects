'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flag, Calendar, AlertTriangle, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";

interface Report {
  _id: string;
  reason: string;
  date: string;
  projectId?: string | null;
  projectTitle?: string;
  reporterId?: string;
}

export function ViewReportsDialog({ reports, userName }: { reports: Report[], userName: string }) {
  if (!reports || reports.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer">
          <Flag className="h-3 w-3" />
          {reports.length} Report{reports.length > 1 ? 's' : ''}
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" /> Reports for {userName}
          </DialogTitle>
          <DialogDescription>
            Review flags submitted by Leads. Click the project name to investigate context.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[350px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={index} className="flex flex-col gap-3 border-b pb-4 last:border-0 last:pb-0">
                
                {/* Header: Date & Project Link */}
                <div className="flex justify-between items-start">
                  {report.projectId ? (
                    <Link 
                      href={`/lead/projects/${report.projectId}`} 
                      className="group flex items-center gap-1.5"
                      target="_blank" // Opens in new tab so admin doesn't lose place
                    >
                      <Badge variant="outline" className="group-hover:border-emerald-500 group-hover:text-emerald-700 transition-colors cursor-pointer gap-1 pr-1.5">
                         <FileText className="h-3 w-3" />
                         {report.projectTitle || "View Project"}
                         <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-50 group-hover:opacity-100" />
                      </Badge>
                    </Link>
                  ) : (
                     <Badge variant="outline" className="text-slate-400">
                        Project Deleted
                     </Badge>
                  )}

                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                </div>

                {/* The Report Content */}
                <div className="bg-red-50/50 p-3 rounded-md text-sm text-slate-800 border border-red-100">
                  <span className="font-semibold text-red-800 text-xs uppercase tracking-wide mb-1 block">Reason:</span>
                  "{report.reason}"
                </div>

              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}