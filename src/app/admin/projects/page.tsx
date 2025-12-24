import { getAllProjectsForAdmin, deleteProject } from "@/app/actions/projectManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  MoreHorizontal, 
  Trash2, 
  Eye, 
  Calendar,
  User as UserIcon 
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsForAdmin();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Oversight</h1>
          <p className="text-slate-500 mt-1">Manage and monitor all volunteer initiatives.</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-md text-sm font-medium text-slate-700">
          Total Projects: {projects.length}
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[300px]">Project Title</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project: any) => (
              <TableRow key={project._id}>
                <TableCell className="font-medium">
                  {project.title}
                  <div className="text-xs text-slate-400 font-normal mt-0.5 truncate max-w-[250px]">
                    {project.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                       <UserIcon className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-slate-700">{project.leadName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <ProjectActionsDropdown projectId={project._id} />
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
               <TableRow>
                 <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                   No projects found in the system.
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Separate component for client-side interactivity
function ProjectActionsDropdown({ projectId }: { projectId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {/* VIEW: Reuse the Lead's view page */}
        <DropdownMenuItem asChild>
          <Link href={`/lead/projects/${projectId}`} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" /> View Details
          </Link>
        </DropdownMenuItem>

        {/* EDIT: Reuse the Lead's edit page */}
        <DropdownMenuItem asChild>
          <Link href={`/lead/projects/${projectId}/edit`} className="cursor-pointer">
             <MoreHorizontal className="mr-2 h-4 w-4" /> Edit Project
          </Link>
        </DropdownMenuItem>
        
        {/* DELETE: Server Action */}
        <form action={async () => {
            'use server'
            await deleteProject(projectId)
          }}>
          <DropdownMenuItem asChild>
            <button type="submit" className="text-red-600 w-full flex items-center cursor-pointer hover:text-red-700 focus:text-red-700 focus:bg-red-50">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Project
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}