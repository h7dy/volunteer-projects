import { checkRole } from '@/lib/auth';
import { getUsers } from '@/app/actions/admin';
import Link from 'next/link';
import { ArrowLeft, Mail, Shield, User as UserIcon, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { UserActions } from './userActions';
import { ViewReportsDialog } from "./viewReportsDialog"; // <--- IMPORT

export default async function UserManagementPage() {
  const currentUser = await checkRole(['admin']);
  
  let users = await getUsers();

  // Priority: Lead Requests -> Reported Users -> Newest Users
  users = users.sort((a: any, b: any) => {
    // A. Check Lead Requests
    const aReq = a.hasRequestedLeadAccess && a.role === 'volunteer';
    const bReq = b.hasRequestedLeadAccess && b.role === 'volunteer';
    if (aReq && !bReq) return -1;
    if (!aReq && bReq) return 1;

    // B. Check Reports (If requests are equal, prioritize flagged users)
    const aReports = a.reports?.length || 0;
    const bReports = b.reports?.length || 0;
    if (aReports > 0 && bReports === 0) return -1;
    if (aReports === 0 && bReports > 0) return 1;

    // C. Default to Date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-emerald-600 mb-4 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage roles, permissions, and system access.</p>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
              {users.map((user: any) => {
                const isRequesting = user.hasRequestedLeadAccess && user.role === 'volunteer';
                // Check if user has reports
                const hasReports = user.reports && user.reports.length > 0;
                const sanitizedReports = user.reports?.map((report: any) => {
                // Handle cases where the project might have been deleted (null)
                const project = report.projectId; 
                
                return {
                  _id: report._id.toString(),
                  reason: report.reason,
                  date: new Date(report.date).toISOString(),
                  reporterId: report.reporterId?.toString() || "Unknown",
                  
                  // Extract Title and ID safely
                  projectTitle: project?.title || "Unknown Project", 
                  projectId: project?._id?.toString() || null, 
                };
              }) || [];
              
              // Style logic
              let rowClass = "hover:bg-slate-50";
              if (isRequesting) rowClass = "bg-amber-50/60 hover:bg-amber-100/50";
              else if (hasReports) rowClass = "bg-red-50/30 hover:bg-red-50/60";

              return (
                <tr key={user._id.toString()} className={`transition-colors ${rowClass}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 flex items-center gap-2 flex-wrap">
                      {user.name || "No Name Set"}
                      
                      {isRequesting && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] h-5 px-1.5 gap-1">
                           <AlertCircle className="h-3 w-3" /> Requesting Lead
                        </Badge>
                      )}

                      {hasReports && (
                        <ViewReportsDialog 
                          reports={sanitizedReports} 
                          userName={user.name || 'User'} 
                        />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                     <div className="flex items-center gap-2">
                      {user.role === 'admin' ? <Shield className="h-3 w-3 text-purple-600" /> : <UserIcon className="h-3 w-3 text-slate-400" />}
                      <span className="capitalize">{user.role}</span>
                     </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === 'banned' ? 'destructive' : 'outline'} className="capitalize">
                      {user.status || 'active'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserActions 
                      userId={user._id.toString()} 
                      currentRole={user.role} 
                      currentStatus={user.status || 'active'}
                      isCurrentUser={user._id.toString() === currentUser.dbId}
                      hasRequestedLeadAccess={isRequesting}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}