"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">
        <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      {user.picture ? (
        <img 
          src={user.picture} 
          alt={user.name || "Profile"} 
          className="w-12 h-12 rounded-full border border-slate-100 object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
          {user.name?.charAt(0) || "U"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h2 className="text-slate-900 font-semibold truncate">
          {user.name}
        </h2>
        <p className="text-slate-500 text-sm truncate">
          {user.email}
        </p>
      </div>
    </div>
  );
}