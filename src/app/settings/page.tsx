// app/settings/page.tsx
import { checkRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profileForm";

export default async function SettingsPage() {
  // Allow all logged-in users
  const session = await checkRole(['admin', 'lead', 'volunteer']);
  
  await dbConnect();
  const user = await User.findById(session.dbId).lean();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Account Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your public profile details. This name will be visible to other users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm 
            initialName={user?.name || ""} 
            email={user?.email || ""} 
          />
        </CardContent>
      </Card>
    </div>
  );
}