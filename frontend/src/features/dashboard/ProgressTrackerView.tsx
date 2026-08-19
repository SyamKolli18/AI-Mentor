import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { 
  LineChart, Flame, CheckCircle2, Award, 
  TrendingUp, RefreshCw
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

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A2720] pb-5">
        <div>
          <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Learning & Progress Tracking
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-50 md:text-3xl mt-1 flex items-center gap-2">
            Progress Analytics <LineChart className="h-6 w-6 text-orange-400 animate-pulse" />
          </h1>
          <p className="text-xs text-stone-300">
            Real-time tracking of completed roadmap topics, study streaks, and adaptive mentor feedback.
          </p>
        </div>

        <Button variant="glass" size="sm" onClick={fetchStats} isLoading={loading} className="text-xs border-[#3A2720] text-stone-300 hover:text-white">
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh Metrics
        </Button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Streak Card */}
          <Card className="bg-[#18120F] border-[#3A2720] p-6 flex flex-col justify-between gap-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Active Study Streak</span>
                <h3 className="text-2xl font-black text-stone-50 mt-1 flex items-center gap-2">
                  {stats?.stats?.streakCount || 1} Days <Flame className="h-6 w-6 text-orange-500 fill-orange-500 animate-pulse" />
                </h3>
              </div>
            </div>
            <p className="text-xs text-stone-300">Maintain daily learning sessions to keep your cognitive retention rate high.</p>
          </Card>

          {/* Hours Card */}
          <Card className="bg-[#18120F] border-[#3A2720] p-6 flex flex-col justify-between gap-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Study Time</span>
                <h3 className="text-2xl font-black text-stone-50 mt-1 flex items-center gap-2">
                  {stats?.stats?.totalStudyHours || 2.5} Hours <TrendingUp className="h-6 w-6 text-emerald-400" />
                </h3>
              </div>
            </div>
            <p className="text-xs text-stone-300">Calculated from completed lessons, practice quizzes, and interactive AI tutoring sessions.</p>
          </Card>

          {/* Career Readiness Meter */}
          <Card className="bg-[#18120F] border-[#3A2720] p-6 flex flex-col justify-between gap-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Career Readiness</span>
                <h3 className="text-2xl font-black text-stone-50 mt-1 flex items-center gap-2">
                  {stats?.careerReadiness || 45}% <Award className="h-6 w-6 text-amber-400" />
                </h3>
              </div>
            </div>
            <p className="text-xs text-stone-300">Overall match readiness score updated dynamically as you finish roadmap modules.</p>
          </Card>

          {/* Module Completion Summary */}
          <Card className="md:col-span-3 bg-[#18120F] border-[#3A2720] p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-stone-50 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Module Completion Overview
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0C0A09] p-4 rounded-xl border border-[#3A2720] flex justify-between items-center">
                <span className="text-xs text-stone-300 font-semibold">Completed Modules:</span>
                <span className="text-lg font-extrabold text-emerald-400">{stats?.modules?.completed || 0}</span>
              </div>
              <div className="bg-[#0C0A09] p-4 rounded-xl border border-[#3A2720] flex justify-between items-center">
                <span className="text-xs text-stone-300 font-semibold">Remaining Roadmap Modules:</span>
                <span className="text-lg font-extrabold text-orange-400">{stats?.modules?.remaining || 3}</span>
              </div>
            </div>
          </Card>

        </div>
      )}
    </div>
  );
};
export default ProgressTrackerView;
