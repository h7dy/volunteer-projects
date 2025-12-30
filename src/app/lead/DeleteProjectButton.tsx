'use client';

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteProject } from "@/app/actions/projectManagement"; 
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteProject(projectId);
        
        // Handle void or simple return types if your action doesn't return an object
        if (result && typeof result === 'object' && 'success' in result && !result.success) {
           const errorMsg = (result as any).message || "Failed to delete project";
           throw new Error(errorMsg);
        }

        toast.success("Project deleted successfully");
        setOpen(false); // Close dialog on success
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Failed to delete project. Please try again.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm" 
          // MOBILE POLISH: h-9 matches the other buttons. 
          // w-full on mobile ensures it fills the flex container evenly.
          className="h-9 w-full md:w-auto px-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 transition-colors"
          title="Delete Project"
        >
            {/* Show Icon */}
            <Trash2 className="h-4 w-4 md:mr-0 mr-2" />
            
            {/* Show Text ONLY on mobile for easier tapping */}
            <span className="md:hidden">Delete</span>
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete this project?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project
            and remove all volunteer enrollments associated with it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault(); // Prevent auto-closing, handle in async
              handleDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
            ) : (
              "Delete Project"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}