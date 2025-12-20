'use client';

import { useState, useTransition } from 'react';
import { joinProject, leaveProject } from '@/app/actions/participation';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

interface ProjectActionButtonsProps {
  projectId: string;
  isJoined: boolean;
}

export default function ProjectActionButtons({ projectId, isJoined }: ProjectActionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (action: 'join' | 'leave') => {
    setError(null); // Clear previous errors
    
    startTransition(async () => {
      try {
        const result = action === 'join' 
          ? await joinProject(projectId) 
          : await leaveProject(projectId);

        if (!result.success) {
          setError(result.message || "Something went wrong");
        } else {
            // Optional: You could show a toast success message here
            router.refresh(); // Refresh the page to update UI
        }
      } catch (err) {
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Error Message Display */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {isJoined ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2 text-sm font-medium border border-green-100">
            <CheckCircle2 className="h-5 w-5" />
            You are signed up!
          </div>
          
          <Button 
            onClick={() => handleAction('leave')}
            disabled={isPending}
            variant="outline" 
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              "Cancel Signup"
            )}
          </Button>
        </div>
      ) : (
        <Button 
          onClick={() => handleAction('join')}
          disabled={isPending}
          size="lg" 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-lg"
        >
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
          ) : (
            "Volunteer Now"
          )}
        </Button>
      )}
    </div>
  );
}