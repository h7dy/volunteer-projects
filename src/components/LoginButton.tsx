"use client";

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LoginButton({ className, children }: LoginButtonProps) {
  return (
    <a href="/auth/login" className={className}>
      {children || "Log In"}
    </a>
  );
}