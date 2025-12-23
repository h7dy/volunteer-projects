import { checkRole } from '@/lib/auth';
import { getAdminStats } from '@/app/actions/admin';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, Activity, ShieldAlert } from "lucide-react";
import { Button } from '@/components/ui/button';

export default async function AdminDashboard() {
  await checkRole(['admin']);
  const stats = await getAdminStats();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">System-wide overview and controls</p>
        </div>
        <Button asChild>
           <Link href="/admin/users">
             <Users className="mr-2 h-4 w-4" /> Manage Users
           </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <FolderKanban className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex gap-4 items-start">
        <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
        <div>
          <h3 className="font-semibold text-amber-900">Admin Responsibility</h3>
          <p className="text-sm text-amber-800 mt-1">
            As an admin, you have full access to user data. Banning a user will immediately revoke their access to the platform. 
            Changing a user's role to 'Lead' grants them the ability to create and manage projects.
          </p>
        </div>
      </div>
    </div>
  );
}