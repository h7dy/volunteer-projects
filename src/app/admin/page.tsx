import { checkRole } from '@/lib/auth';

export default async function AdminDashboard() {
  const user = await checkRole(['admin']);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Hello Admin 🛡️</h1>
      <p>Welcome, {user.email}</p>
      <div className="mt-4 p-4 bg-green-100 rounded">
        Because you can see this, you are definitely an Admin in MongoDB.
      </div>
    </div>
  );
}