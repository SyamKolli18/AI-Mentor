import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { 
  Sparkles, ShieldCheck, Cpu, Compass, 
  LineChart, FileSpreadsheet, Hourglass
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { WeeklyGoalsTracker } from './WeeklyGoalsTracker';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Mock placement readiness score data for radar visual representation
  const radarData = [
    { subject: 'Coding Skills', A: user.isOnboarded ? 65 : 10, fullMark: 100 },
    { subject: 'Core CSE', A: user.isOnboarded ? 70 : 10, fullMark: 100 },
    { subject: 'Projects', A: user.isOnboarded ? 55 : 5, fullMark: 100 },
    { subject: 'Communication', A: user.isOnboarded ? 80 : 15, fullMark: 100 },
    { subject: 'Certifications', A: user.isOnboarded ? 40 : 0, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* 1. GREETING ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
            Welcome back, {user.name} <Sparkles className="h-6 w-6 text-accent animate-pulse" />
          </h1>
          <p className="text-sm text-slate-400">
            Monitor your placement readiness milestones and target skill trees.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-semibold self-start md:self-auto">
          <ShieldCheck className="h-4.5 w-4.5" />
          Account Active
        </div>
      </div>

      {/* 2. ONBOARDED STATE CHECK */}
      {!user.isOnboarded ? (
        <Card className="border-indigo-500/20 bg-indigo-500/5 py-8 text-center flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-[35%] bg-glow-gradient opacity-30 blur-[40px] pointer-events-none" />
          <Cpu className="h-10 w-10 text-primary animate-spin" />
          <div className="max-w-md flex flex-col gap-1.5">
            <h3 className="text-lg font-bold text-white">Initialize AI Mentor Engines</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please complete your onboarding profile wizard. Our recommendation system requires details on your skills, subjects, and constraints to structure your syllabus map.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* 3. METRIC METADATA CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverEffect className="bg-card/10 flex items-start gap-4">
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Role</span>
                <span className="text-base font-bold text-white">{user.onboarding?.careerGoals?.preferredCareer || 'N/A'}</span>
                <span className="text-[10px] text-slate-400 font-medium">Confidence: {user.onboarding?.careerGoals?.confidenceLevel || 'N/A'}</span>
              </div>
            </Card>

            <Card hoverEffect className="bg-card/10 flex items-start gap-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Hourglass className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Study Allocation</span>
                <span className="text-base font-bold text-white">{user.onboarding?.preferences?.dailyStudyTime || 0} Hours Daily</span>
                <span className="text-[10px] text-slate-400 font-medium">Style: {user.onboarding?.preferences?.learningStyle || 'N/A'}</span>
              </div>
            </Card>

            <Card hoverEffect className="bg-card/10 flex items-start gap-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Bio</span>
                <span className="text-base font-bold text-white truncate max-w-[190px]">{user.onboarding?.academic?.college || 'N/A'}</span>
                <span className="text-[10px] text-slate-400 font-medium">{user.onboarding?.academic?.degree || 'N/A'} | {user.onboarding?.academic?.cgpa || 0} CGPA</span>
              </div>
            </Card>
          </div>

          {/* 4. VISUALIZATION RADAR CHART ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Radar skills chart */}
            <Card className="lg:col-span-2 bg-card/10 flex flex-col gap-4">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <LineChart className="h-4.5 w-4.5 text-primary" /> Placement Competency Vectors
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Relative score metrics analyzed from skills inventory, academic marks, and certificates.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <defs>
                      <radialGradient id="radarGlow" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.15}/>
                      </radialGradient>
                    </defs>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#D1D5DB', fontSize: 9, fontWeight: '600' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 8 }} />
                    <Radar name="Student Profile" dataKey="A" stroke="#6366F1" strokeWidth={2} fill="url(#radarGlow)" fillOpacity={0.8} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profile actions checklist */}
            <Card className="bg-card/10 flex flex-col gap-4">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-accent" /> Custom Pathfinder Setup
                </CardTitle>
                <CardDescription className="text-[11px]">
                  AI Mentor path generation steps.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">✓</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">Academic Onboarding Info</span>
                    <span className="text-[10px] text-slate-500">Provided college and GPA metrics.</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">✓</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">Skills Mapping</span>
                    <span className="text-[10px] text-slate-500">{user.onboarding?.skills?.languages?.length || 0} languages and {user.onboarding?.skills?.subjects?.length || 0} subjects.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0 animate-pulse">⚙</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-300">Generate Syllabus Tree</span>
                    <span className="text-[10px] text-slate-500">Creating custom syllabus (Phase 4).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 font-bold shrink-0">?</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-600">Simulate Mock Placements</span>
                    <span className="text-[10px] text-slate-700">Awaiting roadmap completion.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* 5. WEEKLY GOALS & PROGRESS TIMELINE WIDGET */}
          <div className="mt-6 border-t border-white/5 pt-6">
            <WeeklyGoalsTracker />
          </div>
        </>
      )}

    </div>
  );
};
export default StudentDashboard;
