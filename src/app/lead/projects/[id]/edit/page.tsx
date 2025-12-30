import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import ProjectForm from '@/app/lead/projects/ProjectForm';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

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

  // Convert MongoDB object to plain object for React
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

  // Determine back link based on role
  const backLink = user.role === 'admin' 
    ? `/admin/projects` // Admin goes to list
    : `/lead/projects/${id}`; // Lead goes back to details

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
      
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="pl-0 text-slate-500 hover:text-slate-900 -ml-2">
            <Link href={backLink}>
                <ChevronLeft className="mr-1 h-4 w-4" /> 
                {user.role === 'admin' ? 'Back to Projects' : 'Back to Project Details'}
            </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Edit Project
            </h1>
            <p className="text-slate-500 text-sm">
                Update details for <span className="font-medium text-slate-700">{project.title}</span>
            </p>
        </div>
      </div>

      {/* Form Component */}
      <ProjectForm project={plainProject} userRole={user.role} />
    </div>
  );
}