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
  Users
} from "lucide-react";
import Link from 'next/link';
import { ReportVolunteerDialog } from "./reportVolunteerDialog";
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Top Navigation & Header */}
      <div className="mb-8">
        <Link 
          href={backLink} 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-emerald-600 mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {backText}
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{project.title}</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <CapacityBadge current={currentCount} max={capacity} />

            <Button variant="outline" size="sm" asChild>
              <Link href={`/lead/projects/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" /> Edit Project
              </Link>
            </Button>

            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize px-4 py-1 text-sm">
              {project.status}
            </Badge>
          </div>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Project Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <AlignLeft className="h-4 w-4 mr-2" /> Description
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {project.description || "No description provided."}
                </p>
              </div>

              <Separator />

              {/* Capacity Detail */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" /> Capacity
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {capacity ? `${capacity} Volunteers Max` : 'Unlimited Spots'}
                  </p>
                  {capacity && currentCount >= capacity && (
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5">FULL</Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Date */}
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" /> Date
                </div>
                <p className="text-sm font-medium">
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
                 <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" /> Location
                </div>
                <p className="text-sm font-medium">{project.location || 'TBD'}</p>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Volunteers List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Volunteers ({currentCount})</CardTitle>
                <div className="text-sm text-muted-foreground">
                   {capacity ? `${capacity - currentCount} spots remaining` : 'Open enrollment'}
                </div>
              </div>
              <CardDescription>
                Manage participation and track attendance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg border-slate-200 bg-slate-50">
                  <div className="p-3 rounded-full bg-white shadow-sm mb-3">
                    <Mail className="h-6 w-6 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900">No volunteers yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs mt-1">
                    Once users join this project, they will appear in this list.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-500">Volunteer Name</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Email</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Joined Date</th>
                        {showActions && (<th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {enrollments.map((enrollment: any) => (
                        <tr key={enrollment._id.toString()} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{enrollment.userId?.name || 'Unknown User'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                               <Mail className="h-3 w-3" /> {enrollment.userId?.email}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(enrollment.createdAt).toLocaleDateString()}
                          </td>
                          {showActions && (<td className="px-4 py-3 text-right">
                            <ReportVolunteerDialog 
                              volunteerId={enrollment.userId?._id.toString()} 
                              volunteerName={enrollment.userId?.name || "User"}
                              projectId={id} 
                            />
                          </td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}