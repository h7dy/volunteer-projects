'use client';

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProject } from "@/app/actions/projectManagement"; 
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    // Confirmation
    if(!confirm("Are you sure? This will remove the project and all enrollments.")) return;
    
    startTransition(async () => {
      try {
        // Server Action
        await deleteProject(projectId);
        toast.success("Project deleted successfully");
      } catch (error) {
        // Error Handling
        console.error("Delete failed:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to delete the project. Please try again.");
        }
      }
    });
  }

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete}
      disabled={isPending}
      title="Delete Project"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}