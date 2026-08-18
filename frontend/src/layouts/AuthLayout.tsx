import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-background text-foreground relative overflow-hidden bg-grid font-sans">
      {/* Background glow effects */}
      <div className="glow-blur -top-20 left-[10%] w-[500px] h-[500px]" />
      <div className="glow-blur bottom-[-200px] right-[-100px] w-[600px] h-[600px] bg-primary/5" />

      {/* Main container */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full z-10 p-4 md:p-8 justify-center items-stretch">
        
        {/* Left Side: Dynamic Branding (hidden on mobile) */}
        <div className="hidden md:flex flex-col justify-between w-[40%] p-10 bg-slate-950/40 border border-white/5 border-r-0 rounded-l-2xl shadow-glass relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="h-9 w-9 rounded-lg bg-premium-gradient flex items-center justify-center shadow-premium">
                <Terminal className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-white">AI MENTOR</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-6 relative z-10">
            <h2 className="text-3xl font-extrabold leading-tight text-white tracking-tight">
              Accelerate your <br />
              <span className="text-gradient-purple">engineering journey</span>.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Unlock personalized pathfinding, structured syllabus mastery, project execution guides, and real-time placement simulation. 
            </p>
            <div className="flex flex-col gap-3.5 mt-4 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Shield className="h-3.5 w-3.5 text-accent" />
                </div>
                <span>Secure JWT-encrypted sessions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Shield className="h-3.5 w-3.5 text-accent" />
                </div>
                <span>Continuous adaptive suggestions</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-medium relative z-10 tracking-wider">
            © 2026 AI MENTOR INC. ALL RIGHTS RESERVED.
          </div>
        </div>

        {/* Right Side: Render children */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-slate-900/20 border border-white/5 rounded-r-2xl md:rounded-l-none rounded-l-2xl shadow-glass relative">
          
          {/* Back button */}
          <div className="absolute top-8 right-8">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white border border-white/5 bg-slate-950/20"
            >
              Back Home
            </Button>
          </div>

          {/* Form wrapper */}
          <div className="w-full max-w-md flex flex-col gap-6">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AuthLayout;
