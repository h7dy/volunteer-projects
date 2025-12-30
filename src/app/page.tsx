import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginButton from "@/components/LoginButton"; 

export default async function HomePage() {
  const user = await getAuthUser();

  if (user) {
    if (user.role === 'admin') redirect ('/admin')
    else if (user.role === 'lead') redirect('/lead');
    else redirect('/volunteer');
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px)]">
      
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 md:py-20 bg-gradient-to-b from-white to-slate-50">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Now accepting new volunteers
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-100">
          Volunteer for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Impact</span>. <br className="hidden md:block" />
          Strengthen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Community</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-8 md:mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-200">
          Connect with local initiatives, lend a hand where it is needed most, and make a tangible difference in the lives of others.
        </p>

        {/* CTA Button */}
        <div className="transform hover:scale-105 transition-transform duration-200 animate-in fade-in zoom-in duration-700 fill-mode-both delay-300 w-full sm:w-auto">
          <LoginButton className="btn-primary text-lg w-full sm:w-auto px-8 py-4 rounded-xl shadow-emerald-200/50 shadow-lg">
            Get Started
          </LoginButton>
        </div>
      </section>

      {/* Footer Area */}
      <footer className="py-6 md:py-8 text-center text-slate-400 text-xs md:text-sm border-t border-slate-100 bg-white">
        <p>Empowering communities to grow together.</p>
      </footer>
    </div>
  );
}