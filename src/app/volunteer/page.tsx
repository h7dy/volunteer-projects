import { checkRole } from '@/lib/auth';
import { Participation } from '@/models/Participation';
import { Project } from '@/models/Project';
import dbConnect from '@/lib/db';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Trophy, Clock, FolderOpen } from "lucide-react";

export default async function VolunteerDashboard() {
  const user = await checkRole(['volunteer']);
  
  await dbConnect();

  const myEnrollments = await Participation.find({ userId: user.dbId })
    .populate({ path: 'projectId', model: Project }) 
    .lean();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name || user.email}
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/projects">
            Browse New Projects <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myEnrollments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Level</CardTitle>
            <Trophy className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Novice</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Your Commitments</h2>
        
        {myEnrollments.length === 0 ? (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-10 w-10 text-slate-400 mb-4" />
              <h3 className="font-medium text-lg">No active projects</h3>
              <p className="text-slate-500 mb-4">Start making a difference today!</p>
              <Button variant="outline" asChild>
                <Link href="/projects">Find a Project</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myEnrollments.map((enrollment: any) => {
              const project = enrollment.projectId;
              if (!project) return null;

              return (
                <Card key={enrollment._id} className="flex flex-row items-center p-4 gap-4">
                   <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="font-bold text-emerald-700 text-lg">
                        {project.title ? project.title.charAt(0) : "P"}
                      </span>
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-semibold truncate">{project.title}</h4>
                     <p className="text-sm text-muted-foreground capitalize">
                       Status: {enrollment.status}
                     </p>
                   </div>
                   <Badge variant={enrollment.status === 'accepted' ? 'default' : 'secondary'}>
                     {enrollment.status}
                   </Badge>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}