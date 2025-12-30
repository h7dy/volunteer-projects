import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";

export default function BannedPage() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-red-50/50 px-4 py-12">
      
      <Card className="w-full max-w-md border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          {/* Icon with a double ring effect for emphasis */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
            <Ban className="h-8 w-8 text-red-600" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-slate-900">
            Account Suspended
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4 pt-2">
          <p className="text-slate-600 leading-relaxed">
            Your access to this platform has been revoked by an administrator due to a violation of our community guidelines or terms of service.
          </p>
          
          <div className="bg-red-50 border border-red-100 rounded-md p-3 text-sm text-red-800 font-medium">
            Error Code: ACC_SUSPENDED
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <p className="text-xs text-center text-slate-400 mt-4">
            If you believe this is a mistake, please appeal via email.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}