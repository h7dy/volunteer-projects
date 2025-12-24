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

  const totalProjects = await Project.countDocuments();
  const totalLeads = await User.countDocuments({ role: "lead"});
  const totalVolunteers = await User.countDocuments({ role: "volunteer"});

  return { totalProjects, totalLeads, totalVolunteers };
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