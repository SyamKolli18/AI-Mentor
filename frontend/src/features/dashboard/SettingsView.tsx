import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Settings, User, Mail, Shield, Sliders, Cpu, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'learning' | 'ai' | 'security'>('profile');

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div className="border-b border-[#27272A] pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold mb-2">
          <Settings className="h-3.5 w-3.5" /> SYSTEM PREFERENCES
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl flex items-center gap-2">
          Settings & Profile Controls
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your AI Mentor student account, learning parameters, and AI model settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#27272A] pb-1 font-mono text-xs">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'learning', label: 'Learning Preferences', icon: Sliders },
          { id: 'ai', label: 'AI Mentor Preferences', icon: Cpu },
          { id: 'security', label: 'Security & Account', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'profile' && (
          <>
            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col gap-4 shadow-glass">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-rose-500" /> Account Identity
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Student account credentials.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-mono text-[10px]">FULL NAME</span>
                  <span className="text-white font-bold bg-[#171717] p-3 rounded-lg border border-[#27272A]">{user?.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-mono text-[10px]">STUDENT EMAIL</span>
                  <span className="text-white font-bold bg-[#171717] p-3 rounded-lg border border-[#27272A] flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" /> {user?.email}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-mono text-[10px]">ROLE</span>
                  <span className="text-rose-400 font-bold uppercase tracking-wider bg-[#171717] p-3 rounded-lg border border-[#27272A] font-mono">
                    {user?.role || 'student'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col gap-4 shadow-glass">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Academic Verification
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Onboarding status & institutional link.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center bg-[#171717] p-3 rounded-lg border border-[#27272A]">
                  <span className="text-slate-300">Onboarding Status:</span>
                  <span className="text-emerald-400 font-bold font-mono">VERIFIED ✔</span>
                </div>
                <div className="flex justify-between items-center bg-[#171717] p-3 rounded-lg border border-[#27272A]">
                  <span className="text-slate-300">Institution:</span>
                  <span className="text-white font-bold">{user?.onboarding?.academic?.college || 'University'}</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'learning' && (
          <Card className="md:col-span-2 bg-[#111111] border-[#27272A] p-6 flex flex-col gap-4 shadow-glass">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-rose-500" /> Learning Pacing & Style Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#171717] rounded-xl border border-[#27272A] flex flex-col gap-1">
                <span className="text-slate-400 font-mono text-[10px]">DAILY STUDY TARGET</span>
                <span className="text-lg font-bold text-white">{user?.onboarding?.preferences?.dailyStudyTime || 2} Hours / Day</span>
              </div>
              <div className="p-4 bg-[#171717] rounded-xl border border-[#27272A] flex flex-col gap-1">
                <span className="text-slate-400 font-mono text-[10px]">LEARNING STYLE</span>
                <span className="text-lg font-bold text-white uppercase">{user?.onboarding?.preferences?.learningStyle || 'VISUAL'}</span>
              </div>
              <div className="p-4 bg-[#171717] rounded-xl border border-[#27272A] flex flex-col gap-1">
                <span className="text-slate-400 font-mono text-[10px]">COMMUNICATION LEVEL</span>
                <span className="text-lg font-bold text-white uppercase">{user?.onboarding?.preferences?.communicationSkills || 'GOOD'}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'ai' && (
          <Card className="md:col-span-2 bg-[#111111] border-[#27272A] p-6 flex flex-col gap-4 shadow-glass">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-rose-500" /> AI Mentor Engine & Provider Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-3 text-xs">
              <div className="p-4 bg-[#171717] rounded-xl border border-[#27272A] flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-white font-bold text-sm">Primary LLM Provider</span>
                  <span className="text-slate-400">Google Gemini API (Adaptive Student Model)</span>
                </div>
                <span className="text-xs text-rose-400 font-mono font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded">CONNECTED</span>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="md:col-span-2 bg-[#111111] border-[#27272A] p-6 flex flex-col gap-4 shadow-glass">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-rose-500" /> Session & Token Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-3 text-xs">
              <div className="p-4 bg-[#171717] rounded-xl border border-[#27272A] flex justify-between items-center">
                <div>
                  <span className="text-white font-bold block">JWT Token Encryption & Refresh Token Rotation</span>
                  <span className="text-slate-400 text-[11px]">Automatic silent refresh active on 401 response handling.</span>
                </div>
                <span className="text-emerald-400 font-mono font-bold">SECURE ✔</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default SettingsView;
