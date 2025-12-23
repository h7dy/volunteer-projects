import { checkRole } from '@/lib/auth';
import { getUsers } from '@/app/actions/admin';
import Link from 'next/link';
import { ArrowLeft, Mail, Shield, User as UserIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { UserActions } from './userActions';

export default async function UserManagementPage() {
  const currentUser = await checkRole(['admin']);
  const users = await getUsers();

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
            {users.map((user: any) => (
              <tr key={user._id.toString()} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{user.name || "No Name Set"}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
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
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}