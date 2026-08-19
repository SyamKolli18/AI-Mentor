import React, { useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Terminal, LayoutDashboard, LogOut, Menu, X, 
  ChevronRight, Sparkles, BookOpen, Compass, Brain, Settings,
  LineChart, Bot, GraduationCap
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Router protection
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-slate-400">Restoring session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/profile-analysis', icon: Brain, disabled: !user.isOnboarded },
    { name: 'Career', href: '/career', icon: Compass, disabled: !user.isOnboarded },
    { name: 'My Roadmap', href: '/roadmaps', icon: BookOpen, disabled: !user.isOnboarded },
    { name: 'Learning', href: '/learning', icon: GraduationCap, disabled: !user.isOnboarded },
    { name: 'AI Mentor', href: '/assistant', icon: Bot, disabled: !user.isOnboarded },
    { name: 'Progress', href: '/progress', icon: LineChart, disabled: !user.isOnboarded },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground bg-grid">
      {/* Background radial effects */}
      <div className="glow-blur -top-40 -left-40" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#3A2720] bg-[#18120F] shrink-0">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-[#3A2720]">
          <div className="h-7 w-7 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-glow">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold text-xs tracking-widest text-stone-50">AI MENTOR</span>
          <span className="text-[8px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full font-bold">
            PRO
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-[#3A2720] flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-glow">
            {user.name.charAt(0).toUpperCase()}
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0C0A09]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-bold text-stone-100 truncate">{user.name}</h4>
            <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation Link List */}
        <nav className="flex-grow p-4 flex flex-col gap-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 text-[11px] cursor-not-allowed select-none bg-transparent"
                  title="Complete onboarding to unlock this feature"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                  <span className="ml-auto text-[8px] bg-[#0C0A09] text-stone-500 border border-[#3A2720] px-1.5 py-0.5 rounded font-mono uppercase">
                    Locked
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all border ${
                    isActive
                      ? 'bg-[#211712] border-orange-500/40 text-orange-400 font-bold shadow-glow'
                      : 'text-stone-300 hover:text-white hover:bg-[#211712] border-transparent'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.name}</span>
                <ChevronRight className="h-3 w-3 ml-auto text-stone-600 shrink-0" />
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Area */}
        <div className="p-4 border-t border-[#3A2720]">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[11px] border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400"
            leftIcon={<LogOut className="h-4 w-4 text-stone-400 group-hover:text-rose-400" />}
            onClick={logout}
          >
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header bar */}
        <header className="h-16 border-b border-[#3A2720] bg-[#0C0A09]/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="h-7 w-7 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-glow">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-xs tracking-widest text-stone-50">AI MENTOR</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-stone-300">
            <span>Welcome back,</span>
            <span className="text-stone-50 font-bold">{user.name}</span>
            <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
          </div>

          <div className="flex items-center gap-3">
            {!user.isOnboarded && location.pathname !== '/onboarding' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/onboarding')}
                className="h-8 text-xs bg-orange-500 hover:bg-orange-400 shadow-glow"
              >
                Complete Onboarding
              </Button>
            )}
            
            {/* Mobile Sidebar Toggle */}
            <button
              className="md:hidden text-stone-400 hover:text-white p-2 rounded-lg hover:bg-[#211712] transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-30 flex bg-[#0C0A09]/95 backdrop-blur-lg animate-in fade-in duration-200">
            <div className="w-64 border-r border-[#3A2720] p-4 flex flex-col justify-between bg-[#18120F]">
              <div>
                <div className="h-16 flex items-center justify-between border-b border-[#3A2720]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-glow">
                      <Terminal className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-extrabold text-xs tracking-widest text-stone-50">AI MENTOR</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-white p-2 hover:bg-[#211712] rounded-md">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="py-4 border-b border-[#3A2720] flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-glow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 truncate">{user.name}</h4>
                    <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                  </div>
                </div>
                <nav className="flex-grow py-4 flex flex-col gap-1 overflow-y-auto max-h-[60vh]">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    if (item.disabled) return null;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                            isActive
                              ? 'bg-[#211712] border-orange-500/40 text-orange-400 font-bold shadow-glow'
                              : 'text-stone-300 hover:text-white hover:bg-[#211712] border-transparent'
                          }`
                        }
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
              <div className="border-t border-[#3A2720] pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs border border-transparent text-rose-400 hover:bg-rose-500/10"
                  leftIcon={<LogOut className="h-4 w-4" />}
                  onClick={() => { setSidebarOpen(false); logout(); }}
                >
                  Log Out
                </Button>
              </div>
            </div>
            {/* Overlay click to close */}
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Dashboard Main Scrollable Area */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto z-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
