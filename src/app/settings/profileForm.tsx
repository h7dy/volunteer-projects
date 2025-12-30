'use client'

import { updateProfile } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  initialName: string;
  email: string;
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      toast.error("Update failed", {
        description: result.error
      });
    } else {
      toast.success("Profile updated", {
        description: "Your changes have been saved successfully."
      });
    }
    
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. EMAIL (Read Only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          value={email} 
          disabled 
          className="bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed opacity-100" 
        />
        <p className="text-[0.8rem] text-muted-foreground">
          This email is managed by your login provider and cannot be changed here.
        </p>
      </div>

      {/* 2. NAME INPUT */}
      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={initialName} 
          placeholder="e.g. Jane Doe" 
          required
          className="text-base md:text-sm"
        />
      </div>

      {/* 3. SUBMIT BUTTON */}
      <div className="pt-2">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}