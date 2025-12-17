import { checkRole } from '@/lib/auth';

export default async function LeadDashboard() {
  const user = await checkRole(['lead', 'admin']);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Hello Team Lead 🚀</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}