import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { 
  LineChart, Flame, Award, 
  TrendingUp, RefreshCw, Calendar, Clock
} from 'lucide-react';

export const ProgressTrackerView: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/dashboard-stats');
      if (res.data.status === 'success') {
        setStats(res.data);
      }
    } catch (err: any) {
      toast('Failed to load progress analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const weeklyTimeline = [
    { week: 'Week 1', title: 'Onboarding & Core Foundations', skills: ['Python', 'SQL', 'Git Basics'], time: '14 Hours', confidence: '+15%', done: true },
    { week: 'Week 2', title: 'Data Structures & Algorithms', skills: ['Arrays', 'Trees', 'Recursion'], time: '16 Hours', confidence: '+25%', done: true },
    { week: 'Week 3', title: 'Full-Stack API Architecture', skills: ['REST APIs', 'Node.js', 'PostgreSQL'], time: '18 Hours', confidence: '+35%', done: false },
    { week: 'Week 4', title: 'System Design & Placement Prep', skills: ['Caching', 'Load Balancers', 'Mock Interviews'], time: '20 Hours', confidence: '+45%', done: false }
  ];

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold mb-2">
            <LineChart className="h-3.5 w-3.5" /> STUDENT GROWTH TIMELINE
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl flex items-center gap-2">
            Learning Progress & Growth Timeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track weekly skill milestones, study hours, and confidence trajectory.
          </p>
        </div>

        <Button variant="glass" size="sm" onClick={fetchStats} isLoading={loading} className="text-xs border-[#27272A]">
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh Metrics
        </Button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="h-10 w-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* TOP METRICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col justify-between gap-4 shadow-glass">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">STREAK SCORE</span>
                  <h3 className="text-3xl font-black text-white mt-1 flex items-center gap-2 font-mono">
                    {stats?.stats?.streakCount || 7} Days <Flame className="h-6 w-6 text-rose-500 fill-rose-500 animate-pulse" />
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-400">Consistent daily study sessions logged by AI Mentor.</p>
            </Card>

            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col justify-between gap-4 shadow-glass">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">TOTAL STUDY TIME</span>
                  <h3 className="text-3xl font-black text-white mt-1 flex items-center gap-2 font-mono">
                    {stats?.stats?.totalStudyHours || 32} Hours <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-400">Calculated from completed lessons, quizzes, and interactive practice.</p>
            </Card>

            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col justify-between gap-4 shadow-glass">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">CAREER READINESS</span>
                  <h3 className="text-3xl font-black text-rose-400 mt-1 flex items-center gap-2 font-mono">
                    {stats?.careerReadiness || 78}% <Award className="h-6 w-6 text-rose-500" />
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-400">Match readiness score updated dynamically as you finish modules.</p>
            </Card>
          </div>

          {/* STUDENT GROWTH TIMELINE VISUALIZATION (WEEK 1 .. WEEK 4) */}
          <Card className="bg-[#111111] border-[#27272A] p-6 md:p-8 flex flex-col gap-6 shadow-glass">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-rose-500" />
                <h3 className="text-lg font-black text-white">Student Growth Timeline</h3>
              </div>
              <span className="text-xs text-rose-400 font-mono font-bold">4-WEEK SPRINT VIEW</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {weeklyTimeline.map((item, idx) => (
                <div key={item.week} className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
                  item.done 
                    ? 'border-emerald-500/40 bg-emerald-500/10' 
                    : idx === 2 
                      ? 'border-rose-500/60 bg-rose-500/15 shadow-crimson-glow' 
                      : 'border-[#27272A] bg-[#171717]'
                }`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-extrabold text-rose-400">{item.week}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        item.done ? 'bg-emerald-500/20 text-emerald-400' : idx === 2 ? 'bg-rose-500/20 text-rose-400' : 'bg-[#050505] text-slate-500'
                      }`}>
                        {item.done ? '✓ COMPLETED' : idx === 2 ? '● CURRENT' : 'UPCOMING'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.skills.map((sk) => (
                        <span key={sk} className="text-[9px] bg-[#050505] border border-[#27272A] text-slate-300 px-2 py-0.5 rounded font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono border-t border-[#27272A] pt-3 text-slate-300">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> {item.time}</span>
                    <span className="text-emerald-400 font-bold">{item.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}
    </div>
  );
};
export default ProgressTrackerView;
