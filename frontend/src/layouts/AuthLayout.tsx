import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronLeft, Cpu } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-background text-foreground relative overflow-hidden bg-grid font-sans">
      {/* Background crimson glow effects */}
      <div className="glow-blur -top-20 left-[10%] w-[500px] h-[500px]" />
      <div className="glow-blur bottom-[-200px] right-[-100px] w-[600px] h-[600px]" />

      {/* Main container */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full z-10 p-4 md:p-8 justify-center items-stretch my-auto">
        
        {/* Left Side: Asymmetric AI Mentor Showcase (hidden on mobile) */}
        <div className="hidden md:flex flex-col justify-between w-[44%] p-10 bg-[#111111] border border-[#27272A] border-r-0 rounded-l-2xl shadow-glass relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 via-transparent to-rose-950/20 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="h-9 w-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-sm tracking-widest text-white">AI MENTOR</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-400 font-bold self-start">
              <Cpu className="h-3.5 w-3.5" /> CAREER INTELLIGENCE SYSTEM
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-white tracking-tight">
              Tell AI Mentor where you are. <br />
              <span className="text-gradient-crimson">We'll show you where to go</span>.
            </h2>

            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Join thousands of engineering students who use AI Mentor to transform academic profiles into structured career roadmaps and placement offers.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
              <div className="p-3 rounded-xl border border-[#27272A] bg-[#171717] flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">CAREER MATCHING</span>
                <span className="text-lg font-bold text-white font-mono">99.4%</span>
              </div>
              <div className="p-3 rounded-xl border border-[#27272A] bg-[#171717] flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">ROADMAPS BUILT</span>
                <span className="text-lg font-bold text-rose-400 font-mono">14,800+</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono relative z-10 tracking-wider">
            © 2026 AI MENTOR INC. ALL RIGHTS RESERVED.
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-[#0B0B0B]/90 border border-[#27272A] rounded-r-2xl md:rounded-l-none rounded-l-2xl shadow-glass relative">
          
          <div className="absolute top-8 right-8">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white border border-[#27272A] bg-[#111111]"
            >
              Back Home
            </Button>
          </div>

          <div className="w-full max-w-md flex flex-col gap-6">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AuthLayout;
