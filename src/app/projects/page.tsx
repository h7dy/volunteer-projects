// src/app/projects/page.tsx
import { checkRole } from '@/lib/auth';
import { Project, IProject } from '@/models/Project';
import { Participation } from '@/models/Participation';
import ProjectCard from '@/app/projects/ProjectCard';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  // Get Current User
  const user = await checkRole(['volunteer']);
  
  await dbConnect();

  // Parallel Fetching: Get Projects AND My Enrollments
  const [projects, myEnrollments] = await Promise.all([
    Project.find({ status: 'active' }).sort({ createdAt: -1 }).lean(),
    Participation.find({ userId: user.dbId }).select('projectId').lean()
  ]);

  // Create a lookup set of IDs the user has joined
  const joinedProjectIds = new Set(
    myEnrollments.map((p) => p.projectId.toString())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Open Projects</h1>
        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          Volunteer: {user.name}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project: any) => (
          <ProjectCard 
            key={project._id.toString()} 
            project={{
              _id: project._id.toString(),
              title: project.title,
              description: project.description,
            }}
            isJoined={joinedProjectIds.has(project._id.toString())}
          />
        ))}
        
        {projects.length === 0 && (
          <p className="text-gray-500">No active projects found.</p>
        )}
      </div>
    </div>
  );
}