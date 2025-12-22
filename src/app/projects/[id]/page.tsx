// src/app/projects/[id]/page.tsx
import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import { Participation } from '@/models/Participation';
import User from '@/models/User'; 
import { notFound } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, MapPin, Clock, User as UserIcon, Mail } from 'lucide-react';
import Link from 'next/link';
import ProjectActionButtons from './ProjectActionButtons'; 

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
  const user = await checkRole(['volunteer']);
  await dbConnect();

  const project = await Project.findById(id)
    .populate({ 
      path: 'leadId', 
      model: User, 
      select: 'name email' 
    })
    .lean();

  if (!project) return notFound();

  // Check Status
  const existingParticipation = await Participation.findOne({
    userId: user.dbId,
    projectId: id
  }).lean();

  const isJoined = !!existingParticipation;

  const lead = project.leadId as unknown as { name?: string; email?: string } | null;
  const leadName = lead?.name || "Unknown Lead";
  const leadEmail = lead?.email || null;

  const formattedDate = project.startDate 
    ? new Date(project.startDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : 'Date to be announced';

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                {project.status}
              </Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {project.title}
            </h1>
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <Calendar className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 text-sm">Date</p>
                <p className="text-slate-600 text-sm">{formattedDate}</p>
              </div>
            </div>

            {project.location && (
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Location</p>
                  <p className="text-slate-600 text-sm">{project.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2 md:col-span-1">
              <UserIcon className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 text-sm">Organizer</p>
                <p className="text-slate-600 text-sm font-medium">{leadName}</p>
                {leadEmail && (
                  <a href={`mailto:${leadEmail}`} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" /> Contact Lead
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-bold text-slate-900">About this Project</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>

        <div className="lg:pl-4">
          <Card className="sticky top-8 border-emerald-100 shadow-lg overflow-hidden">
            <div className="bg-emerald-50/50 p-4 border-b border-emerald-100">
              <h3 className="font-semibold text-emerald-900">Get Involved</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">
                  {project.status === 'active' 
                    ? "Ready to help? Join this project to confirm your attendance."
                    : "This project is currently not accepting new volunteers."}
                </p>
              </div>

              <ProjectActionButtons 
                projectId={project._id.toString()} 
                isJoined={isJoined}
                projectStatus={project.status}
              />
              
              <div className="pt-4 border-t text-xs text-center text-slate-400 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Posted {new Date(project.createdAt).toLocaleDateString()}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}