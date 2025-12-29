import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';

export default async function Navbar() {
  const user = await getAuthUser();

  // Helper to determine the dashboard link
  let dashboardUrl = '/volunteer';
  if (user?.role === 'admin') dashboardUrl = '/admin';
  if (user?.role === 'lead') dashboardUrl = '/lead';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">Volunteer<span className="text-emerald-600">App</span></span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          {!user ? (
            <>
               <Link href="/auth/login" className="text-slate-600 hover:text-emerald-600 transition-colors">Sign In</Link>
               <Link href="/auth/login" className="btn-primary text-sm px-5">Get Started</Link>
            </>
          ) : (
            <>
              <Link href={dashboardUrl} className="text-slate-600 hover:text-emerald-600 transition-colors">
                Dashboard
              </Link>

              {user.role === 'volunteer' && (
                <Link href="/projects" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Browse Projects
                </Link>
              )}

              {user.role === 'admin' && (
                <Link href="/admin/users" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  User Management
                </Link>
              )}

              {user.role === 'admin' && (
                <Link href="/admin/projects" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  All Projects
                </Link>
              )}

              <Link href="/settings" className="text-slate-600 hover:text-emerald-600 transition-colors">
                Settings
              </Link>
              
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="text-xs font-bold text-slate-800">{user.email}</p>
                </div>
                <a href="/auth/logout" className="text-slate-500 hover:text-red-600 text-xs font-semibold border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-all">
                  Log Out
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}