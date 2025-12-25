// src/app/projects/page.tsx
import { checkRole } from '@/lib/auth';
import { Project } from '@/models/Project';
import { Participation } from '@/models/Participation';
import ProjectCard from '@/app/projects/ProjectCard';
import dbConnect from '@/lib/db';
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  // Get Current User
  const user = await checkRole(['volunteer']);
  
  await dbConnect();

  // Parallel Fetching: Get Active Projects AND My Enrollments
  const [projects, myEnrollments] = await Promise.all([
    Project.find({ status: 'active' }).sort({ createdAt: -1 }).lean(),
    Participation.find({ userId: user.dbId }).select('projectId').lean()
  ]);

  // Create a lookup set of IDs the user has joined
  const joinedProjectIds = new Set(
    myEnrollments.map((p) => p.projectId.toString())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore Projects</h1>
        <p className="text-muted-foreground mt-1">
          Find opportunities to contribute and make a difference.
        </p>
      </div>

      <Separator />

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-dashed">
          <Search className="h-10 w-10 text-slate-400 mb-4" />
          <h3 className="font-medium text-lg text-slate-900">No active projects</h3>
          <p className="text-slate-500 max-w-sm">
            Check back later! New opportunities are added regularly.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <ProjectCard 
              key={project._id.toString()} 
              project={{
                _id: project._id.toString(),
                title: project.title,
                description: project.description,
                status: project.status, 
                location: project.location,
                startDate: project.startDate,
                capacity: project.capacity, 
                enrolledCount: project.enrolledCount || 0,
              }}
              isJoined={joinedProjectIds.has(project._id.toString())}
            />
          ))}
        </div>
      )}
    </div>
  );
}