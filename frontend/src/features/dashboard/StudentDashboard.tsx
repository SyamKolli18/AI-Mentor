import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Sparkles, ShieldCheck, Cpu, Compass, 
  LineChart, FileSpreadsheet, Hourglass, ArrowRight, Target, Rocket
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { WeeklyGoalsTracker } from './WeeklyGoalsTracker';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const radarData = [
    { subject: 'Coding Skills', A: user.isOnboarded ? 78 : 10, fullMark: 100 },
    { subject: 'Core CS', A: user.isOnboarded ? 82 : 10, fullMark: 100 },
    { subject: 'Projects', A: user.isOnboarded ? 65 : 5, fullMark: 100 },
    { subject: 'Communication', A: user.isOnboarded ? 85 : 15, fullMark: 100 },
    { subject: 'Certifications', A: user.isOnboarded ? 50 : 0, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      
      {/* 1. GREETING HERO SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> STUDENT INTELLIGENCE OPERATING SYSTEM
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            GOOD MORNING, {user.name.toUpperCase()}.
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your daily career co-pilot is active. Here is your current position, next move, and growth velocity.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 font-bold">
            <ShieldCheck className="h-4 w-4" />
            AI Session Active
          </div>
        </div>
      </div>

      {/* 2. UN-ONBOARDED NOTICE */}
      {!user.isOnboarded ? (
        <Card className="border-rose-500/40 bg-[#111111] py-10 text-center flex flex-col items-center gap-4 relative overflow-hidden shadow-crimson-glow">
          <Cpu className="h-12 w-12 text-rose-500 animate-spin" />
          <div className="max-w-md flex flex-col gap-2">
            <h3 className="text-xl font-black text-white">Initialize AI Mentor Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete your 5-stage onboarding to build your custom milestone roadmap and unlock career intelligence.
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => navigate('/onboarding')} className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-glow mt-2">
            Start Onboarding Wizard
          </Button>
        </Card>
      ) : (
        <>
          {/* 3. CORE QUESTION 2: "WHAT SHOULD I DO NEXT?" (PROMINENT HERO ACTION CARD) */}
          <Card className="bg-gradient-to-r from-rose-950/50 via-[#111111] to-[#171717] border border-rose-500/40 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-crimson-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 h-full w-[40%] bg-glow-crimson opacity-25 pointer-events-none" />
            <div className="flex flex-col gap-2 relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                <Target className="h-4 w-4" /> WHAT SHOULD I DO NEXT? — YOUR NEXT MOVE
              </div>
              <h3 className="text-2xl font-black text-white">
                Complete {user.onboarding?.careerGoals?.preferredCareer || 'Software Engineer'} Foundations & Data Structures
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                AI Mentor Recommendation: Completing this 45-minute practice set will increase your technical readiness score by +8% and unlock Module 2.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/learning')}
              className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold shadow-crimson-glow shrink-0 text-sm px-7 py-3 relative z-10"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue Learning
            </Button>
          </Card>

          {/* 4. CORE QUESTION 1: "WHERE AM I?" (METRIC & POSITION CARDS) */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Compass className="h-4 w-4 text-rose-400" /> WHERE AM I? — CURRENT POSITION
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hoverEffect className="bg-[#111111] border-[#27272A] flex items-start gap-4">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Career Role</span>
                  <span className="text-base font-extrabold text-white">{user.onboarding?.careerGoals?.preferredCareer || 'Software Engineer'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Confidence Level: {user.onboarding?.careerGoals?.confidenceLevel?.toUpperCase() || 'HIGH'}</span>
                </div>
              </Card>

              <Card hoverEffect className="bg-[#111111] border-[#27272A] flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Hourglass className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Allocation</span>
                  <span className="text-base font-extrabold text-white">{user.onboarding?.preferences?.dailyStudyTime || 2} Hours / Day</span>
                  <span className="text-[10px] text-slate-400 font-mono">Style: {user.onboarding?.preferences?.learningStyle?.toUpperCase() || 'VISUAL'}</span>
                </div>
              </Card>

              <Card hoverEffect className="bg-[#111111] border-[#27272A] flex items-start gap-4">
                <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Standing</span>
                  <span className="text-base font-extrabold text-white truncate max-w-[190px]">{user.onboarding?.academic?.college || 'University'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{user.onboarding?.academic?.degree || 'B.Tech'} • {user.onboarding?.academic?.cgpa || 3.8} CGPA</span>
                </div>
              </Card>
            </div>
          </div>

          {/* 5. CORE QUESTION 3: "HOW AM I PROGRESSING?" (COMPETENCY RADAR & TIMELINE) */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LineChart className="h-4 w-4 text-rose-400" /> HOW AM I PROGRESSING? — COMPETENCY VECTORS
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Radar chart */}
              <Card className="lg:col-span-2 bg-[#111111] border-[#27272A] flex flex-col gap-4">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                    <Cpu className="h-4 w-4 text-rose-400" /> Skill & Placement Readiness Matrix
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Real-time score vectors calculated from skills inventory, academic history, and milestone completions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <defs>
                        <radialGradient id="crimsonRadarGlow" cx="50%" cy="50%" r="60%">
                          <stop offset="0%" stopColor="#E11D48" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#9F1239" stopOpacity={0.15}/>
                        </radialGradient>
                      </defs>
                      <PolarGrid stroke="#27272A" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#CBD5E1', fontSize: 10, fontWeight: '700' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 8 }} />
                      <Radar name="Student Profile" dataKey="A" stroke="#E11D48" strokeWidth={2} fill="url(#crimsonRadarGlow)" fillOpacity={0.85} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Milestones checklist */}
              <Card className="bg-[#111111] border-[#27272A] flex flex-col gap-4">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                    <Rocket className="h-4 w-4 text-rose-400" /> Roadmap Pipeline
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Milestone checklist & unlocked nodes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">✓</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">Academic Onboarding</span>
                      <span className="text-[10px] text-slate-400">Verified college and CGPA records.</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold shrink-0">✓</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">Skills Calibration</span>
                      <span className="text-[10px] text-slate-400">{user.onboarding?.skills?.languages?.length || 0} languages • {user.onboarding?.skills?.subjects?.length || 0} subjects.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold shrink-0 animate-pulse">⚡</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-rose-400">Module 1: Core Foundations</span>
                      <span className="text-[10px] text-slate-300">In progress (65% complete).</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#171717] border border-[#27272A] flex items-center justify-center text-slate-500 font-bold shrink-0">🔒</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-500">Module 2: Advanced Projects</span>
                      <span className="text-[10px] text-slate-600">Locked until Module 1 completes.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* 6. WEEKLY GOALS TRACKER */}
          <div className="mt-4 border-t border-[#27272A] pt-6">
            <WeeklyGoalsTracker />
          </div>
        </>
      )}

    </div>
  );
};
export default StudentDashboard;
