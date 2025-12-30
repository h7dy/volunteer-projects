import { checkRole } from '@/lib/auth';
import ProjectForm from '@/app/lead/projects/ProjectForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default async function NewProjectPage() {
  await checkRole(['lead', 'admin']);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
      
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="pl-0 text-slate-500 hover:text-slate-900 -ml-2">
            <Link href="/lead">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </Link>
        </Button>
      </div>

      {/* Header with Subtitle */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Create New Project
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
            Launch a new volunteer initiative. Fill in the details below to start recruiting.
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}