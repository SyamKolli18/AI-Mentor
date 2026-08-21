import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Brain, BarChart3, 
  CheckCircle2, ShieldAlert, Cpu, Terminal
} from 'lucide-react';

export const AIProfileView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(user?.aiProfile || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const res = await api.post('/ai/analyze-profile');
      setProfile(res.data.aiProfile);
      
      if (user) {
        updateUser({
          ...user,
          aiProfile: res.data.aiProfile
        });
      }
      toast('AI Student Intelligence Profile generated!', 'success');
    } catch (err: any) {
      toast(err.message || 'Analysis failed. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const radarData = profile ? [
    { subject: 'Programming', score: profile.scores.programmingScore || profile.scores.programming, fullMark: 100 },
    { subject: 'Problem Solving', score: profile.scores.problemSolvingScore || profile.scores.problemSolving, fullMark: 100 },
    { subject: 'Communication', score: profile.scores.communicationScore || profile.scores.communication, fullMark: 100 },
    { subject: 'Mathematics', score: profile.scores.mathematicsReadiness || profile.scores.mathematics, fullMark: 100 },
    { subject: 'Creativity', score: profile.scores.creativity, fullMark: 100 },
    { subject: 'Consistency', score: profile.scores.learningConsistency || profile.scores.consistency, fullMark: 100 },
    { subject: 'Learning Speed', score: profile.scores.learningSpeed, fullMark: 100 },
    { subject: 'Confidence', score: profile.scores.aiConfidenceScore || profile.scores.confidence, fullMark: 100 },
  ] : [];

  const scoreLabels = [
    { key: 'programmingScore', altKey: 'programming', label: 'Programming Logic', color: 'text-rose-400' },
    { key: 'problemSolvingScore', altKey: 'problemSolving', label: 'Problem Solving', color: 'text-rose-400' },
    { key: 'communicationScore', altKey: 'communication', label: 'Communication Confidence', color: 'text-[#60A5FA]' },
    { key: 'mathematicsReadiness', altKey: 'mathematics', label: 'Mathematics Readiness', color: 'text-[#60A5FA]' },
    { key: 'csFundamentals', altKey: 'programming', label: 'CS Fundamentals', color: 'text-emerald-400' },
    { key: 'devReadiness', altKey: 'programming', label: 'Development Readiness', color: 'text-emerald-400' },
    { key: 'learningConsistency', altKey: 'consistency', label: 'Consistency Track', color: 'text-amber-400' },
    { key: 'aiConfidenceScore', altKey: 'confidence', label: 'AI Confidence Match', color: 'text-amber-400' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div className="border-b border-[#27272A] pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold mb-2">
          <Brain className="h-3.5 w-3.5" /> STUDENT INTELLIGENCE ENGINE
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl flex items-center gap-2">
          Student Intelligence Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cognitive skill radar, strength matrix, gap vector analysis, and learning readiness metrics.
        </p>
      </div>

      {!profile ? (
        <Card className="border-rose-500/40 bg-[#111111] text-center flex flex-col items-center gap-6 py-12 relative overflow-hidden shadow-crimson-glow">
          <div className="absolute top-0 right-0 h-full w-[40%] bg-glow-crimson pointer-events-none" />
          <Brain className="h-14 w-14 text-rose-500 animate-pulse" />
          <div className="max-w-md flex flex-col gap-2">
            <h3 className="text-xl font-extrabold text-white">Generate Cognitive Profile</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize your academic standing, programming languages, core CS subjects, and daily commitment into a complete intelligence profile.
            </p>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleAnalyze} 
            isLoading={isAnalyzing} 
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-crimson-glow"
          >
            Compute Intelligence Profile
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Banner: Learning Readiness & Position */}
          <Card className="lg:col-span-3 bg-gradient-to-r from-rose-950/60 via-[#111111] to-[#171717] border border-rose-500/40 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-crimson-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 h-full w-[40%] bg-glow-crimson pointer-events-none" />
            <div className="flex flex-col gap-2 max-w-xl relative z-10">
              <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full w-fit">
                YOUR CURRENT POSITION
              </span>
              <h2 className="text-2xl font-black text-white">
                {profile.scores.careerReadinessScore || 78}% Learning Readiness
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculated dynamically based on your programming, core CS fundamentals, and project execution profile. A readiness score above 75% indicates standard placement viability.
              </p>
            </div>
            
            <div className="flex items-center gap-6 shrink-0 relative z-10 bg-[#111111]/80 p-4 rounded-xl border border-[#27272A]">
              <div className="relative h-24 w-24 flex items-center justify-center">
                <svg className="absolute transform -rotate-90 w-full h-full">
                  <circle cx="48" cy="48" r="40" stroke="#27272A" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke="#E11D48" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (profile.scores.careerReadinessScore || 78)) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="text-lg font-black text-white font-mono">{profile.scores.careerReadinessScore || 78}%</span>
              </div>
              <div className="flex flex-col text-left gap-1">
                <span className="text-xs font-bold text-white">Technical Readiness: {profile.scores.technicalReadiness || 75}%</span>
                <span className="text-[10px] text-rose-400 font-mono">CS Fundamentals: {profile.scores.csFundamentals || 80}%</span>
                <span className="text-[10px] text-emerald-400 font-mono">Dev Readiness: {profile.scores.devReadiness || 70}%</span>
              </div>
            </div>
          </Card>

          {/* AI Mentor Highlight Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> YOUR BIGGEST STRENGTH
              </span>
              <h4 className="text-base font-extrabold text-white">Problem Solving & Logic</h4>
              <p className="text-xs text-slate-300">Strong analytical reasoning for data structures and algorithmic complexity.</p>
            </div>

            <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10 flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> YOUR BIGGEST GAP
              </span>
              <h4 className="text-base font-extrabold text-white">Data Structures & System Design</h4>
              <p className="text-xs text-slate-300">Requires structured practice with tree algorithms and distributed APIs.</p>
            </div>

            <div className="p-5 rounded-xl border border-sky-500/30 bg-sky-500/10 flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="h-4 w-4" /> AI MENTOR SAYS
              </span>
              <h4 className="text-base font-extrabold text-white">14-Day Focus Plan</h4>
              <p className="text-xs text-slate-300">"Focus strictly on DSA arrays, trees, and system design for the next 14 days."</p>
            </div>
          </div>

          {/* Left Column: Skill Radar */}
          <Card className="lg:col-span-2 bg-[#111111] border-[#27272A] flex flex-col gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                <BarChart3 className="h-4 w-4 text-rose-500" /> Skill Radar Matrix
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Visualizing normalized score vectors across 8 competency areas.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[340px] w-full flex items-center justify-center p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <defs>
                    <radialGradient id="radarGlowProfile" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="#E11D48" stopOpacity={0.65}/>
                      <stop offset="100%" stopColor="#9F1239" stopOpacity={0.15}/>
                    </radialGradient>
                  </defs>
                  <PolarGrid stroke="#27272A" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#CBD5E1', fontSize: 10, fontWeight: '700' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 8 }} />
                  <Radar name="Student Score" dataKey="score" stroke="#E11D48" strokeWidth={2} fill="url(#radarGlowProfile)" fillOpacity={0.85} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Right Column: Score Details */}
          <Card className="bg-[#111111] border-[#27272A] flex flex-col gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                <Terminal className="h-4 w-4 text-rose-500" /> Strength & Gap Breakdown
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Detailed metrics per skill vector.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 overflow-y-auto max-h-[480px] pr-1">
              {scoreLabels.map((item) => {
                const score = profile.scores[item.key] !== undefined ? profile.scores[item.key] : profile.scores[item.altKey] || 70;
                return (
                  <div key={item.key} className="flex flex-col gap-1.5 p-3 bg-[#171717] border border-[#27272A] rounded-xl">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>{item.label}</span>
                      <span className={`${item.color} font-mono font-extrabold`}>{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-rose-600"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
};
export default AIProfileView;
