'use server';

import { checkRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Project } from '@/models/Project';
import { revalidatePath } from 'next/cache';
import User from "@/models/User";

// --- READ ALL (ADMIN) ---
export async function getAllProjectsForAdmin() {
  await checkRole(['admin']);
  await dbConnect();

  const projects = await Project.find({})
    .populate({ path: 'leadId', model: User, select: 'name email' })
    .sort({ createdAt: -1 })
    .lean();
    
  return projects.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    leadId: p.leadId ? { ...p.leadId, _id: p.leadId._id.toString() } : null,
    leadName: p.leadId?.name || "Unknown Lead" 
  }));
}

// --- CREATE ---
export async function createProject(formData: FormData) {
  await dbConnect();
  
  const user = await checkRole(['lead', 'admin']);

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const location = formData.get('location') as string;
  const status = formData.get('status') as string;

  // DATE HANDLING: Handle empty string case safely
  const dateStr = formData.get('startDate') as string;
  const startDate = dateStr ? new Date(dateStr) : undefined;

  // CAPACITY HANDLING: Convert string to number, or null if empty
  const rawCapacity = formData.get('capacity') as string;
  // If empty string or '0', save as null (unlimited). Otherwise parse integer.
  const capacity = (rawCapacity && parseInt(rawCapacity) > 0) 
    ? parseInt(rawCapacity) 
    : null;

  await Project.create({
    title,
    description,
    location,
    capacity: capacity as any,
    status: status || 'draft',
    startDate,
    leadId: user.dbId,
    enrolledCount: 0
  });

  revalidatePath('/lead');
  revalidatePath('/projects');
}

// --- UPDATE ---
export async function updateProject(projectId: string, formData: FormData) {
  await dbConnect();
  const user = await checkRole(['lead', 'admin']);

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  // Ownership Check
  if (user.role !== 'admin' && project.leadId.toString() !== user.dbId) {
    throw new Error("Unauthorized: You do not own this project.");
  }

  const newStatus = formData.get('status') as string;

  // Prevent reverting from Active/Completed -> Draft
  // If the project was NOT draft before, but the user is trying to set it TO draft
  if (project.status !== 'draft' && newStatus === 'draft') {
    throw new Error("Cannot revert an active or completed project to draft.");
  }

  // DATE HANDLING
  const dateStr = formData.get('startDate') as string;
  const startDate = dateStr ? new Date(dateStr) : undefined;

  // CAPACITY HANDLING
  const rawCapacity = formData.get('capacity');
    
  // Treat empty string or "0" as null (Unlimited)
  const newCapacity = (rawCapacity === '' || rawCapacity === null || rawCapacity === '0') 
    ? null 
    : parseInt(rawCapacity.toString(), 10);

  // Prevent lowering capacity below current enrollments
  if (newCapacity !== null) {
    const currentEnrollment = project.enrolledCount || 0;
        
    if (newCapacity < currentEnrollment) {
      throw new Error(`Cannot set capacity to ${newCapacity}. There are already ${currentEnrollment} volunteers enrolled.`);
    }
  }
  
  await Project.findByIdAndUpdate(projectId, {
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    capacity: newCapacity as any,
    status: newStatus,
    startDate,
  });

  revalidatePath('/lead');
  revalidatePath('/projects');
  revalidatePath('admin/projects');
  revalidatePath(`/lead/projects/${projectId}`);
}

// --- DELETE ---
export async function deleteProject(projectId: string) {
  await dbConnect();
  const user = await checkRole(['lead', 'admin']);

  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  // Ownership Check
  if (user.role !== 'admin' && project.leadId.toString() !== user.dbId) {
    throw new Error("Unauthorized.");
  }

  await Project.findByIdAndDelete(projectId);
  
  revalidatePath('/lead');
  revalidatePath('/projects');
  revalidatePath('/admin/projects')
  return { success: true };
}