'use client';

import { useState, useTransition } from 'react';
import { joinProject, leaveProject } from '@/app/actions/participation';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle, Ban, Users, LogOut } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface ProjectActionButtonsProps {
  projectId: string;
  isJoined: boolean;
  projectStatus: string;
  capacity?: number | null;
  enrolledCount: number;
}

export default function ProjectActionButtons({ 
  projectId, 
  isJoined, 
  projectStatus,
  capacity,
  enrolledCount
}: ProjectActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isActive = projectStatus === 'active';
  const isFull = capacity ? enrolledCount >= capacity : false;

  const handleAction = async (action: 'join' | 'leave') => {
    setError(null);
    
    startTransition(async () => {
      try {
        const result = action === 'join' 
          ? await joinProject(projectId) 
          : await leaveProject(projectId);

        if (!result.success) {
          setError(result.message || "Something went wrong");
          toast.error("Action Failed", { description: result.message });
        } else {
            // Success!
            if (action === 'join') {
                toast.success("Welcome aboard!", { description: "You have successfully joined this project." });
            } else {
                toast.info("Update", { description: "You have left the project." });
            }
            router.refresh(); 
        }
      } catch (err) {
        setError("An unexpected error occurred");
      }
    });
  };

  // 1. STATE: CLOSED / COMPLETED
  if (!isActive) {
    if (isJoined) {
      return (
        <div className="space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl flex items-start gap-3 border border-emerald-100 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-sm">Project Completed</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                        Thanks for volunteering! This project is now closed.
                    </p>
                </div>
            </div>
        </div>
      );
    } else {
      return (
        <Button disabled size="lg" className="w-full bg-slate-100 text-slate-500 border border-slate-200 shadow-none">
          <Ban className="mr-2 h-4 w-4" />
          Project Closed
        </Button>
      );
    }
  }

  // 2. STATE: ACTIVE
  return (
    <div className="space-y-4">
      {/* Inline Error Display */}
      {error && (
        <div className="p-3 bg-red-50 text-red-900 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          {error}
        </div>
      )}

      {isJoined ? (
        <div className="space-y-4">
          {/* Success Banner */}
          <div className="p-4 bg-white text-emerald-900 rounded-xl flex items-start gap-3 border-2 border-emerald-100 shadow-sm">
            <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
                <p className="font-bold text-sm">You are signed up!</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    We've saved your spot. You will receive a reminder email before the event starts.
                </p>
            </div>
          </div>
          
        <Button 
            onClick={() => handleAction('leave')}
            disabled={isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm h-12 transition-all active:scale-95 border border-red-700"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <span className="flex items-center justify-center gap-2 text-sm font-medium">
                 <LogOut className="h-4 w-4" /> Not able to make it? Leave Project
              </span>
            )}
          </Button>
        </div>
      ) : isFull ? (
        
        // STATE: FULL
        <Button 
          disabled 
          size="lg" 
          className="w-full bg-slate-50 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed h-12"
        >
          <Users className="mr-2 h-4 w-4" />
          Capacity Full
        </Button>
      
      ) : (
        
        // STATE: JOIN
        <Button 
          onClick={() => handleAction('join')}
          disabled={isPending}
          size="lg" 
          className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/50 shadow-lg transition-all active:scale-95"
        >
          {isPending ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Joining...</>
          ) : (
            "Volunteer Now"
          )}
        </Button>
      )}
    </div>
  );
}