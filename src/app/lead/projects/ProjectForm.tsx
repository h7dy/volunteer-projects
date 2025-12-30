'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject, updateProject } from "@/app/actions/projectManagement";
import { useTransition } from "react";
import { Loader2, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"

interface ProjectFormProps {
  project?: any;        // If passed, we are in Edit mode
  userRole?: string;    // 'admin' or 'lead' (Default to 'lead')
}

export default function ProjectForm({ project, userRole = 'lead' }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // DETERMINE BASE PATH
  const basePath = userRole === 'admin' ? '/admin/projects' : '/lead';

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (project) {
          await updateProject(project._id, formData);
          toast.success("Project Updated", { description: "Your changes have been saved." });
          router.refresh();
          router.push(`/lead/projects/${project._id}`);
        } else {
          await createProject(formData);
          toast.success("Project Created", { description: "You can now start recruiting volunteers." });
          router.refresh();
          router.push(basePath);
        }
      } catch (error: any) {
        toast.error("Error", {
            description: error.message || "Something went wrong"
        });   
      }
    });
  };
    
  // Helper: Date formatting
  const defaultDate = project?.startDate 
    ? new Date(project.startDate).toISOString().split('T')[0] 
    : '';

  const showDraftOption = !project || project.status === 'draft';

  // If editing, cancel goes to details. If creating, cancel goes to dashboard.
  const cancelLink = project ? `/lead/projects/${project._id}` : basePath;

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl w-full bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm mx-auto">
      
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-slate-900 font-medium">Project Title</Label>
        <Input 
            name="title" 
            required 
            defaultValue={project?.title} 
            placeholder="e.g. Beach Cleanup Initiative" 
            className="h-11 text-base placeholder:text-slate-400"
        />
      </div>

      {/* Grid 1: Stack on mobile (grid-cols-1), Side-by-side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-slate-900 font-medium">Status</Label>
          <Select name="status" defaultValue={project?.status || 'draft'}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {showDraftOption && (
                <SelectItem value="draft">Draft (Hidden)</SelectItem>
              )}
              <SelectItem value="active">Active (Visible)</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-slate-900 font-medium">Date</Label>
          <Input 
            type="date" 
            name="startDate" 
            defaultValue={defaultDate} 
            className="h-11 block w-full"
          />
        </div>
      </div>

      {/* Grid 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location" className="text-slate-900 font-medium">Location</Label>
          <Input 
            name="location" 
            defaultValue={project?.location} 
            placeholder="e.g. Central Park" 
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-slate-900 font-medium">Capacity (Volunteers)</Label>
          <Input 
            type="number" 
            name="capacity" 
            defaultValue={project?.capacity ?? ''} 
            placeholder="No limit" 
            min="1"
            className="h-11"
          />
          <p className="text-xs text-slate-500">
            Leave blank for unlimited spots.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-900 font-medium">Description</Label>
        <Textarea 
          name="description" 
          required 
          defaultValue={project?.description} 
          className="min-h-[150px] resize-y text-base leading-relaxed" 
          placeholder="Describe the project goals, what volunteers will do, and what they should bring..."
        />
      </div>

      {/* Buttons: Stack on mobile, Row on desktop */}
      <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-slate-100">
        <Button variant="outline" asChild className="w-full md:w-auto h-11 border-slate-300 text-slate-700 hover:bg-slate-50">
          <Link href={cancelLink}>
            Cancel
          </Link>
        </Button>

        <Button 
            type="submit" 
            disabled={isPending} 
            className="w-full md:w-auto h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/50 shadow-md transition-all active:scale-95"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}