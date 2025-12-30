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
import { Flag, Calendar, AlertTriangle, ExternalLink, FileText, XCircle } from "lucide-react";
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
        {/* Trigger: Interactive Pill Badge */}
        <button className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer active:scale-95 shadow-sm">
          <Flag className="h-3 w-3 fill-red-700/20" />
          <span>{reports.length} {reports.length === 1 ? 'Report' : 'Reports'}</span>
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md w-[95%] rounded-lg">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-red-700 text-lg">
            <AlertTriangle className="h-5 w-5 fill-red-100" /> 
            Reports: <span className="text-slate-900">{userName}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Review flags submitted by project leads.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4 -mr-4">
          <div className="space-y-4 pr-1">
            {reports.map((report, index) => (
              <div 
                key={report._id || index} 
                className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 shadow-sm"
              >
                
                {/* Header: Date & Project Link */}
                <div className="flex justify-between items-center">
                  {report.projectId ? (
                    <Link 
                      href={`/lead/projects/${report.projectId}`} 
                      target="_blank" 
                      className="group"
                    >
                      <Badge variant="outline" className="bg-white hover:border-emerald-500 hover:text-emerald-700 transition-colors cursor-pointer pl-2 pr-2 py-1 gap-1.5 shadow-sm">
                         <FileText className="h-3 w-3 text-slate-400 group-hover:text-emerald-500" />
                         <span className="truncate max-w-[140px]">{report.projectTitle || "Unknown Project"}</span>
                         <ExternalLink className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                      </Badge>
                    </Link>
                  ) : (
                     <Badge variant="outline" className="bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed gap-1">
                        <XCircle className="h-3 w-3" /> Deleted Project
                     </Badge>
                  )}

                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-100">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit'})}
                  </span>
                </div>

                {/* The Report Content */}
                <div className="relative pl-3">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-200 rounded-full"></div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    "{report.reason}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}