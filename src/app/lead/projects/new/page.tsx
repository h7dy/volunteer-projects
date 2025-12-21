import { checkRole } from '@/lib/auth';
import ProjectForm from '@/components/lead/ProjectForm';

export default async function NewProjectPage() {
  await checkRole(['lead', 'admin']);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <ProjectForm />
    </div>
  );
}