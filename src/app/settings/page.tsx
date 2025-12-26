import { checkRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profileForm";
import { requestPromotion } from "@/app/actions/requests";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  // Allow all logged-in users
  const session = await checkRole(['admin', 'lead', 'volunteer']);
  
  await dbConnect();
  const user = await User.findById(session.dbId).lean();
  const hasRequested = user?.hasRequestedLeadAccess;
  const showPromotionCard = user?.role !== 'admin';

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
      {showPromotionCard && 
      (<Card className="mt-8 border-emerald-100">
        <CardHeader>
          <CardTitle>Become a Project Lead</CardTitle>
          <CardDescription>
            Want to organize your own events? Request an upgrade to Lead status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* STATE 1: ALREADY A LEAD */}
          {user?.role === 'lead' ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100 flex items-center gap-2">
               <span className="font-medium">You are a Project Lead.</span>
            </div>
          
          /* STATE 2: REJECTED (The fix you wanted) */
          ) : user?.isLeadAccessRejected ? (
            <div className="p-4 bg-red-50 text-red-900 rounded-md border border-red-100 flex items-start gap-3">
               <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
               <div>
                 <p className="font-medium">Application Declined</p>
                 <p className="text-sm text-red-700 mt-1">
                   Your request to become a Lead was reviewed and declined by an administrator. 
                   You cannot submit a new request at this time.
                 </p>
               </div>
            </div>

          /* STATE 3: PENDING */
          ) : user?.hasRequestedLeadAccess ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                Request Pending Review
              </Badge>
            </div>

          /* STATE 4: NEW (Show Button) */
          ) : (
            <form action={async () => {
                "use server";
                await requestPromotion();
              }}>
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Request Promotion
              </Button>
            </form>
          )}

        </CardContent>
      </Card>
      )}
    </div>
  );
}