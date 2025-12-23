// app/banned/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban } from "lucide-react";

export default function BannedPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-red-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Ban className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-700">Account Suspended</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-slate-600">
          <p>
            Your account has been suspended by an administrator due to a violation of our community guidelines.
          </p>
          <p className="mt-4 text-sm">
            If you believe this is a mistake, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}