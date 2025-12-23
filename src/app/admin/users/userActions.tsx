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
import { MoreHorizontal, ShieldAlert, UserCog, Ban } from "lucide-react";
import { updateUserRole, toggleUserBan } from "@/app/actions/admin";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  currentStatus: string;
  isCurrentUser: boolean;
}

export function UserActions({ userId, currentRole, currentStatus, isCurrentUser }: UserActionsProps) {
  
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