import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginButton from "@/components/LoginButton"; 

export default async function HomePage() {
  const user = await getAuthUser();

  if (user) {
    if (user.role === 'admin') redirect ('/admin')
    else if (user.role === 'lead') redirect('/admin');
    else redirect('/volunteer');
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Now accepting new volunteers
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl">
          Code for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Good</span>. <br />
          Build for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Community</span>.
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Join a community of developers, designers, and organizers using their skills to solve real-world problems.
        </p>

        <div className="transform hover:scale-105 transition-transform duration-200">
          <LoginButton className="btn-primary text-lg px-8 py-3 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            Get Started
          </LoginButton>
        </div>
      </section>

      {/* Footer Area */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100">
        <p>Trusted by open source communities everywhere.</p>
      </footer>
    </div>
  );
}