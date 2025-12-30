import { checkRole } from '@/lib/auth';
import { Project } from '@/models/Project';
import { Participation } from '@/models/Participation';
import ProjectCard from '@/app/projects/ProjectCard';
import dbConnect from '@/lib/db';
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  // Get Current User
  const user = await checkRole(['volunteer']);
  
  await dbConnect();

  // Parallel Fetching: Get Active Projects AND User's Enrollments
  const [projects, myEnrollments] = await Promise.all([
    Project.find({ status: 'active' }).sort({ createdAt: -1 }).lean(),
    Participation.find({ userId: user.dbId }).select('projectId').lean()
  ]);

  // Create a lookup set of IDs the user has joined
  const joinedProjectIds = new Set(
    myEnrollments.map((p) => p.projectId.toString())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Explore Projects
          </h1>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-2.5">
            {projects.length} Active
          </Badge>
        </div>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl">
          Find opportunities to contribute and make a difference in your community.
        </p>
      </div>

      <Separator />

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
             <Search className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900">No active projects</h3>
          <p className="text-slate-500 max-w-sm mt-1 text-sm">
            Check back later! New volunteer opportunities are added regularly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
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