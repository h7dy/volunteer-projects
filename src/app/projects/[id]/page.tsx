import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import { Participation } from '@/models/Participation';
import { notFound } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
// Import the new Client Component
import ProjectActionButtons from './ProjectActionButtons'; 

interface PageProps {
  params: { id: string };
}

export default async function ProjectDetailsPage({ params }: PageProps) {
  const user = await checkRole(['volunteer']);
  await dbConnect();

  // 1. Fetch Project
  const project = await Project.findById(params.id).lean();
  if (!project) return notFound();

  // 2. Check Status
  const existingParticipation = await Participation.findOne({
    userId: user.dbId,
    projectId: params.id
  }).lean();

  const isJoined = !!existingParticipation;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-emerald-600 mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
      </Link>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <div className="flex gap-2 mb-3">
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <Card className="sticky top-8 border-emerald-100 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-1">Take Action</h3>
                <p className="text-sm text-muted-foreground">
                  Ready to make a difference?
                </p>
              </div>

              {/* REPLACED THE FORMS WITH THIS COMPONENT */}
              <ProjectActionButtons 
                projectId={project._id.toString()} 
                isJoined={isJoined} 
              />
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}