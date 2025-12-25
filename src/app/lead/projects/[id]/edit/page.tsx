import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import ProjectForm from '@/components/lead/ProjectForm';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const user = await checkRole(['lead', 'admin']);
  await dbConnect();

  const { id } = await params;

  const project = await Project.findById(id).lean();

  if (!project) return notFound();

  // Strict Ownership Check
  if (user.role !== 'admin' && project.leadId.toString() !== user.dbId) {
    redirect('/lead');
  }

  const plainProject = {
    _id: project._id.toString(),
    title: project.title,
    description: project.description,
    location: project.location || '',
    status: project.status,
    startDate: project.startDate ? new Date(project.startDate).toISOString() : undefined,
    leadId: project.leadId.toString(),
    capacity: project.capacity, 
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Edit Project</h1>
      {/* Pass userRole so the form redirects to /admin or /lead appropriately */}
      <ProjectForm project={plainProject} userRole={user.role} />
    </div>
  );
}