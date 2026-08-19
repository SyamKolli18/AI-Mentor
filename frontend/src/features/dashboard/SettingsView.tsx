import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Settings, User, Mail, Shield, Sparkles } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div className="border-b border-[#3A2720] pb-5">
        <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Account Settings
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-50 md:text-3xl mt-1 flex items-center gap-2">
          Settings & Preferences <Settings className="h-6 w-6 text-orange-400" />
        </h1>
        <p className="text-xs text-stone-300">
          Manage your AI Mentor account profile details and preference parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#18120F] border-[#3A2720] p-6 flex flex-col gap-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base font-bold text-stone-50 flex items-center gap-2">
              <User className="h-5 w-5 text-orange-400" /> Profile Information
            </CardTitle>
            <CardDescription className="text-xs text-stone-300">Your registered user account credentials.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-stone-400">Full Name</span>
              <span className="text-stone-50 font-bold bg-[#0C0A09] p-2.5 rounded-lg border border-[#3A2720]">{user?.name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400">Email Address</span>
              <span className="text-stone-50 font-bold bg-[#0C0A09] p-2.5 rounded-lg border border-[#3A2720] flex items-center gap-2">
                <Mail className="h-4 w-4 text-stone-500" /> {user?.email}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400">Account Role</span>
              <span className="text-orange-400 font-bold uppercase tracking-wider bg-[#0C0A09] p-2.5 rounded-lg border border-[#3A2720]">
                {user?.role || 'student'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18120F] border-[#3A2720] p-6 flex flex-col gap-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base font-bold text-stone-50 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" /> AI Provider & System Integration
            </CardTitle>
            <CardDescription className="text-xs text-stone-300">Backend AI LLM engine status.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-stone-400">Primary AI Engine</span>
              <span className="text-emerald-400 font-bold bg-[#0C0A09] p-2.5 rounded-lg border border-[#3A2720] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" /> Google Gemini API (Adaptive Mode)
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400">Authentication Token Rotation</span>
              <span className="text-stone-50 font-bold bg-[#0C0A09] p-2.5 rounded-lg border border-[#3A2720]">
                Active JWT & Refresh Token Rotation Enabled
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default SettingsView;
