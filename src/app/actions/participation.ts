// src/app/actions/participation.ts
'use server';

import { checkRole } from '@/lib/auth';
import { Participation } from '@/models/Participation';
import { revalidatePath } from 'next/cache';

export async function joinProject(projectId: string) {
  try {
    // Authenticate & Sync
    const user = await checkRole(['volunteer', 'lead', 'admin']);

    // Create Participation Record
    await Participation.create({
      userId: user.dbId,
      projectId: projectId,
      role: 'volunteer'
    });

    // Refresh UI
    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return { success: true };

  } catch (error: any) {
    // Handle case where already joined
    if (error.code === 11000) {
      return { success: false, message: 'You have already joined this project.' };
    }
    return { success: false, message: 'Failed to join project. Please try again.' };
  }
}

export async function leaveProject(projectId: string) {
  try {
    const user = await checkRole(['volunteer', 'lead', 'admin']);

    const result = await Participation.findOneAndDelete({
      userId: user.dbId,
      projectId: projectId
    });

    if (!result) {
      return { success: true, message: 'You were not enrolled in this project.' };
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: 'Successfully left the project.' };

  } catch (error) {
    console.error("Leave Error:", error);
    return { success: false, message: 'Failed to leave project.' };
  }
}