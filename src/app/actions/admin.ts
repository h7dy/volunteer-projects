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
  
  // Sort by newest first
  return await User.find({}).sort({ createdAt: -1 }).lean();
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