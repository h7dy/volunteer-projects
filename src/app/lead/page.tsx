import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, MapPin, Calendar, Activity, CheckCircle2, Users } from "lucide-react";
import { DeleteProjectButton } from './DeleteProjectButton';
import { CapacityBadge } from "@/components/capacityBadge";

export const dynamic = 'force-dynamic';

export default async function LeadDashboard() {
  const user = await checkRole(['lead']);
  await dbConnect();

  // Fetch projects owned by this lead
  const projects = await Project.find({ leadId: user.dbId })
    .sort({ createdAt: -1 })
    .lean();
  
  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  
  const totalActiveEnrollments = activeProjects.reduce((sum, p) => sum + (p.enrolledCount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">Currently live</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveEnrollments}</div>
            <p className="text-xs text-muted-foreground">Enrolled across active projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-gray-500">Create your first project to get started.</p>
          </div>
        ) : (
          projects.map((project) => (
            <Card key={project._id.toString()} className="flex flex-col md:flex-row items-start md:items-center p-5 gap-5 hover:border-emerald-200 transition-colors group">
              
              {/* Status Badge */}
              <div className="shrink-0 self-start md:self-center">
                <Badge 
                  variant={project.status === 'active' ? 'default' : 'secondary'} 
                  className={`w-24 justify-center capitalize ${project.status === 'active' ? 'bg-emerald-600' : ''}`}
                >
                  {project.status}
                </Badge>
              </div>

              {/* Info Section */}
              <div className="flex-1 min-w-0 space-y-2">
                <Link 
                  href={`/lead/projects/${project._id.toString()}`}
                  className="block font-semibold text-lg truncate group-hover:text-emerald-600 transition-colors"
                >
                  {project.title}
                </Link>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                  {/* Location */}
                  {project.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {project.location}
                    </span>
                  )}
                  
                  {/* Date */}
                  {project.startDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> 
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  )}

                  {/* Capacity Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Capacity:</span>
                    <CapacityBadge 
                      current={project.enrolledCount} 
                      max={project.capacity} 
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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