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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A2720] pb-5">
        <div>
          <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Student Overview
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-50 md:text-3xl mt-1 flex items-center gap-2">
            Welcome back, {user.name} <Sparkles className="h-6 w-6 text-orange-400 animate-pulse" />
          </h1>
          <p className="text-xs text-stone-300">
            Monitor your placement readiness milestones, active learning module, and target career track.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 font-semibold self-start md:self-auto">
          <ShieldCheck className="h-4.5 w-4.5" />
          Account Active
        </div>
      </div>

      {/* 2. ONBOARDED STATE CHECK */}
      {!user.isOnboarded ? (
        <Card className="border-orange-500/30 bg-[#18120F] py-8 text-center flex flex-col items-center gap-4 relative overflow-hidden">
          <Cpu className="h-10 w-10 text-orange-400 animate-spin" />
          <div className="max-w-md flex flex-col gap-1.5">
            <h3 className="text-lg font-bold text-stone-50">Initialize AI Mentor Engines</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Please complete your onboarding profile wizard. Our recommendation system requires details on your skills, subjects, and constraints to structure your syllabus map.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* 3. PROMINENT "YOUR NEXT STEP" ACTION CARD */}
          <Card className="bg-gradient-to-r from-orange-500/10 via-[#18120F] to-amber-500/10 border border-orange-500/40 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-glow">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                ⚡ Your Next Step
              </span>
              <h3 className="text-xl font-black text-stone-50">
                Continue Topic: {user.onboarding?.careerGoals?.preferredCareer || 'Frontend Development'} Fundamentals
              </h3>
              <p className="text-xs text-stone-300 max-w-xl">
                Why: This is required to unlock your next adaptive roadmap milestone.
              </p>
            </div>
            <a
              href="/learning"
              className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs transition-all shadow-glow shrink-0"
            >
              Continue Learning →
            </a>
          </Card>

          {/* 4. METRIC METADATA CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverEffect className="bg-[#18120F] border-[#3A2720] flex items-start gap-4">
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Target Role</span>
                <span className="text-base font-bold text-stone-50">{user.onboarding?.careerGoals?.preferredCareer || 'N/A'}</span>
                <span className="text-[10px] text-stone-300 font-medium">Confidence: {user.onboarding?.careerGoals?.confidenceLevel || 'High'}</span>
              </div>
            </Card>

            <Card hoverEffect className="bg-[#18120F] border-[#3A2720] flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Hourglass className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Daily Allocation</span>
                <span className="text-base font-bold text-stone-50">{user.onboarding?.preferences?.dailyStudyTime || 3} Hours Daily</span>
                <span className="text-[10px] text-stone-300 font-medium">Style: {user.onboarding?.preferences?.learningStyle || 'Kinesthetic'}</span>
              </div>
            </Card>

            <Card hoverEffect className="bg-[#18120F] border-[#3A2720] flex items-start gap-4">
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Academic Bio</span>
                <span className="text-base font-bold text-stone-50 truncate max-w-[190px]">{user.onboarding?.academic?.college || 'N/A'}</span>
                <span className="text-[10px] text-stone-300 font-medium">{user.onboarding?.academic?.degree || 'B.Tech'} | {user.onboarding?.academic?.cgpa || 8.5} CGPA</span>
              </div>
            </Card>
          </div>

          {/* 5. VISUALIZATION RADAR CHART ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Radar skills chart */}
            <Card className="lg:col-span-2 bg-[#18120F] border-[#3A2720] flex flex-col gap-4">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-stone-50">
                  <LineChart className="h-4.5 w-4.5 text-orange-400" /> Placement Competency Vectors
                </CardTitle>
                <CardDescription className="text-[11px] text-stone-300">
                  Relative score metrics analyzed from skills inventory, academic marks, and certificates.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <defs>
                      <radialGradient id="radarGlow" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.15}/>
                      </radialGradient>
                    </defs>
                    <PolarGrid stroke="#3A2720" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#D6D3D1', fontSize: 9, fontWeight: '600' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#A8A29E', fontSize: 8 }} />
                    <Radar name="Student Profile" dataKey="A" stroke="#F97316" strokeWidth={2} fill="url(#radarGlow)" fillOpacity={0.8} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profile actions checklist */}
            <Card className="bg-[#18120F] border-[#3A2720] flex flex-col gap-4">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-stone-50">
                  <Sparkles className="h-4.5 w-4.5 text-orange-400" /> Pathfinder Milestones
                </CardTitle>
                <CardDescription className="text-[11px] text-stone-300">
                  AI Mentor path generation steps.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">✓</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-50">Academic Onboarding Info</span>
                    <span className="text-[10px] text-stone-400">Provided college and GPA metrics.</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">✓</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-50">Skills Mapping</span>
                    <span className="text-[10px] text-stone-400">{user.onboarding?.skills?.languages?.length || 0} languages and {user.onboarding?.skills?.subjects?.length || 0} subjects.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold shrink-0 animate-pulse">⚙</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-200">Generate Roadmap Tree</span>
                    <span className="text-[10px] text-stone-400">Adaptive syllabus initialized.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#211712] border border-[#3A2720] flex items-center justify-center text-stone-400 font-bold shrink-0">?</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-300">Master Topics & Progress</span>
                    <span className="text-[10px] text-stone-400">In progress.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* 6. WEEKLY GOALS WIDGET */}
          <div className="mt-6 border-t border-[#3A2720] pt-6">
            <WeeklyGoalsTracker />
          </div>
        </>
      )}

    </div>
  );
};
export default StudentDashboard;
