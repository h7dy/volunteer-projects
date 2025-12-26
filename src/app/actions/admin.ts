'use server'

import { checkRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { Project } from "@/models/Project";
import { revalidatePath } from "next/cache";

// Get Global Stats for Dashboard
export async function getAdminStats() {
  await checkRole(['admin']);
  await dbConnect();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalProjects,
    totalLeads,
    totalVolunteers,
    totalFlagged,
    totalLeadRequests,
    totalRecent
  ] = await Promise.all([
    Project.countDocuments(),
    User.countDocuments({ role: "lead" }),
    User.countDocuments({ role: "volunteer" }),
    User.countDocuments({ "reports.0": { "$exists": true } }),
    User.countDocuments({ hasRequestedLeadAccess: true, role: 'volunteer' }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
  ]);

  return { 
    totalProjects, 
    totalLeads, 
    totalVolunteers, 
    totalFlagged, 
    totalLeadRequests, 
    totalRecent 
  };
}

// Get All Users
export async function getUsers() {
  await checkRole(['admin']);
  await dbConnect();

  // Find query to populate the project details inside reports
  const users = await User.find({})
    .populate({
      path: 'reports.projectId', 
      model: 'Project',
      select: 'title _id'
    })
    .sort({ createdAt: -1 })
    .lean();

  return users;
}

// Update User Role
export async function updateUserRole(userId: string, newRole: string) {
  const admin = await checkRole(['admin']);
  await dbConnect();

  if (userId === admin.dbId) {
    return { error: "You cannot change your own role." };
  }

  await User.findByIdAndUpdate(userId, { role: newRole });
  revalidatePath('/admin/users');
  return { success: "Role updated" };
}

// Reject lead access
export async function rejectLeadAccess(userId: string) {
  await checkRole(['admin']);
  await dbConnect();

  await User.findByIdAndUpdate(userId, { 
    hasRequestedLeadAccess: false, // Clear the active request
    isLeadAccessRejected: true     // Mark as permanently rejected
  });
  
  revalidatePath('/admin/users');
  return { success: "Request rejected." };
}

// Ban/Unban User
export async function toggleUserBan(userId: string, currentStatus: string) {
  const admin = await checkRole(['admin']);
  await dbConnect();

  if (userId === admin.dbId) {
    return { error: "You cannot ban yourself." };
  }

  const newStatus = currentStatus === 'active' ? 'banned' : 'active';
  
  await User.findByIdAndUpdate(userId, { status: newStatus });
  revalidatePath('/admin/users');
  return { success: `User ${newStatus}` };
}

// Clear user's reports
export async function clearUserReports(userId: string) {
  await checkRole(['admin']);
  await dbConnect();

  try {
    await User.findByIdAndUpdate(userId, {
      $set: { reports: [] }
    });

    revalidatePath('/admin/users');
    
    return { success: true, message: "Reports cleared successfully" };
  } catch (error) {
    console.error("Failed to clear reports:", error);
    return { success: false, message: "Failed to clear reports" };
  }
}