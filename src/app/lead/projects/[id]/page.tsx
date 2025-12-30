import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import { Participation } from '@/models/Participation';
import User from '@/models/User'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Mail, 
  AlignLeft,
  Edit,
  Users,
  ChevronLeft
} from "lucide-react";
import Link from 'next/link';
import { ReportVolunteerDialog } from "./reportVolunteerDialog"; // Adjust path if needed
import { notFound, redirect } from 'next/navigation';
import { CapacityBadge } from "@/components/capacityBadge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectManagePage({ params }: PageProps) {
  const { id } = await params;
  const user = await checkRole(['lead', 'admin']);
  
  await dbConnect();

  // Find project by ID only
  const project = await Project.findById(id).lean();

  if (!project) {
    return notFound();
  }

  // Verify Owner OR Admin
  const isOwner = project.leadId.toString() === user.dbId;
  const isAdmin = user.role === 'admin';
  let showActions = true;

  if (!isOwner && !isAdmin) {
    redirect("/unauthorized");
  }

  if (isAdmin) {
    showActions = false;
  }

  const enrollments = await Participation.find({ projectId: id })
    .populate({
      path: 'userId',
      model: User,
      select: 'name email'
    })
    .sort({ createdAt: -1 })
    .lean();

  // If Admin, go to Admin Projects. If Lead, go to Lead Dashboard.
  const backLink = isAdmin ? "/admin/projects" : "/lead";
  const backText = isAdmin ? "Back to Admin Oversight" : "Back to Dashboard";

  // Counts
  const currentCount = enrollments.length;
  const capacity = project.capacity;

  return (
    // MOBILE FIX: px-4 and py-8 for better mobile spacing
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      
      {/* Top Navigation & Header */}
      <div className="mb-8">
        <div className="mb-4">
            <Button variant="ghost" size="sm" asChild className="pl-0 text-slate-500 hover:text-slate-900 -ml-2">
                <Link href={backLink}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> {backText}
                </Link>
            </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
             <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 break-words">
                    {project.title}
                </h1>
                {/* Mobile: Status badge next to title */}
                <Badge 
                    variant={project.status === 'active' ? 'default' : 'secondary'} 
                    className={`capitalize px-2 py-0.5 text-xs md:hidden ${project.status === 'active' ? 'bg-emerald-600' : ''}`}
                >
                  {project.status}
                </Badge>
             </div>
             {/* Subtitle / ID for context */}
             <p className="text-xs text-slate-400 font-mono">ID: {project._id.toString()}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {/* Desktop Status Badge */}
            <Badge 
                variant={project.status === 'active' ? 'default' : 'secondary'} 
                className={`capitalize px-4 py-1 text-sm hidden md:inline-flex ${project.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            >
              {project.status}
            </Badge>

            <Button variant="outline" size="sm" asChild className="ml-auto md:ml-0 border-slate-300">
              <Link href={`/lead/projects/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" /> Edit Project
              </Link>
            </Button>
          </div>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Project Details (Stacks on top on mobile) */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Capacity Detail */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-slate-500">
                  <Users className="h-4 w-4 mr-2" /> Capacity Status
                </div>
                <div className="flex items-center justify-between">
                  <CapacityBadge current={currentCount} max={capacity} />
                  <span className="text-xs text-slate-400">
                    {capacity ? `${Math.round((currentCount / capacity) * 100)}% Full` : ''}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Date */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-slate-500">
                  <Calendar className="h-4 w-4 mr-2" /> Date
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'TBD'}
                </p>
              </div>

              <Separator />

              {/* Location */}
              <div className="space-y-2">
                 <div className="flex items-center text-sm font-medium text-slate-500">
                  <MapPin className="h-4 w-4 mr-2" /> Location
                </div>
                <p className="text-sm font-medium text-slate-900">{project.location || 'TBD'}</p>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-slate-500">
                  <AlignLeft className="h-4 w-4 mr-2" /> Description
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-md border border-slate-100">
                  {project.description || "No description provided."}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Volunteers List (Main content) */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card className="h-full border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        Volunteers 
                        <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-700 hover:bg-slate-300">{currentCount}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                        Manage participation and track attendance.
                    </CardDescription>
                </div>
                <div className="text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 whitespace-nowrap">
                   {capacity ? `${capacity - currentCount} spots remaining` : 'Open enrollment'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {enrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">No volunteers yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs mt-1 px-4">
                    As people join your project, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* MOBILE-FRIENDLY LIST ITEM */}
                  {enrollments.map((enrollment: any) => (
                    <div 
                        key={enrollment._id.toString()} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-4"
                    >
                      {/* User Info */}
                      <div className="flex items-start gap-3">
                        {/* Avatar Placeholder */}
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 font-medium text-sm">
                            {enrollment.userId?.name?.charAt(0) || "U"}
                        </div>
                        
                        <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                                {enrollment.userId?.name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1.5 truncate">
                                <Mail className="h-3 w-3" /> {enrollment.userId?.email}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 sm:hidden">
                                Joined {new Date(enrollment.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                      </div>

                      {/* Desktop Date + Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                         <div className="text-sm text-slate-500 hidden sm:block text-right">
                            <span className="block text-xs text-slate-400">Joined</span>
                            {new Date(enrollment.createdAt).toLocaleDateString()}
                         </div>

                         {showActions && (
                            <ReportVolunteerDialog 
                              volunteerId={enrollment.userId?._id.toString()} 
                              volunteerName={enrollment.userId?.name || "User"}
                              projectId={id} 
                            />
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}