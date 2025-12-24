// app/lead/page.tsx
import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import { Participation } from '@/models/Participation'; // Import your model
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, MapPin, Calendar, Users, Activity, CheckCircle2 } from "lucide-react";
import { DeleteProjectButton } from './DeleteProjectButton';

export const dynamic = 'force-dynamic';

export default async function LeadDashboard() {
  const user = await checkRole(['lead']);
  await dbConnect();

  // Fetch projects owned by this lead
  const projects = await Project.find({ leadId: user.dbId }).sort({ createdAt: -1 }).lean();
  
  // Get list of project IDs to query participations
  const projectIds = projects.map(p => p._id);

  // AGGREGATION
  const stats = await Participation.aggregate([
    { 
      $match: { 
        projectId: { $in: projectIds },
      } 
    },
    { 
      $group: { 
        _id: '$projectId', 
        count: { $sum: 1 } 
      } 
    }
  ]);

  // Create Maps for lookup: { projectId: count }
  const countMap: Record<string, number> = {};
  stats.forEach((stat) => {
    countMap[stat._id.toString()] = stat.count;
  });

  // Calculate Total Dashboard Stats
  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  
  // Sum up all counts from the map
  const totalActiveEnrollments = activeProjects.reduce((sum, project) => {
    const count = countMap[project._id.toString()] || 0;
    return sum + count;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
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
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveEnrollments}</div>
            <p className="text-xs text-muted-foreground">Volunteers across active projects</p>
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
          projects.map((project) => {
            const volunteerCount = countMap[project._id.toString()] || 0;

            return (
              <Card key={project._id.toString()} className="flex flex-col md:flex-row items-start md:items-center p-5 gap-5 hover:border-emerald-200 transition-colors">
                
                {/* Status Badge */}
                <div className="shrink-0">
                  <Badge 
                    variant={project.status === 'active' ? 'default' : 'secondary'} 
                    className={`w-24 justify-center capitalize ${project.status === 'active' ? 'bg-emerald-600' : ''}`}
                  >
                    {project.status}
                  </Badge>
                </div>

                {/* Info Section */}
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
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <Users className="h-3.5 w-3.5" /> 
                      {volunteerCount} Volunteers
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/lead/projects/${project._id.toString()}`}>
                      <Users className="h-4 w-4 mr-2" /> Manage
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/lead/projects/${project._id.toString()}/edit`}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Link>
                  </Button>
                  
                  <DeleteProjectButton projectId={project._id.toString()} />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}