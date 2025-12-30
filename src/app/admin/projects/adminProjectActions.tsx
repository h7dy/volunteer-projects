'use client';

import { useState, useTransition } from "react";
import { deleteProject } from "@/app/actions/projectManagement";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function AdminProjectActions({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false); // Controls Alert Dialog
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProject(projectId);
        toast.success("Project deleted");
        setOpen(false);
      } catch (error) {
        toast.error("Failed to delete project");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem asChild>
            <Link href={`/lead/projects/${projectId}`} className="cursor-pointer w-full">
              <Eye className="mr-2 h-4 w-4" /> View Details
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/lead/projects/${projectId}/edit`} className="cursor-pointer w-full">
               <Edit className="mr-2 h-4 w-4" /> Edit Project
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Triggers the Alert Dialog instead of deleting immediately */}
          <DropdownMenuItem 
            onSelect={() => setOpen(true)} 
            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and remove all associated volunteer data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                }}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}