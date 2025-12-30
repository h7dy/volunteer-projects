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
  User as UserIcon,
  MapPin,
  Edit
} from "lucide-react";
import Link from "next/link";
import { AdminProjectActions } from "./adminProjectActions";

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsForAdmin();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Project Oversight</h1>
          <p className="text-slate-500 mt-1">Manage and monitor all volunteer initiatives.</p>
        </div>
        <div className="bg-emerald-500 px-4 py-2 rounded-full text-sm font-medium text-white whitespace-nowrap">
          Total Projects: {projects.length}
        </div>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
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
              <TableRow key={project._id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  <div className="text-slate-900">{project.title}</div>
                  <div className="text-xs text-slate-400 font-normal mt-0.5 truncate max-w-[250px]">
                    {project.description || "No description"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                       <UserIcon className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-slate-700">{project.leadName || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={project.status === 'active' ? 'default' : 'secondary'} 
                    className={`capitalize ${project.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <AdminProjectActions projectId={project._id.toString()} />
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
               <TableRow>
                 <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                   No projects found in the system.
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="md:hidden space-y-4">
        {projects.map((project: any) => (
            <div key={project._id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{project.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                    </div>
                    <AdminProjectActions projectId={project._id.toString()} />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                     <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] shrink-0">
                       <UserIcon className="h-3 w-3" />
                    </div>
                    <span className="truncate">Lead: {project.leadName || 'Unknown'}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                     <Badge 
                        variant={project.status === 'active' ? 'default' : 'secondary'} 
                        className={`capitalize ${project.status === 'active' ? 'bg-emerald-600' : ''}`}
                    >
                        {project.status}
                    </Badge>
                     <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}
                    </div>
                </div>
            </div>
        ))}
        {projects.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No projects found.
            </div>
        )}
      </div>
    </div>
  );
}