import { checkRole } from '@/lib/auth';
import { getAdminStats } from '@/app/actions/admin';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, UserCog, Users, Flag, UserPlus, TrendingUp, ShieldAlert } from "lucide-react";
import { Button } from '@/components/ui/button';

export default async function AdminDashboard() {
  await checkRole(['admin']);
  const stats = await getAdminStats();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      
      {/* Header: Flex-col on mobile, Flex-row on desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Admin Console</h1>
          <p className="text-slate-500 mt-1">System-wide overview and controls</p>
        </div>
        
        <Button asChild className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-800">
           <Link href="/admin/users">
             <Users className="mr-2 h-4 w-4" /> Manage Users
           </Link>
        </Button>
      </div>

      {/* Stats Grid 1: General Counts */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-4 md:mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
            <UserCog className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm sm:col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Volunteers</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalVolunteers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid 2: Actionable / Time-based */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Flagged Users</CardTitle>
            <Flag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalFlagged}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Lead Requests</CardTitle>
            <UserPlus className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLeadRequests}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm sm:col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Recent Signups (30 Days)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalRecent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
        <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-amber-900">Admin Responsibility</h3>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">
            As an admin, you have full access to user data. Banning a user will immediately revoke their access to the platform. 
            Changing a user's role to 'Lead' grants them the ability to create and manage projects.
          </p>
        </div>
      </div>
    </div>
  );
}