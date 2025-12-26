'use client'

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldAlert, UserCog, Ban, CheckCircle, XCircle, Eraser } from "lucide-react";
import { updateUserRole, toggleUserBan, rejectLeadAccess, clearUserReports } from "@/app/actions/admin";

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
  
  if (isCurrentUser) {
    return <span className="text-xs text-muted-foreground italic">Current User</span>;
  }

  const handleRoleChange = async (newRole: string) => {
    const result = await updateUserRole(userId, newRole);
    if (result.success) alert("Role updated");
    else alert("Failed to update role");
  };

  const handleBanToggle = async () => {
    const confirmMsg = currentStatus === 'active' 
      ? "Are you sure you want to BAN this user?" 
      : "Activate this user?";
      
    if (!confirm(confirmMsg)) return;

    const result = await toggleUserBan(userId, currentStatus);
    if (result.success) alert("User status updated");
    else alert("Failed to update status");
  };

  const handleReject = async () => {
    if(!confirm("Are you sure you want to permanently decline this request?")) return;
    const result = await rejectLeadAccess(userId);
    if (result.success) alert("Request rejected");
  };

  // Handle Clear Reports
  const handleClearReports = async () => {
    if(!confirm("Are you sure you want to dismiss all reports for this user? This cannot be undone.")) return;
    const result = await clearUserReports(userId);
    if (result.success) alert("Reports dismissed");
    else alert("Failed to dismiss reports");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {/* LEAD REQUEST ACTIONS */}
        {hasRequestedLeadAccess && currentRole === 'volunteer' && (
          <>
            <DropdownMenuItem onClick={() => handleRoleChange('lead')} className="bg-emerald-50 text-emerald-700 focus:bg-emerald-100 cursor-pointer mb-1">
                <CheckCircle className="mr-2 h-4 w-4" /> Approve Lead Access
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReject} className="bg-red-50 text-red-700 focus:bg-red-100 cursor-pointer">
                <XCircle className="mr-2 h-4 w-4" /> Reject Request
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* DISMISS REPORTS ACTION */}
        {reportCount > 0 && (
           <>
            <DropdownMenuItem onClick={handleClearReports} className="text-orange-600 focus:text-orange-700">
                <Eraser className="mr-2 h-4 w-4" /> Dismiss Reports ({reportCount})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
           </>
        )}

        {/* ROLE MANAGEMENT */}
        <DropdownMenuItem onClick={() => handleRoleChange('volunteer')}>
          <UserCog className="mr-2 h-4 w-4" /> Make Volunteer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange('lead')}>
          <ShieldAlert className="mr-2 h-4 w-4" /> Make Project Lead
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
          <ShieldAlert className="mr-2 h-4 w-4 text-purple-600" /> Make Admin
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {/* BAN MANAGEMENT */}
        <DropdownMenuItem 
          onClick={handleBanToggle}
          className={currentStatus === 'active' ? 'text-red-600 focus:text-red-600' : 'text-emerald-600 focus:text-emerald-600'}
        >
          <Ban className="mr-2 h-4 w-4" /> 
          {currentStatus === 'active' ? 'Ban User' : 'Unban User'}
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}