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
import { CapacityBadge } from "@/components/capacityBadge";

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

  // Data Clean up
  const lead = project.leadId as unknown as { name?: string; email?: string } | null;
  const leadName = lead?.name || "Unknown Lead";
  const leadEmail = lead?.email || null;
  const enrolledCount = project.enrolledCount || 0;
  const capacity = project.capacity;

  const formattedDate = project.startDate 
    ? new Date(project.startDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : 'Date to be announced';

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      
      {/* Back Link with Touch Target */}
      <div className="mb-6 md:mb-8">
        <Link 
          href="/projects" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-700 transition-colors py-2 pr-4 -ml-2 pl-2 rounded-md hover:bg-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Back to Projects
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:gap-12">
        <div className="space-y-8">
          
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge 
                variant={project.status === 'active' ? 'default' : 'secondary'} 
                className={`capitalize ${project.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                {project.status}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {project.title}
            </h1>
          </div>

          <Separator />

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date */}
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Date</p>
                <p className="text-slate-600 text-sm mt-0.5">{formattedDate}</p>
              </div>
            </div>

            {/* Location */}
            {project.location && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Location</p>
                  <p className="text-slate-600 text-sm mt-0.5">{project.location}</p>
                </div>
              </div>
            )}

            {/* Organizer */}
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm sm:col-span-2 md:col-span-1">
              <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                <UserIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Organizer</p>
                <p className="text-slate-600 text-sm font-medium mt-0.5">{leadName}</p>
                {leadEmail && (
                  <a href={`mailto:${leadEmail}`} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-1.5">
                    <Mail className="h-3 w-3" /> Contact Lead
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-slate prose-lg max-w-none">
            <h3 className="text-xl font-bold text-slate-900 mb-4">About this Project</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>

        {/* Sidebar / CTA Card */}
        <div className="lg:pl-0">
          <Card className="lg:sticky lg:top-8 border-emerald-100 shadow-lg overflow-hidden flex flex-col p-1">            
            <div className="bg-emerald p-4 border-b border-emerald-100 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-semibold text-emerald-900">Get Involved</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              
              {/* Capacity Display */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                  <span>Current Enrollment</span>
                  <span className="text-xs text-slate-400">
                    {capacity ? `${Math.round((enrolledCount / capacity) * 100)}% Full` : 'Open'}
                  </span>
                </div>
                <CapacityBadge current={enrolledCount} max={capacity} />
              </div>

              <div className="space-y-1">
                <p className="text-sm text-slate-500 leading-normal">
                  {project.status === 'active' 
                    ? "Ready to help? Join this project to confirm your attendance and receive updates."
                    : "This project is currently not accepting new volunteers."}
                </p>
              </div>

              {/* Action Button Component */}
              <ProjectActionButtons 
                projectId={project._id.toString()} 
                isJoined={isJoined}
                projectStatus={project.status}
                capacity={capacity}
                enrolledCount={enrolledCount}
              />
              
              <div className="pt-4 border-t text-xs text-center text-slate-400 flex items-center justify-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Posted on {new Date(project.createdAt).toLocaleDateString()}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}