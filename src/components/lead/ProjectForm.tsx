'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject, updateProject } from "@/app/actions/projectManagement";
import { useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProjectFormProps {
  project?: any;        // If passed, we are in Edit mode
  userRole?: string;    // 'admin' or 'lead' (Default to 'lead')
}

export default function ProjectForm({ project, userRole = 'lead' }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // DETERMINE BASE PATH
  // ensures admins stay in /admin and leads stay in /lead
  const basePath = userRole === 'admin' ? '/admin/projects' : '/lead';

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (project) {
          await updateProject(project._id, formData);
          // On Update: Go to the specific project details page
          router.push(`/lead/projects/${project._id}`);
        } else {
          await createProject(formData);
          // On Create: Go back to the main list
          router.push(basePath);
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert("An unexpected error occurred");
        }      
      }
    });
  };

  // Helper: Date formatting
  const defaultDate = project?.startDate 
    ? new Date(project.startDate).toISOString().split('T')[0] 
    : '';

  const showDraftOption = !project || project.status === 'draft';

  // If editing, cancel goes to details. If creating, cancel goes to list.
  const cancelLink = project ? `/lead/projects/${project._id}` : basePath;

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title</Label>
        <Input name="title" required defaultValue={project?.title} placeholder="e.g. Beach Cleanup" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={project?.status || 'draft'}>
            <SelectTrigger>
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
          <Label htmlFor="startDate">Date</Label>
          <Input type="date" name="startDate" defaultValue={defaultDate} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input name="location" defaultValue={project?.location} placeholder="e.g. Central Park" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity (Volunteers)</Label>
          <Input 
            type="number" 
            name="capacity" 
            defaultValue={project?.capacity ?? ''} 
            placeholder="Leave blank for ∞" 
            min="1"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            Leave empty for unlimited spots.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          name="description" 
          required 
          defaultValue={project?.description} 
          className="h-32" 
          placeholder="Describe the project details..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isPending} className="bg-slate-900 hover:bg-slate-800">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {project ? 'Update Project' : 'Create Project'}
        </Button>
        <Button variant="outline" asChild>
          <Link href={cancelLink}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}