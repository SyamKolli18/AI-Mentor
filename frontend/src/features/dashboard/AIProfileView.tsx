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
  Sparkles, Terminal, Brain, BarChart3, AlertCircle,
  TrendingUp, Calendar, BookOpen, Clock, Lightbulb, CheckCircle2
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
      
      // Update session auth state
      if (user) {
        updateUser({
          ...user,
          aiProfile: res.data.aiProfile
        });
      }
      toast('AI profile analysis generated successfully!', 'success');
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
    { key: 'programmingScore', altKey: 'programming', label: 'Programming Logic', color: 'text-violet-400' },
    { key: 'problemSolvingScore', altKey: 'problemSolving', label: 'Problem Solving', color: 'text-indigo-400' },
    { key: 'communicationScore', altKey: 'communication', label: 'Communication Confidence', color: 'text-blue-400' },
    { key: 'mathematicsReadiness', altKey: 'mathematics', label: 'Mathematics Readiness', color: 'text-purple-400' },
    { key: 'csFundamentals', altKey: 'programming', label: 'CS Fundamentals', color: 'text-pink-400' },
    { key: 'devReadiness', altKey: 'programming', label: 'Development Readiness', color: 'text-emerald-400' },
    { key: 'learningConsistency', altKey: 'consistency', label: 'Consistency Track', color: 'text-cyan-400' },
    { key: 'aiConfidenceScore', altKey: 'confidence', label: 'AI Confidence Match', color: 'text-amber-400' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          Advanced AI Cognitive Profile <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Intelligent evaluation of skills, timeline constraints, prerequisite validations, and career readiness.
        </p>
      </div>

      {!profile ? (
        <Card className="border-indigo-500/20 bg-indigo-500/5 text-center flex flex-col items-center gap-6 py-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-[40%] bg-glow-gradient opacity-35 blur-[50px] pointer-events-none" />
          <Brain className="h-12 w-12 text-primary animate-pulse" />
          <div className="max-w-md flex flex-col gap-2">
            <h3 className="text-xl font-bold text-white">Generate Cognitive Profile</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We compile your GPA courses, system specifications, daily time commitments, and experience nodes to evaluate your skill matrix scores.
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={handleAnalyze} 
            isLoading={isAnalyzing} 
            className="shadow-glow"
          >
            Compute AI Analytics
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Banner: Career Readiness Meter */}
          <Card className="lg:col-span-3 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border-indigo-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-accent/25 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-[10px] bg-accent/20 text-accent font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit">
                Intelligent Assessment Active
              </span>
              <h2 className="text-xl font-extrabold text-white">Career Readiness Score</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculated dynamically based on your programming, DSA, technical subject familiarity, and practical project builds. A score above 75% indicates standard placement viability.
              </p>
            </div>
            
            {/* Visual Readiness Progress Ring */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="relative h-24 w-24 flex items-center justify-center">
                <svg className="absolute transform -rotate-90 w-full h-full">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke="#8b5cf6" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (profile.scores.careerReadinessScore || 45)) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="text-lg font-black text-white">{profile.scores.careerReadinessScore || 45}%</span>
              </div>
              <div className="flex flex-col text-left gap-1">
                <span className="text-xs font-semibold text-slate-300">Technical Readiness: {profile.scores.technicalReadiness || 50}%</span>
                <span className="text-[10px] text-indigo-400">CS Fundamentals: {profile.scores.csFundamentals || 50}%</span>
                <span className="text-[10px] text-emerald-400">Dev Experience: {profile.scores.devReadiness || 40}%</span>
              </div>
            </div>
          </Card>

          {/* Left Column: Radar Competencies Graph */}
          <Card className="lg:col-span-2 bg-card/10 flex flex-col gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Cognitive Vector Map
              </CardTitle>
              <CardDescription className="text-xs">
                Visualizing normalized vectors matching technical logic, study habits, and communication constraints.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full flex items-center justify-center p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <defs>
                    <radialGradient id="radarGlowProfile" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.65}/>
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.15}/>
                    </radialGradient>
                  </defs>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#D1D5DB', fontSize: 9, fontWeight: '600' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 8 }} />
                  <Radar name="Student Score" dataKey="score" stroke="#6366F1" strokeWidth={2} fill="url(#radarGlowProfile)" fillOpacity={0.8} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Right Column: Key Scores Cards */}
          <Card className="bg-card/10 flex flex-col gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Terminal className="h-5 w-5 text-accent" /> Competency Metrics
              </CardTitle>
              <CardDescription className="text-xs">Individual vectors quantified out of 100.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {scoreLabels.map((item) => {
                const score = profile.scores[item.key] !== undefined ? profile.scores[item.key] : profile.scores[item.altKey];
                return (
                  <div key={item.key} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                      <span>{item.label}</span>
                      <span className={item.color}>{score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 bg-current ${item.color}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Timeline Estimate Card */}
          {profile.timelineEstimate && (
            <Card className="lg:col-span-3 bg-card/5 border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
              <div className="flex flex-col gap-1.5 border-r border-white/5 pr-4 justify-center">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Learning Pacing</span>
                </div>
                <h3 className="text-xl font-extrabold text-white">{profile.timelineEstimate.monthsRequired} Months</h3>
                <span className="text-[10px] text-slate-500">Estimated program duration</span>
              </div>

              <div className="flex flex-col gap-1.5 border-r border-white/5 pr-4 justify-center">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Clock className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Weekly Commitment</span>
                </div>
                <h3 className="text-xl font-extrabold text-white">{profile.timelineEstimate.weeklyEffortHours} Hours</h3>
                <span className="text-[10px] text-slate-500">{profile.timelineEstimate.dailyStudyHours} hours daily checkups</span>
              </div>

              <div className="flex flex-col gap-1.5 border-r border-white/5 pr-4 justify-center">
                <div className="flex items-center gap-2 text-amber-400">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Target Graduation</span>
                </div>
                <h3 className="text-sm font-extrabold text-white">
                  {new Date(profile.timelineEstimate.estimatedCompletionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <span className="text-[10px] text-slate-500">Estimated final assessment release</span>
              </div>

              <div className="flex flex-col gap-1.5 justify-center">
                <div className="flex items-center gap-2 text-violet-400">
                  <Lightbulb className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Mentors Checklist</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Allocate study blocks consistently. Set up a daily review streak to maintain cognitive retention rates.
                </p>
              </div>
            </Card>
          )}

          {/* Observations and Warnings (Part 1 Prerequisite checks) */}
          {profile.observations && profile.observations.length > 0 && (
            <Card className="lg:col-span-3 bg-red-950/10 border-red-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-full w-[25%] bg-red-500/5 blur-[50px] pointer-events-none" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-extrabold text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Prerequisite Warnings & Sequence Alerts
                </CardTitle>
                <CardDescription className="text-[10px]">
                  AI observations mapping critical knowledge gaps that will create learning bottlenecks.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {profile.observations.map((obs: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start bg-slate-950/40 border border-white/5 rounded-lg p-3 text-xs text-slate-300">
                    <span className="shrink-0 text-red-500 font-bold">●</span>
                    <span>{obs}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Study Recommendations & Improvement Suggestions */}
          <Card className="lg:col-span-3 bg-card/5 grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen className="h-4 w-4 text-primary" /> Core Study Plan Recommendations
              </h3>
              <ul className="flex flex-col gap-3">
                {profile.studyRecommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                )) || (
                  <li className="text-xs text-slate-500 italic">No recommendations compiled yet.</li>
                )}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Lightbulb className="h-4 w-4 text-accent" /> Areas of Immediate Improvement
              </h3>
              <ul className="flex flex-col gap-3">
                {profile.improvementSuggestions?.map((sug: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </li>
                )) || (
                  <li className="text-xs text-slate-500 italic">No suggestions calculated.</li>
                )}
              </ul>
            </div>
          </Card>

          {/* AI Insights Card (Full Width bottom row) */}
          <Card className="lg:col-span-3 bg-card/5 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-full w-[35%] bg-glow-gradient opacity-20 blur-[50px] pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" /> Personal Qualitative Feedback
              </CardTitle>
              <CardDescription className="text-xs">
                Feedback regarding system specs, studying templates, and pace suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex gap-3 bg-slate-900/40 border border-white/5 rounded-xl p-4 text-xs text-slate-300 leading-relaxed text-left align-top">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Regeneration option */}
          <div className="lg:col-span-3 flex justify-between items-center bg-slate-950/20 p-4 border border-white/5 rounded-xl">
            <span className="text-xs text-slate-400 italic">
              💡 Update your Onboarding Wizard preferences at any time to calculate new stats.
            </span>
            <Button 
              variant="glass" 
              onClick={handleAnalyze} 
              isLoading={isAnalyzing}
              className="text-xs"
            >
              Re-Calculate Profile Metrics
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIProfileView;
