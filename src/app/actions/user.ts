'use server'

import { checkRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  // Verify Authentication
  const user = await checkRole(['admin', 'lead', 'volunteer']);

  const name = formData.get('name') as string;

  if (!name || name.trim().length < 2) {
    return { error: "Name must be at least 2 characters long." };
  }

  try {
    await dbConnect();

    // Update the User
    await User.findByIdAndUpdate(user.dbId, {
      name: name.trim()
    });

    // Revalidate paths so the new name shows up immediately
    revalidatePath('/settings');
    
    return { success: "Profile updated successfully." };
  } catch (error) {
    return { error: "Failed to update profile." };
  }
}