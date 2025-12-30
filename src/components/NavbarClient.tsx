"use client"; 

import { useState } from "react";
import Link from "next/link";

type User = {
  email?: string | null;
  role?: string | null;
} | null;

export default function NavbarClient({ user }: { user: User }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  let dashboardUrl = '/volunteer';
  if (user?.role === 'admin') dashboardUrl = '/admin';
  if (user?.role === 'lead') dashboardUrl = '/lead';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">Volunteer<span className="text-emerald-600">App</span></span>
        </Link>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLinks user={user} dashboardUrl={dashboardUrl} />
        </div>

        {/* --- MOBILE TOGGLE BUTTON --- */}
        <button 
          className="md:hidden p-2 -mr-2 text-slate-600 active:scale-95 transition-transform"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            // X Icon
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6 18 18"/></svg>
          ) : (
            // Hamburger Icon
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
           <NavLinks user={user} dashboardUrl={dashboardUrl} isMobile />
        </div>
      )}
    </nav>
  );
}

// --- SHARED LINKS COMPONENT ---
function NavLinks({ user, dashboardUrl, isMobile }: { user: User, dashboardUrl: string, isMobile?: boolean }) {
  const baseClass = "text-slate-600 hover:text-emerald-600 transition-colors py-1";
  
  if (!user) {
    return (
      <>
         <Link href="/auth/login" className={baseClass}>Sign In</Link>
         <Link href="/auth/login" className={`btn-primary text-sm px-5 ${isMobile ? 'w-full text-center' : ''}`}>Get Started</Link>
      </>
    );
  }

  return (
    <>
      <Link href={dashboardUrl} className={baseClass}>Dashboard</Link>

      {user.role === 'volunteer' && (
        <Link href="/projects" className={baseClass}>Browse Projects</Link>
      )}

      {user.role === 'admin' && (
        <>
          <Link href="/admin/users" className={baseClass}>User Management</Link>
          <Link href="/admin/projects" className={baseClass}>All Projects</Link>
        </>
      )}

      <Link href="/settings" className={baseClass}>Settings</Link>
      
      {/* Divider */}
      {isMobile ? <hr className="border-slate-100 my-1" /> : <div className="h-6 w-px bg-slate-200 mx-2"></div>}
      
      {/* MOBILE USER INFO SECTION 
        If Mobile: Use 'w-full justify-between' to push items to edges.
        If Desktop: Use 'gap-3' to keep them close.
      */}
      <div className={`flex ${isMobile ? 'w-full items-center justify-between' : 'items-center gap-3'}`}>
        
        {/* User Email (Left on Mobile) */}
        <div className={isMobile ? 'flex flex-col' : 'text-right'}>
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{user.email}</p>
        </div>
        
        {/* Log Out Button (Right on Mobile) */}
        <a 
          href="/auth/logout" 
          className={`
            text-xs font-semibold rounded-md transition-all
            ${isMobile 
              ? 'bg-slate-100 text-slate-700 px-4 py-2 active:scale-95'
              : 'text-slate-500 hover:text-red-600 border border-slate-200 px-3 py-1.5 hover:bg-slate-50'
            }
          `}
        >
          Log Out
        </a>
      </div>
    </>
  );
}