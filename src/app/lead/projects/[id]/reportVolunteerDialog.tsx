'use client'

import { useState } from "react";
import { reportVolunteer } from "@/app/actions/requests";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { toast } from "sonner"

interface ReportDialogProps {
  volunteerId: string;
  volunteerName: string;
  projectId: string; 
}

export function ReportVolunteerDialog({ volunteerId, volunteerName, projectId }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReport() {
    if(reason.length < 5) return;
    setLoading(true);
    
    const result = await reportVolunteer(volunteerId, reason, projectId);
    
    setLoading(false);
    
    if (result.error) {
      toast.error(result.error || "Something went wrong");

    } else {
        setOpen(false);
        setReason("");
        toast.success("Report submitted.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
          <Flag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-700 flex items-center gap-2">
            <Flag className="h-5 w-5" /> Report {volunteerName}
          </DialogTitle>
          <DialogDescription>
             This will flag the user for review by system administrators.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">Reason for report:</label>
          <Textarea 
            placeholder="e.g. User did not show up, User was rude, etc..." 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={handleReport} 
            disabled={loading || reason.length < 5}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}