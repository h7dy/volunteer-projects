// actions/requests.ts
'use server'

import { checkRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import Participation from "@/models/Participation";
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
export async function reportVolunteer(volunteerId: string, reason: string, projectId: string) {
  const lead = await checkRole(['lead', 'admin']);
  await dbConnect();

  if (!reason || reason.length < 5) return { error: "Reason too short." };

  // Verify Lead owns the project
  const project = await Project.findOne({ _id: projectId, leadId: lead.dbId });
  if (!project && lead.role !== 'admin') {
    return { error: "You can only report volunteers from your own projects." };
  }

  // Verify Volunteer is enrolled
  const enrollment = await Participation.findOne({ projectId: projectId, userId: volunteerId });
  if (!enrollment) {
    return { error: "This volunteer is not associated with this project." };
  }

  // DUPLICATE CHECK
  const targetUser = await User.findById(volunteerId);
  
  const alreadyReported = targetUser?.reports.some((report: any) => {
    const rPid = report.projectId.toString();
    const rRid = report.reporterId.toString();
    
    // Compare as strings
    return rPid === projectId.toString() && rRid === lead.dbId;
  });

  if (alreadyReported) {
    return { error: "You have already reported this volunteer for this project." };
  }

  await User.findByIdAndUpdate(volunteerId, {
    $push: { 
      reports: {
        reporterId: lead.dbId,
        projectId: projectId,
        reason: reason,
        date: new Date()
      }
    }
  });

  revalidatePath('/admin/users');
  return { success: "User has been flagged." };
}