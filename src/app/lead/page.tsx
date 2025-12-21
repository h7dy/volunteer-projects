import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, MapPin, Calendar, Users } from "lucide-react";
import { DeleteProjectButton } from './DeleteProjectButton';

export const dynamic = 'force-dynamic';

export default async function LeadDashboard() {
  const user = await checkRole(['lead', 'admin']);
  await dbConnect();

  // Fetch only projects owned by this user
  const projects = await Project.find({ leadId: user.dbId }).sort({ createdAt: -1 });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Dashboard</h1>
          <p className="text-muted-foreground">Manage your volunteer initiatives</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
          <Link href="/lead/projects/new">
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-slate-50">
            <div className="rounded-full bg-slate-100 p-3 mb-4">
              <Plus className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No projects yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              You haven't created any initiatives yet. Start by creating your first project to gather volunteers.
            </p>
            <Button asChild>
              <Link href="/lead/projects/new">Create Project</Link>
            </Button>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project._id.toString()} className="flex flex-col md:flex-row items-start md:items-center p-5 gap-5 hover:border-emerald-200 transition-colors">
              
              {/* Status Indicator */}
              <div className="shrink-0">
                <Badge 
                  variant={project.status === 'active' ? 'default' : 'secondary'} 
                  className={`w-24 justify-center capitalize ${project.status === 'active' ? 'bg-emerald-600' : ''}`}
                >
                  {project.status}
                </Badge>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <Link 
                  href={`/lead/projects/${project._id.toString()}`}
                  className="block font-semibold text-lg truncate hover:text-emerald-600 transition-colors"
                >
                  {project.title}
                </Link>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  {project.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {project.location}
                    </span>
                  )}
                  {project.startDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> 
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <Button variant="secondary" size="sm" asChild className="flex-1 md:flex-none">
                  <Link href={`/lead/projects/${project._id.toString()}`}>
                    <Users className="h-4 w-4 mr-2" /> Manage
                  </Link>
                </Button>

                <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none">
                  <Link href={`/lead/projects/${project._id.toString()}/edit`}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Link>
                </Button>
                
                <DeleteProjectButton projectId={project._id.toString()} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}