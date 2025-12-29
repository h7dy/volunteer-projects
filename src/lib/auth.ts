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

  // Try to find by unique Auth0 ID
  let dbUser = await User.findOne({ auth0Id: auth0User.sub });

  // Migration Path: Check by Email if ID not found
  if (!dbUser) {
    dbUser = await User.findOne({ email: auth0User.email });

    if (dbUser) {
      if (auth0User.email_verified) {
        dbUser.auth0Id = auth0User.sub;
        await dbUser.save();
      } else {
        throw new Error("Please verify your email address before logging in.");
      }
    }
  }

  // Creation Path (with Race Condition Protection)
  if (!dbUser) {
    try {
      dbUser = await User.create({
        email: auth0User.email,
        auth0Id: auth0User.sub,
        role: 'volunteer',
        status: 'active'
      });
    } catch (error: any) {
      // HANDLE RACE CONDITION
      // If MongoDB says "Duplicate Email" (code 11000), it means another request 
      // created the user 5 milliseconds ago. We just fetch that user.
      if (error.code === 11000) {
        dbUser = await User.findOne({ email: auth0User.email });
      } else {
        // If it's a different error, crash as normal
        throw error;
      }
    }
  }

  if (!dbUser) {
    throw new Error("Failed to create or retrieve user account.");
  }
  
  // Return the "Hybrid" User Object
  return {
    ...auth0User,
    dbId: dbUser._id.toString(),
    role: dbUser.role,
    status: dbUser.status,
    mongoUser: dbUser.toObject ? dbUser.toObject() : dbUser
  };
}

export async function checkRole(allowedRoles: string[]) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.status === 'banned') {
    redirect('/banned');
  }

  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }

  return user;
}