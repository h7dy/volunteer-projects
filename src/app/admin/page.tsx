import { checkRole } from '@/lib/auth';

export default async function AdminDashboard() {
  // Only allow leads/admins (need to decide later)
  const user = await checkRole(['admin']);

  return (
    <div className="max-w-5xl mx-auto p-8 border-l-4 border-red-500 bg-red-50">
      <h1 className="text-3xl font-bold text-red-900">Admin Control Center</h1>
      <p>Welcome, Admin {user.name}</p>
      
      <div className="mt-6">
        <a href="/projects/new" className="underline text-red-700">
           + Create New Project
        </a> 
      </div>
    </div>
  );
}