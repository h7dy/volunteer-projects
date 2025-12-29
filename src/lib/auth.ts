import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function getAuthUser() {
  const session = await auth0.getSession();
  const auth0User = session?.user;

  if (!auth0User || !auth0User.email) {
    return null;
  }

  await dbConnect();

  // Try to find the user by their unique Auth0 ID (standard path)
  let dbUser = await User.findOne({ auth0Id: auth0User.sub });

  // Legacy Account Linking (migration path)
  // If not found by ID, check if they exist by Email
  if (!dbUser) {
    dbUser = await User.findOne({ email: auth0User.email });

    if (dbUser) {
      // Only link if Auth0 has verified the email.
      if (auth0User.email_verified) {
        dbUser.auth0Id = auth0User.sub;
        await dbUser.save();
      } else {
        throw new Error("Please verify your email address with your provider before logging in.");
      }
    }
  }

  // User Creation (alternate path)
  // If they don't exist by ID or Email, they are a brand new user.
  if (!dbUser) {
    dbUser = await User.create({
      email: auth0User.email,
      auth0Id: auth0User.sub,
      role: 'volunteer', // Default role
      status: 'active'
    });
  }

  // Return the "Hybrid" User Object
  // Contains Auth0 profile data AND MongoDB _id/role
  return {
    ...auth0User,
    dbId: dbUser._id.toString(),
    role: dbUser.role,
    status: dbUser.status,
    mongoUser: dbUser.toObject ? dbUser.toObject() : dbUser
  };
}

/**
 * Page Guard
*/
export async function checkRole(allowedRoles: string[]) {
  const user = await getAuthUser();

  // If not logged in, send to login
  if (!user) {
    redirect('/auth/login');
  }

  if (user.status === 'banned') {
    redirect('/banned');
  }

  // If logged in but wrong role, send to unauthorized
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }

  // Return the user for use in the page
  return user;
}