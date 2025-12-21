import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import ProjectForm from '@/components/lead/ProjectForm';
import { notFound, redirect } from 'next/navigation';

// 1. Define params as a Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const user = await checkRole(['lead', 'admin']);
  await dbConnect();

  // 2. Await params before using them
  const { id } = await params;

  const project = await Project.findById(id).lean();

  if (!project) return notFound();

  // Strict Ownership Check
  if (user.role !== 'admin' && project.leadId.toString() !== user.dbId) {
    redirect('/lead');
  }

  // 3. Manual Serialization (Fixes "Only plain objects" error)
  // We construct a new object to ensure no MongoDB ObjectIds (like leadId) slip through.
  const plainProject = {
    _id: project._id.toString(),
    title: project.title,
    description: project.description,
    location: project.location || '',
    status: project.status,
    // Convert Dates to ISO strings
    startDate: project.startDate ? new Date(project.startDate).toISOString() : undefined,
    // Convert leadId ObjectId to string
    leadId: project.leadId.toString(),
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Project</h1>
      <ProjectForm project={plainProject} />
    </div>
  );
}