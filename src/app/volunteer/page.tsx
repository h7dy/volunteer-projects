import { checkRole } from '@/lib/auth';

export default async function VolunteerDashboard() {
  const user = await checkRole(['volunteer', 'lead', 'admin']);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Hello Volunteer 🤝</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}