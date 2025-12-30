"use client";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ className, children }: LogoutButtonProps) {
  return (
    <a
      href="/auth/logout"
      className={
        className || 
        "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all active:scale-95 shadow-sm"
      }
    >
      {children || "Log Out"}
    </a>
  );
}