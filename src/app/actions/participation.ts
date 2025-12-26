'use server';

import { checkRole } from '@/lib/auth';
import { Participation } from '@/models/Participation';
import { Project } from '@/models/Project';
import dbConnect from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function joinProject(projectId: string) {
  try {
    await dbConnect();
    
    const user = await checkRole(['volunteer', 'lead', 'admin']);

    const project = await Project.findById(projectId);
    
    if (!project) {
      return { success: false, message: 'Project not found.' };
    }

    if (project.status !== 'active') {
      return { success: false, message: 'This project is not currently accepting volunteers.' };
    }

    const currentCount = project.enrolledCount || 0;

    if (project.capacity && currentCount >= project.capacity) {
      return { success: false, message: 'This project is currently at max capacity.'}
    }

    await Participation.create({
      userId: user.dbId,
      projectId: projectId
    });

    await Project.findByIdAndUpdate(projectId, { 
      $inc: { enrolledCount: 1 } 
    });

    // Refresh UI (Project Page + Dashboard)
    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/volunteer');
    
    return { success: true };

  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, message: 'You have already joined this project.' };
    }
    console.error("Join Error:", error);
    return { success: false, message: 'Failed to join project. Please try again.' };
  }
}

export async function leaveProject(projectId: string) {
  try {
    await dbConnect();
    
    const user = await checkRole(['volunteer', 'lead', 'admin']);

    const result = await Participation.findOneAndDelete({
      userId: user.dbId,
      projectId: projectId
    });

    if (result) {
      await Project.findOneAndUpdate(
        { _id: projectId, enrolledCount: { $gt: 0 } },
        { $inc: { enrolledCount: -1 } } 
      );
    }

    if (!result) {
      return { success: true, message: 'You were not enrolled in this project.' };
    }

    // Refresh UI
    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/volunteer');

    return { success: true, message: 'Successfully left the project.' };

  } catch (error) {
    console.error("Leave Error:", error);
    return { success: false, message: 'Failed to leave project.' };
  }
}