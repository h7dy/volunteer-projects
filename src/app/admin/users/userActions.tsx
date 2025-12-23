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
import { MoreHorizontal, ShieldAlert, UserCog, Ban, CheckCircle, XCircle } from "lucide-react";
import { updateUserRole, toggleUserBan, rejectLeadAccess } from "@/app/actions/admin";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  currentStatus: string;
  isCurrentUser: boolean;
  hasRequestedLeadAccess?: boolean; 
}

export function UserActions({ 
  userId, 
  currentRole, 
  currentStatus, 
  isCurrentUser,
  hasRequestedLeadAccess = false
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
        
        {hasRequestedLeadAccess && currentRole === 'volunteer' && (
          <>
            <DropdownMenuItem onClick={() => handleRoleChange('lead')} className="bg-emerald-50 text-emerald-700 focus:bg-emerald-100 cursor-pointer mb-1">
                <CheckCircle className="mr-2 h-4 w-4" /> Approve Lead Access
            </DropdownMenuItem>
            
            {/* NEW: REJECT BUTTON */}
            <DropdownMenuItem onClick={handleReject} className="bg-red-50 text-red-700 focus:bg-red-100 cursor-pointer">
                <XCircle className="mr-2 h-4 w-4" /> Reject Request
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuSeparator />
        
        {/* Role Management */}
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
        
        {/* Ban Management */}
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