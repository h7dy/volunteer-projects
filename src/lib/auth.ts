import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function checkRole(allowedRoles: string[]) {
  await dbConnect();

  const session = await auth0.getSession();
  const auth0User = session?.user;

  if (!auth0User) {
    redirect('/auth/login');
  }

  // Need to change to auth0 id here
  const dbUser = await User.findOne({ email: auth0User.email });

  if (!dbUser || !allowedRoles.includes(dbUser.role)) {
    redirect('/unauthorized');
  }

  return dbUser;
}