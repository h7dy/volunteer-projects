// actions/requests.ts
'use server'

import { checkRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

// Volunteer Requests Promotion
export async function requestPromotion() {
  const user = await checkRole(['volunteer']);
  await dbConnect();
  
  const currentUser = await User.findById(user.dbId);

  // Prevent banned users from asking again
  if (currentUser?.isLeadAccessRejected) {
    return { error: "Your previous request was declined. Contact support to apply again." };
  }

  await User.findByIdAndUpdate(user.dbId, { hasRequestedLeadAccess: true });
  revalidatePath('/settings');
  return { success: "Request sent." };
}

// Lead Reports a Volunteer
export async function reportVolunteer(volunteerId: string, reason: string) {
  const lead = await checkRole(['lead', 'admin']);
  await dbConnect();

  if (!reason || reason.length < 5) {
    return { error: "Please provide a valid reason." };
  }

  // Push a report object into the volunteer's record
  await User.findByIdAndUpdate(volunteerId, {
    $push: { 
      reports: {
        reporterId: lead.dbId,
        reason: reason,
        date: new Date()
      }
    }
  });

  revalidatePath('/lead/projects'); 
  return { success: "User has been reported to admins." };
}