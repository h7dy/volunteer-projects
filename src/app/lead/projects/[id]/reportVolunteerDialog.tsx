'use client'

import { useState } from "react";
import { reportVolunteer } from "@/app/actions/requests";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner"
import { Label } from "@/components/ui/label";

interface ReportDialogProps {
  volunteerId: string;
  volunteerName: string;
  projectId: string; 
}

export function ReportVolunteerDialog({ volunteerId, volunteerName, projectId }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Minimum characters required for a valid report
  const MIN_LENGTH = 10;
  const isValid = reason.length >= MIN_LENGTH;

  async function handleReport() {
    if(!isValid) return;
    setLoading(true);
    
    try {
      const result = await reportVolunteer(volunteerId, reason, projectId);
      
      if (result.error) {
        toast.error("Report Failed", { description: result.error });
      } else {
          setOpen(false);
          setReason("");
          toast.success("Report Submitted", { description: "The administration has been notified." });
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Trigger: Subtle ghost button, red on hover */}
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Report User"
        >
          <Flag className="h-4 w-4" />
          <span className="sr-only">Report Volunteer</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-red-700 flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6" /> Report Volunteer
          </DialogTitle>
          <DialogDescription className="text-slate-600">
             You are flagging <span className="font-semibold text-slate-900">{volunteerName}</span>. 
             This report will be reviewed by system administrators.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-3">
          <Label htmlFor="reason" className="text-sm font-medium text-slate-700">
            Reason for report
          </Label>
          <Textarea 
            id="reason"
            placeholder="e.g. Volunteer did not show up, inappropriate behavior, etc..." 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[120px] resize-y focus-visible:ring-red-500"
          />
          {/* Character Counter / Validation Helper */}
          <p className={`text-xs text-right ${isValid ? 'text-slate-400' : 'text-red-500'}`}>
            {reason.length} / {MIN_LENGTH} characters required
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReport} 
            disabled={loading || !isValid}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
                "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}