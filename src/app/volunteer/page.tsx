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

  // Stats
  const myProjectIds = myEnrollments.map((p: any) => p.projectId?._id);
  const newOpportunitiesCount = await Project.countDocuments({
    status: 'active',
    _id: { $nin: myProjectIds }
  });

  // --- Helper to render a single project card ---
  const renderProjectCard = (enrollment: any, isHistory: boolean) => {
    const project = enrollment.projectId;
    if (!project || !project.title) return null;

    const formattedDate = project.startDate 
      ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
      : 'Date TBD';

    return (
      <Card key={enrollment._id.toString()} className="group relative overflow-hidden transition-all hover:bg-slate-50/80 hover:shadow-md">
        <Link href={`/projects/${project._id.toString()}`} className="flex flex-row items-start p-4 gap-4">
          
          {/* Icon / Avatar */}
          <div className={`shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center transition-colors border ${
            isHistory 
              ? 'bg-slate-100 border-slate-200 text-slate-500' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-100'
          }`}>
            <span className="font-bold text-lg md:text-xl">
              {project.title.charAt(0)}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 py-0.5">
            <div className="flex justify-between items-start gap-2">
              <h4 className={`font-semibold text-base leading-tight truncate pr-2 ${isHistory ? 'text-muted-foreground' : 'text-slate-900'}`}>
                {project.title}
              </h4>
              
              {/* Desktop Status Badge (Hidden on mobile to save space) */}
              <Badge variant={isHistory ? 'secondary' : 'default'} className="hidden sm:inline-flex shrink-0">
                {isHistory ? 'Done' : 'Active'}
              </Badge>
            </div>
            
            {/* Metadata Row */}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs md:text-sm text-muted-foreground">
              {project.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 opacity-70" />
                  <span className="truncate max-w-[120px] md:max-w-[150px]">{project.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 opacity-70" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  };

  // --- Helper for Empty State ---
  const EmptyState = ({ message, icon: Icon }: { message: string, icon: any }) => (
    <Card className="bg-slate-50 border-dashed shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-10 md:py-12 text-center px-4">
        <div className="h-12 w-12 bg-white rounded-full border border-slate-200 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="font-medium text-lg text-slate-900">{message}</h3>
        <p className="text-slate-500 mb-6 max-w-xs text-sm leading-relaxed mt-1">
          {message.includes("past") 
            ? "Complete active projects to see them appear here." 
            : "Join a project from the board to get started."}
        </p>
        {!message.includes("past") && (
          <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link href="/projects">Find a Project</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Welcome back, {user.name || user.email}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-500">Active</CardTitle>
            <Zap className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{activeCommitments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs md:text-sm font-medium text-slate-500">History</CardTitle>
            <History className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{pastCommitments.length}</div>
          </CardContent>
        </Card>

        {/* GREEN CTA Card */}
        <Link href="/projects" className="col-span-2 md:col-span-1 block h-full">
          <Card className="bg-emerald-600 text-white border-emerald-500 shadow-sm active:scale-[0.98] transition-transform h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs md:text-sm font-medium text-emerald-100">Browse New</CardTitle>
              <Search className="h-4 w-4 text-emerald-100" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{newOpportunitiesCount}</div>
                <span className="text-xs text-emerald-100/80 font-medium">Projects</span>
              </div>
              <div className="flex items-center mt-2 text-emerald-50 text-xs font-medium">
                 View Board <ArrowRight className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Separator className="my-6" />

      {/* Tabs Section */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="active" className="space-y-4 animate-in slide-in-from-left-2 duration-300 fade-in">
            {activeCommitments.length === 0 ? (
              <EmptyState message="No active commitments" icon={Zap} />
            ) : (
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                {activeCommitments.map(e => renderProjectCard(e, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 animate-in slide-in-from-right-2 duration-300 fade-in">
             {pastCommitments.length === 0 ? (
              <EmptyState message="No past history yet" icon={History} />
            ) : (
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                {pastCommitments.map(e => renderProjectCard(e, true))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}