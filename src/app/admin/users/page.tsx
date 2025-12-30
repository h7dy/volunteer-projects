import { checkRole } from '@/lib/auth';
import { getUsers } from '@/app/actions/admin';
import Link from 'next/link';
import { ArrowLeft, Mail, Shield, User as UserIcon, AlertCircle, Calendar, CheckCircle, Ban } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { UserActions } from './userActions';
import { ViewReportsDialog } from "./viewReportsDialog";

export default async function UserManagementPage() {
  const currentUser = await checkRole(['admin']);
  
  let users = await getUsers();

  // Sorting Logic: Lead Requests -> Reported Users -> Newest Users
  users = users.sort((a: any, b: any) => {
    // A. Check Lead Requests
    const aReq = a.hasRequestedLeadAccess && a.role === 'volunteer';
    const bReq = b.hasRequestedLeadAccess && b.role === 'volunteer';
    if (aReq && !bReq) return -1;
    if (!aReq && bReq) return 1;

    // B. Check Reports
    const aReports = a.reports?.length || 0;
    const bReports = b.reports?.length || 0;
    if (aReports > 0 && bReports === 0) return -1;
    if (aReports === 0 && bReports > 0) return 1;

    // C. Default to Date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    // RESPONSIVE: Padding adjustments
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 mb-4 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                <p className="text-slate-500 mt-1">Manage roles, permissions, and system access.</p>
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-full text-sm font-medium text-slate-700 whitespace-nowrap self-start md:self-auto">
                Total Users: {users.length}
            </div>
        </div>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">User</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Joined</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
              {users.map((user: any) => {
                const { isRequesting, hasReports, sanitizedReports, rowClass } = processUserData(user);

                return (
                  <tr key={user._id.toString()} className={`transition-colors ${rowClass}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 flex items-center gap-2 flex-wrap">
                        {user.name || "No Name Set"}
                        
                        {isRequesting && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] h-5 px-2 gap-1 shadow-sm">
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
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Mail className="h-3 w-3" /> {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                        {user.role === 'admin' ? <Shield className="h-4 w-4 text-purple-600" /> : <UserIcon className="h-4 w-4 text-slate-400" />}
                        <span className="capitalize text-slate-700">{user.role}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <UserActions 
                        userId={user._id.toString()} 
                        currentRole={user.role} 
                        currentStatus={user.status || 'active'}
                        isCurrentUser={user._id.toString() === currentUser.dbId}
                        hasRequestedLeadAccess={isRequesting}
                        reportCount={user.reports?.length || 0}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="md:hidden space-y-4">
        {users.map((user: any) => {
            const { isRequesting, hasReports, sanitizedReports, rowClass } = processUserData(user);

            return (
                <div key={user._id.toString()} className={`p-4 rounded-lg border border-slate-200 shadow-sm ${rowClass}`}>
                    {/* Header: Name + Actions */}
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="font-semibold text-slate-900 flex flex-wrap gap-2 items-center">
                                {user.name || "No Name"}
                                {hasReports && (
                                    <ViewReportsDialog 
                                        reports={sanitizedReports} 
                                        userName={user.name || 'User'} 
                                    />
                                )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" /> {user.email}
                            </div>
                        </div>
                        <UserActions 
                            userId={user._id.toString()} 
                            currentRole={user.role} 
                            currentStatus={user.status || 'active'}
                            isCurrentUser={user._id.toString() === currentUser.dbId}
                            hasRequestedLeadAccess={isRequesting}
                            reportCount={user.reports?.length || 0}
                        />
                    </div>

                    {/* Lead Request Banner */}
                    {isRequesting && (
                        <div className="mb-3 bg-amber-100/50 border border-amber-200 rounded p-2 flex items-center gap-2 text-xs text-amber-800">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="font-medium">Requesting Project Lead Access</span>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm border-t border-slate-200/60 pt-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Role</span>
                            <div className="flex items-center gap-1.5">
                                {user.role === 'admin' ? <Shield className="h-3.5 w-3.5 text-purple-600" /> : <UserIcon className="h-3.5 w-3.5 text-slate-400" />}
                                <span className="capitalize">{user.role}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                             <span className="text-xs text-slate-400">Status</span>
                             <StatusBadge status={user.status} />
                        </div>
                        <div className="flex flex-col gap-1 col-span-2 mt-1">
                             <span className="text-xs text-slate-400">Joined</span>
                             <div className="flex items-center gap-1.5 text-slate-600">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(user.createdAt).toLocaleDateString()}
                             </div>
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}

// --- Helper Functions & Components ---

function processUserData(user: any) {
    const isRequesting = user.hasRequestedLeadAccess && user.role === 'volunteer';
    const hasReports = user.reports && user.reports.length > 0;
    
    // Sanitize reports for Client Component
    const sanitizedReports = user.reports?.map((report: any) => ({
        _id: report._id.toString(),
        reason: report.reason,
        date: new Date(report.date).toISOString(),
        reporterId: report.reporterId?.toString() || "Unknown",
        projectTitle: report.projectId?.title || "Unknown Project", 
        projectId: report.projectId?._id?.toString() || null, 
    })) || [];

    // Row Styling logic
    let rowClass = "hover:bg-slate-50 bg-white";
    if (isRequesting) rowClass = "bg-amber-50/70 hover:bg-amber-100/60 border-amber-200";
    else if (hasReports) rowClass = "bg-red-50/40 hover:bg-red-50/70 border-red-100";

    return { isRequesting, hasReports, sanitizedReports, rowClass };
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'banned') {
        return (
            <Badge variant="destructive" className="h-5 px-2 text-[10px] gap-1">
                <Ban className="h-3 w-3" /> Banned
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="h-5 px-2 text-[10px] gap-1 text-emerald-700 border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-3 w-3" /> Active
        </Badge>
    );
}