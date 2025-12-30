'use client'

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  MoreHorizontal, 
  ShieldAlert, 
  UserCog, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Eraser, 
  Loader2,
  User
} from "lucide-react";
import { updateUserRole, toggleUserBan, rejectLeadAccess, clearUserReports } from "@/app/actions/admin";
import { toast } from "sonner";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  currentStatus: string;
  isCurrentUser: boolean;
  hasRequestedLeadAccess?: boolean; 
  reportCount?: number;
}

export function UserActions({ 
  userId, 
  currentRole, 
  currentStatus, 
  isCurrentUser,
  hasRequestedLeadAccess = false,
  reportCount = 0
}: UserActionsProps) {
  
  const [isPending, startTransition] = useTransition();
  const [alertOpen, setAlertOpen] = useState(false);
  
  // We use a local state to determine WHICH action the Alert Dialog performs
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    description: string;
    action: () => Promise<any>;
    variant?: "default" | "destructive";
    confirmText?: string;
  } | null>(null);

  if (isCurrentUser) {
    return <span className="text-xs text-slate-400 italic px-2">You</span>;
  }

  // --- Handlers ---

  const executeAction = (actionFn: () => Promise<any>) => {
    startTransition(async () => {
      try {
        const result = await actionFn();
        if (result.success) {
          toast.success("Action completed successfully");
        } else {
          toast.error("Action failed");
        }
      } catch (e) {
        toast.error("An unexpected error occurred");
      } finally {
        setAlertOpen(false);
      }
    });
  };

  const confirmRoleChange = (newRole: string) => {
    // Direct action for non-destructive role changes
    executeAction(() => updateUserRole(userId, newRole));
  };

  const confirmBanToggle = () => {
    const isBanning = currentStatus === 'active';
    setDialogConfig({
      title: isBanning ? "Suspend User Account?" : "Reactivate User Account?",
      description: isBanning 
        ? "This user will lose access to all projects and dashboards immediately."
        : "This will restore the user's access to the platform.",
      variant: isBanning ? "destructive" : "default",
      confirmText: isBanning ? "Suspend Account" : "Reactivate",
      action: async () => toggleUserBan(userId, currentStatus)
    });
    setAlertOpen(true);
  };

  const confirmRejectRequest = () => {
    setDialogConfig({
      title: "Reject Lead Access?",
      description: "The user will remain a Volunteer. They can request access again later if needed.",
      variant: "destructive",
      confirmText: "Reject Request",
      action: async () => rejectLeadAccess(userId)
    });
    setAlertOpen(true);
  };

  const confirmClearReports = () => {
    setDialogConfig({
      title: "Dismiss All Reports?",
      description: "This will permanently remove all flags associated with this user. This action cannot be undone.",
      variant: "default", // Orange usually fits warning, but default is fine
      confirmText: "Dismiss Reports",
      action: async () => clearUserReports(userId)
    });
    setAlertOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 data-[state=open]:bg-slate-100">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
          
          {/* 1. PRIORITY: LEAD REQUESTS */}
          {hasRequestedLeadAccess && currentRole === 'volunteer' && (
            <div className="bg-slate-50/50 -mx-1 px-1 py-1 mb-1 border-b border-slate-100">
                <DropdownMenuLabel className="text-xs text-amber-600 font-normal py-1">
                    Pending Request
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => confirmRoleChange('lead')} className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer">
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve as Lead
                </DropdownMenuItem>
                <DropdownMenuItem onClick={confirmRejectRequest} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                    <XCircle className="mr-2 h-4 w-4" /> Reject Request
                </DropdownMenuItem>
            </div>
          )}

          {/* 2. PRIORITY: REPORTS */}
          {reportCount > 0 && (
            <>
              <DropdownMenuItem onClick={confirmClearReports} className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 cursor-pointer">
                  <Eraser className="mr-2 h-4 w-4" /> Dismiss Reports
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* 3. STANDARD: ROLE MANAGEMENT */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserCog className="mr-2 h-4 w-4" /> Change Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => confirmRoleChange('volunteer')} disabled={currentRole === 'volunteer'}>
                    <User className="mr-2 h-4 w-4" /> Volunteer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => confirmRoleChange('lead')} disabled={currentRole === 'lead'}>
                    <ShieldAlert className="mr-2 h-4 w-4" /> Project Lead
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => confirmRoleChange('admin')} disabled={currentRole === 'admin'}>
                    <ShieldAlert className="mr-2 h-4 w-4 text-purple-600" /> Admin
                </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          
          {/* 4. DANGER ZONE */}
          <DropdownMenuItem 
            onClick={confirmBanToggle}
            className={currentStatus === 'active' ? 'text-red-600 focus:text-red-700 focus:bg-red-50' : 'text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50'}
          >
            <Ban className="mr-2 h-4 w-4" /> 
            {currentStatus === 'active' ? 'Suspend Account' : 'Reactivate Account'}
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      {/* DYNAMIC CONFIRMATION DIALOG */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogConfig?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogConfig?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => {
                    e.preventDefault();
                    if(dialogConfig?.action) executeAction(dialogConfig.action);
                }}
                disabled={isPending}
                className={dialogConfig?.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialogConfig?.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}