import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid
} from 'recharts';
import { 
  Sparkles, AlertTriangle, TrendingUp, HelpCircle, RefreshCw,
  ListChecks, Calendar, Compass, ShieldCheck
} from 'lucide-react';

export const PlacementReadinessView: React.FC = () => {
  const { toast } = useToast();
  const [readiness, setReadiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchReadiness = async () => {
    try {
      setLoading(true);
      const res = await api.get('/placement/readiness');
      if (res.data.status === 'success') {
        setReadiness(res.data.readiness);
      }
    } catch (err: any) {
      toast('Failed to load recruitment metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  const handleRecalculate = async () => {
    try {
      setUpdating(true);
      const res = await api.post('/placement/recalculate');
      if (res.data.status === 'success') {
        setReadiness(res.data.readiness);
        toast('Recalculated placement vectors successfully!', 'success');
      }
    } catch (err: any) {
      toast('Recalculation failed.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!readiness) {
    return (
      <div className="flex flex-col gap-6 text-left animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl font-extrabold text-white">AI Placement Readiness</h1>
        </div>
        <Card className="border-indigo-500/20 bg-indigo-500/5 text-center flex flex-col items-center gap-6 py-12">
          <HelpCircle className="h-10 w-10 text-slate-500 animate-pulse" />
          <div>
            <h3 className="text-lg font-bold text-white">No Metrics Found</h3>
            <p className="text-xs text-slate-400">Complete onboarding to calibrate placement statistics.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Format data for radar
  const radarData = [
    { subject: 'DSA', score: readiness.scores.dsa, fullMark: 100 },
    { subject: 'OOP', score: readiness.scores.oop, fullMark: 100 },
    { subject: 'DBMS', score: readiness.scores.dbms, fullMark: 100 },
    { subject: 'OS', score: readiness.scores.os, fullMark: 100 },
    { subject: 'Networks', score: readiness.scores.networks, fullMark: 100 },
    { subject: 'System Design', score: readiness.scores.systemDesign, fullMark: 100 },
    { subject: 'Aptitude', score: readiness.scores.aptitude, fullMark: 100 },
    { subject: 'Communication', score: readiness.scores.communication, fullMark: 100 },
    { subject: 'Projects', score: readiness.scores.projects, fullMark: 100 },
    { subject: 'Mock Interviews', score: readiness.scores.mockInterviews, fullMark: 100 }
  ];

  // Company Match labels
  const companyData = readiness.companyReadiness?.map((c: any) => ({
    Type: c.companyType,
    Match: c.matchPercentage
  })) || [];

  // Progression metrics data
  const progressData = readiness.weeklyProgress?.map((w: any) => ({
    week: w.label,
    Score: w.score
  })) || [];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
            AI Placement Readiness Engine <Sparkles className="h-6 w-6 text-accent animate-pulse" />
          </h1>
          <p className="text-sm text-slate-400">
            Intelligent recruitment score matrices compiled dynamically across core subjects and communication variables.
          </p>
        </div>

        <Button 
          variant="primary" 
          onClick={handleRecalculate} 
          isLoading={updating}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="self-start md:self-auto text-xs h-9 bg-gradient-to-r from-violet-600 to-indigo-600 border-none hover:shadow-glow shadow-violet-500/20"
        >
          Compute Placement Metrics
        </Button>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Placement score radial indicator */}
        <Card className="md:col-span-2 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border-indigo-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-accent/25 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex flex-col gap-2 max-w-xs">
            <span className="text-[9px] bg-accent/20 text-accent font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit">
              Ready Score
            </span>
            <h2 className="text-base font-extrabold text-white">Overall Placement readiness</h2>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Synthesized from coding progress, CS fundamentals, mock interviews, and projects quality. Above 80% is high FAANG tier threshold.
            </p>
          </div>
          <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
            <svg className="absolute transform -rotate-90 w-full h-full">
              <circle cx="56" cy="56" r="46" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" fill="transparent" />
              <circle 
                cx="56" 
                cy="56" 
                r="46" 
                stroke="#6366F1" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={289}
                strokeDashoffset={289 - (289 * (readiness.readinessScore || 0)) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="text-xl font-black text-white">{readiness.readinessScore || 0}%</span>
          </div>
        </Card>

        {/* Company Readiness Matches list */}
        <Card className="md:col-span-2 bg-slate-900/40 border-white/5 p-6 flex flex-col gap-4">
          <h3 className="font-extrabold text-white text-xs block uppercase tracking-wider">Company Category Fit Matrix</h3>
          <div className="grid grid-cols-2 gap-4">
            {readiness.companyReadiness?.map((c: any, index: number) => (
              <div key={index} className="flex justify-between items-center bg-[#070514]/40 border border-white/5 rounded-lg p-2.5">
                <span className="text-[11px] font-bold text-slate-300">{c.companyType}</span>
                <span className="text-xs font-black text-primary">{c.matchPercentage}%</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Visual Analytics graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar graph layout */}
        <Card className="lg:col-span-2 bg-card/10 flex flex-col gap-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Compass className="h-4.5 w-4.5 text-primary" /> Multi-Topic Competency Vectors</CardTitle>
            <CardDescription className="text-[10px]">Comparing DSA, OS, Aptitude, Comm, and Projects variables.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] w-full flex items-center justify-center p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <defs>
                  <radialGradient id="radarGlowReadiness" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.65}/>
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.15}/>
                  </radialGradient>
                </defs>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#D1D5DB', fontSize: 8, fontWeight: '600' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
                <Radar name="Readiness Vectors" dataKey="score" stroke="#6366F1" strokeWidth={2} fill="url(#radarGlowReadiness)" fillOpacity={0.8} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Company Match Rate stats chart */}
        <Card className="bg-card/10 flex flex-col gap-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5"><TrendingUp className="h-4.5 w-4.5 text-indigo-400" /> Match Rate Index</CardTitle>
            <CardDescription className="text-[10px]">Percentage score per recruitment class.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGlowReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="Type" stroke="#9CA3AF" fontSize={8} fontWeight="600" />
                <YAxis stroke="#9CA3AF" fontSize={8} fontWeight="600" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151B2D', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}
                  itemStyle={{ fontSize: 10 }}
                />
                <Bar dataKey="Match" fill="url(#barGlowReadiness)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Areas breakdown grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-300">
        
        {/* Strong Areas */}
        <Card className="border-emerald-500/10 bg-emerald-500/5 p-4 flex flex-col gap-2">
          <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/20 pb-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" /> Strengths (CS Vectors Completed)
          </h4>
          <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1">
            {readiness.strongAreas?.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </Card>

        {/* Weak Areas */}
        <Card className="border-rose-500/10 bg-rose-500/5 p-4 flex flex-col gap-2">
          <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-rose-500/20 pb-1.5">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-400" /> Weak areas / Prerequisite Gaps
          </h4>
          <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1">
            {readiness.weakAreas?.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </Card>

      </div>

      {/* Progress timeline area and AI improvement plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Action checklist */}
        <Card className="lg:col-span-1 border-white/5 bg-card/10 p-6 flex flex-col gap-4 text-xs text-slate-300">
          <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
            <ListChecks className="h-4.5 w-4.5 text-primary" /> Actionable AI Roadmap Plan
          </h4>
          <ol className="list-decimal pl-4 text-slate-400 flex flex-col gap-2.5">
            {readiness.aiImprovementPlan?.map((item: string, idx: number) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ol>
        </Card>

        {/* Progress chart */}
        <Card className="lg:col-span-2 border-white/5 bg-card/10 p-6 flex flex-col gap-4">
          <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Calendar className="h-4.5 w-4.5 text-accent" /> Weekly Progress Timeline
          </h4>
          <div className="h-[200px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="week" stroke="#9CA3AF" fontSize={8} fontWeight="600" />
                <YAxis stroke="#9CA3AF" fontSize={8} fontWeight="600" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151B2D', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}
                  itemStyle={{ fontSize: 10 }}
                />
                <Area type="monotone" dataKey="Score" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

    </div>
  );
};

// Mock subcomponents to avoid Recharts headers error
const CardHeader: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <div className={`p-4 flex flex-col gap-1.5 ${className}`}>{children}</div>
);
const CardTitle: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <h3 className={`font-extrabold text-white leading-none ${className}`}>{children}</h3>
);
const CardDescription: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <p className={`text-slate-500 leading-normal ${className}`}>{children}</p>
);
const CardContent: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <div className={`px-4 pb-4 ${className}`}>{children}</div>
);

export default PlacementReadinessView;
