import { checkRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { XCircle, CheckCircle2, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profileForm";
import { requestPromotion } from "@/app/actions/requests";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  // Allow all logged-in users
  const session = await checkRole(['admin', 'lead', 'volunteer']);
  
  await dbConnect();
  const user = await User.findById(session.dbId).lean();
  
  // Logic helpers
  const showPromotionCard = user?.role !== 'admin';
  const isLead = user?.role === 'lead';
  const isRejected = user?.isLeadAccessRejected;
  const isPending = user?.hasRequestedLeadAccess;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-12 space-y-8">
      
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          Manage your profile and account permissions.
        </p>
      </div>
      
      {/* 1. PERSONAL INFO CARD */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>
            Update your public profile details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm 
            initialName={user?.name || ""} 
            email={user?.email || ""} 
          />
        </CardContent>
      </Card>

      {/* 2. PROMOTION CARD */}
      {showPromotionCard && (
        <Card className={`shadow-sm border-l-4 ${
          isLead ? 'border-l-emerald-500' : 
          isRejected ? 'border-l-red-500' : 
          isPending ? 'border-l-yellow-500' : 
          'border-l-slate-300'
        }`}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-500" />
              <CardTitle className="text-lg">Lead Access</CardTitle>
            </div>
            <CardDescription>
              Want to organize your own events? Request an upgrade to Lead status.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* STATE 1: ALREADY A LEAD */}
            {isLead ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">You are a Project Lead</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    You have full access to create and manage projects.
                  </p>
                </div>
              </div>
            
            /* STATE 2: REJECTED */
            ) : isRejected ? (
              <div className="p-4 bg-red-50 text-red-900 rounded-lg border border-red-100 flex items-start gap-3">
                 <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                 <div>
                   <p className="font-semibold text-sm">Application Declined</p>
                   <p className="text-xs text-red-700 mt-1 leading-relaxed">
                     Your request was reviewed and declined by an administrator. 
                     You cannot submit a new request at this time.
                   </p>
                 </div>
              </div>

            /* STATE 3: PENDING */
            ) : isPending ? (
              <div className="p-4 bg-yellow-50 text-yellow-900 rounded-lg border border-yellow-100 flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Request Under Review</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    An administrator is reviewing your request. This usually takes 24-48 hours.
                  </p>
                </div>
              </div>

            /* STATE 4: NEW (Show Button) */
            ) : (
              <form action={async () => {
                  "use server";
                  await requestPromotion();
                }}>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
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