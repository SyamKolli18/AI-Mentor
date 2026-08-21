import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, Sparkles, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden bg-grid">
      {/* Crimson Glow Overlays */}
      <div className="glow-blur -top-40 -left-40" />
      <div className="glow-blur top-[30%] -right-40" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#27272A] bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-glow group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-sm tracking-widest text-white font-sans flex items-center gap-2">
                AI MENTOR <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono">2.0</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-7">
              <a href="#features" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors tracking-wide uppercase">Features</a>
              <a href="#how-it-works" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors tracking-wide uppercase">How It Works</a>
              <a href="#pricing" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors tracking-wide uppercase">Pricing</a>
              <a href="#faq" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors tracking-wide uppercase">FAQ</a>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="glass" size="sm" onClick={logout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" rightIcon={<Rocket className="h-4 w-4" />} onClick={() => navigate('/signup')}>
                  Build My Roadmap
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-x-0 border-t-0 bg-[#050505]/95 backdrop-blur-lg px-6 py-4 flex flex-col gap-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-[#27272A]">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-[#27272A]">How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-[#27272A]">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-[#27272A]">FAQ</a>
            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" className="w-full justify-center" onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}>Dashboard</Button>
                  <Button variant="outline" className="w-full justify-center" onClick={() => { setMobileMenuOpen(false); logout(); }}>Log Out</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-center" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>Sign In</Button>
                  <Button variant="primary" className="w-full justify-center" onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}>Build My Roadmap</Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#27272A] bg-[#050505] py-12 px-6 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-rose-500" />
              <span className="font-extrabold tracking-wider text-white">AI MENTOR</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              AI-powered personalized career and learning operating system guiding students from college to career readiness.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Roadmaps</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between border-t border-[#27272A] mt-8 pt-8 text-xs text-slate-500">
          <p>© 2026 AI Mentor Inc. All rights reserved.</p>
          <p>Built with ❤️ by AI Mentor Team.</p>
        </div>
      </footer>
    </div>
  );
};
export default LandingLayout;
