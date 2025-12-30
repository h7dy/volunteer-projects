import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, MapPin, Calendar, Activity, CheckCircle2, Users, LayoutDashboard } from "lucide-react";
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
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Lead Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your volunteer initiatives and track progress.</p>
        </div>
        <Button asChild className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-sm h-11 md:h-10">
          <Link href="/lead/projects/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Project
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeProjects.length}</div>
            <p className="text-xs text-slate-500 mt-1">Currently live</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{completedProjects.length}</div>
            <p className="text-xs text-slate-500 mt-1">Successfully finished</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Volunteers</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalActiveEnrollments}</div>
            <p className="text-xs text-slate-500 mt-1">Enrolled across active projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
               <LayoutDashboard className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No projects yet</h3>
            <p className="text-slate-500 max-w-sm mt-1">
              Create your first project to start recruiting volunteers.
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <Card key={project._id.toString()} className="flex flex-col md:flex-row items-start md:items-center p-4 md:p-5 gap-5 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md group">
              
              {/* Status Badge */}
              <div className="shrink-0">
                <Badge 
                  variant={project.status === 'active' ? 'default' : 'secondary'} 
                  className={`px-3 py-1 capitalize ${project.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {project.status}
                </Badge>
              </div>

              {/* Info Section */}
              <div className="flex-1 min-w-0 space-y-2 w-full">
                <Link 
                  href={`/lead/projects/${project._id.toString()}`}
                  className="block font-bold text-lg md:text-xl text-slate-900 group-hover:text-emerald-700 transition-colors truncate"
                >
                  {project.title}
                </Link>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-4">
                    {/* Capacity */}
                    <CapacityBadge 
                      current={project.enrolledCount} 
                      max={project.capacity} 
                    />
                    
                    {/* Date */}
                    {project.startDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> 
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  {project.location && (
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="hidden sm:inline text-slate-300">|</span>
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> {project.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Button variant="secondary" size="sm" asChild className="flex-1 md:flex-none h-9 bg-slate-100 hover:bg-slate-200 text-slate-700">
                  <Link href={`/lead/projects/${project._id.toString()}`}>
                    <Users className="h-4 w-4 mr-2" /> 
                    <span className="md:hidden">Manage</span>
                    <span className="hidden md:inline">Manage</span>
                  </Link>
                </Button>

                <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none h-9 border-slate-200 text-slate-600">
                  <Link href={`/lead/projects/${project._id.toString()}/edit`}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Link>
                </Button>
                
                <div className="flex-1 md:flex-none flex justify-end">
                    <DeleteProjectButton projectId={project._id.toString()} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}