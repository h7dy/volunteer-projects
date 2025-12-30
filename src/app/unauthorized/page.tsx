import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 px-6">
      
      <div className="text-center space-y-6 max-w-md w-full animate-in fade-in zoom-in duration-300 slide-in-from-bottom-4">
        
        {/* Icon Circle */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 p-6 ring-1 ring-red-100 shadow-sm">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Access Denied
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            You don't have permission to access this area.
          </p>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            If you believe this is a mistake, please contact your team lead or administrator.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button 
            asChild
            className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto px-8 h-12 text-base shadow-md shadow-slate-200"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}