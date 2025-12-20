import { checkRole } from '@/lib/auth';
import { Participation } from '@/models/Participation';
import { Project } from '@/models/Project';
import dbConnect from '@/lib/db';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Zap, Search, History, MapPin, Calendar, ArrowRight } from "lucide-react";

export default async function VolunteerDashboard() {
  const user = await checkRole(['volunteer']);
  await dbConnect();

  // Fetch User Enrollments
  const myEnrollments = await Participation.find({ userId: user.dbId })
    .populate({ path: 'projectId', model: Project })
    .lean();

  // Filter Data
  const activeCommitments = myEnrollments.filter((p: any) => 
    p.projectId?.status === 'active'
  );

  const pastCommitments = myEnrollments.filter((p: any) => 
    p.projectId?.status === 'completed' || p.projectId?.status === 'archived'
  );

  // Stats: New Opportunities
  const myProjectIds = myEnrollments.map((p: any) => p.projectId?._id);
  const newOpportunitiesCount = await Project.countDocuments({
    status: 'active',
    _id: { $nin: myProjectIds }
  });

  // --- Helper to render a single project card ---
  const renderProjectCard = (enrollment: any, isHistory: boolean) => {
    const project = enrollment.projectId;
    if (!project || !project.title) return null;

    // Safety check for date (handles missing field)
    const formattedDate = project.startDate 
      ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
      : 'Date TBD';

    return (
      <Card key={enrollment._id.toString()} className="flex flex-row items-center p-4 gap-4 transition-all hover:bg-slate-50/80 hover:shadow-sm">
        {/* Icon / Avatar */}
        <Link href={`/projects/${project._id.toString()}`} className="shrink-0">
          <div className={`h-14 w-14 rounded-xl flex items-center justify-center transition-colors ${
            isHistory ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <span className="font-bold text-xl">
              {project.title.charAt(0)}
            </span>
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <Link href={`/projects/${project._id.toString()}`} className="hover:underline">
            <h4 className={`font-semibold truncate ${isHistory ? 'text-muted-foreground' : 'text-slate-900'}`}>
              {project.title}
            </h4>
          </Link>
          
          {/* Metadata Row: Only renders if data exists */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {project.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">{project.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="hidden sm:block">
           <Badge variant={isHistory ? 'secondary' : 'default'}>
            {isHistory ? 'Done' : 'Active'}
          </Badge>
        </div>
      </Card>
    );
  };

  // --- Helper for Empty State ---
  const EmptyState = ({ message, icon: Icon }: { message: string, icon: any }) => (
    <Card className="bg-slate-50 border-dashed shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className="h-10 w-10 text-slate-400 mb-4" />
        <h3 className="font-medium text-lg text-slate-900">{message}</h3>
        <p className="text-slate-500 mb-4 max-w-sm text-sm">
          {message.includes("past") 
            ? "Complete active projects to see them appear here." 
            : "Join a project from the board to get started."}
        </p>
        {!message.includes("past") && (
          <Button variant="outline" asChild>
            <Link href="/projects">Find a Project</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name || user.email}
          </p>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrolled</CardTitle>
            <Zap className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCommitments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Current commitments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">History</CardTitle>
            <History className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastCommitments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed projects</p>
          </CardContent>
        </Card>

        {/* GREEN CTA Card */}
        <Link href="/projects">
          <Card className="bg-emerald-600 text-white border-emerald-500 shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">New Opportunities</CardTitle>
              <Search className="h-4 w-4 text-emerald-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newOpportunitiesCount}</div>
              <div className="flex items-center mt-1 text-emerald-100/90 text-xs">
                 Browse & Join <ArrowRight className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="active">Active Commitments</TabsTrigger>
          <TabsTrigger value="history">Past History</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="active" className="space-y-4">
            {activeCommitments.length === 0 ? (
              <EmptyState message="No active commitments" icon={Zap} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeCommitments.map(e => renderProjectCard(e, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
             {pastCommitments.length === 0 ? (
              <EmptyState message="No past history yet" icon={History} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pastCommitments.map(e => renderProjectCard(e, true))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}