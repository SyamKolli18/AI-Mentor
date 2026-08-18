import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  Flame, Target, BookOpen, Clock, Settings, Save, CheckCircle 
} from 'lucide-react';

export const WeeklyGoalsTracker: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [goal, setGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [goalHours, setGoalHours] = useState(10);
  const [targetLessons, setTargetLessons] = useState(5);
  const [saving, setSaving] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/dashboard-stats');
      if (res.data.status === 'success') {
        setStats(res.data.stats);
        setGoal(res.data.goal);
        if (res.data.goal) {
          setGoalHours(res.data.goal.goalHours);
          setTargetLessons(res.data.goal.targetLessons);
        }
      }
    } catch (err: any) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSaveGoal = async () => {
    try {
      setSaving(true);
      const res = await api.post('/ai/weekly-goal', {
        goalHours,
        targetLessons
      });
      if (res.data.status === 'success') {
        setGoal(res.data.goal);
        setIsEditing(false);
        toast('Weekly study goals updated successfully!', 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to save goals', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-24 bg-white/5 rounded-xl" />
        <div className="h-[250px] bg-white/5 rounded-xl" />
      </div>
    );
  }

  // Map daily logs to graph coordinates
  const chartData = stats?.dailyLogs?.map((log: any) => ({
    date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Minutes: log.minutes
  })) || [];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Top row: Streak and Goals stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak card */}
        <Card className="bg-gradient-to-br from-amber-950/20 to-orange-950/20 border-amber-500/20 p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 text-amber-500/10 pointer-events-none">
            <Flame className="h-28 w-28 translate-x-6 translate-y-6" />
          </div>
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Active Study Streak</span>
            <h3 className="text-3xl font-black text-white flex items-center gap-1.5">
              {stats?.streakCount || 0} Days <Flame className="h-7 w-7 text-amber-500 animate-bounce" />
            </h3>
            <span className="text-[10px] text-slate-400">Log minutes daily to grow your streak!</span>
          </div>
        </Card>

        {/* Goals Progress Card */}
        <Card className="md:col-span-2 bg-slate-900/40 border-white/5 p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold text-slate-300">Weekly Target Metrics</span>
            </div>
            
            <Button 
              variant="glass" 
              onClick={() => setIsEditing(!isEditing)}
              className="px-2 py-1 text-[10px] flex items-center gap-1.5 h-7"
            >
              <Settings className="h-3.5 w-3.5" />
              {isEditing ? 'Cancel' : 'Adjust Goals'}
            </Button>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Hours ({goalHours} hrs)</label>
                  <input 
                    type="range" 
                    min="2" 
                    max="40" 
                    value={goalHours} 
                    onChange={(e) => setGoalHours(Number(e.target.value))}
                    className="w-full accent-primary bg-white/10 rounded-lg cursor-pointer h-2"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Lessons ({targetLessons})</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={targetLessons} 
                    onChange={(e) => setTargetLessons(Number(e.target.value))}
                    className="w-full accent-primary bg-white/10 rounded-lg cursor-pointer h-2"
                  />
                </div>
              </div>
              <Button 
                variant="primary" 
                onClick={handleSaveGoal} 
                isLoading={saving}
                className="w-fit flex items-center gap-1.5 py-1 text-xs px-3 self-end"
              >
                <Save className="h-3.5 w-3.5" /> Save Goals
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hours Completed indicator */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> Study Time</span>
                  <span className="font-bold text-white">{goal?.completedHours || 0} / {goal?.goalHours || 10} hrs</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, ((goal?.completedHours || 0) / (goal?.goalHours || 10)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Lessons indicator */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5 text-slate-400" /> Lessons Solved</span>
                  <span className="font-bold text-white">{goal?.completedLessonsCount || 0} / {goal?.targetLessons || 5}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, ((goal?.completedLessonsCount || 0) / (goal?.targetLessons || 5)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {goal?.status === 'completed' && (
            <div className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2 text-xs text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span>Congratulations! You completed your weekly target goals! Keep scaling!</span>
            </div>
          )}
        </Card>

      </div>

      {/* Daily study duration chart */}
      <Card className="bg-card/10 flex flex-col gap-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-bold">Learning Progress Timeline</CardTitle>
          <CardDescription className="text-xs">Daily study minutes compiled over the active streak.</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] w-full p-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={9} fontWeight="600" />
                <YAxis stroke="#9CA3AF" fontSize={9} fontWeight="600" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151B2D', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}
                  itemStyle={{ fontSize: 11 }}
                />
                <Area type="monotone" dataKey="Minutes" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorMinutes)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
              No daily logs recorded yet. Begin checking off lessons to build your analytics graph!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default WeeklyGoalsTracker;
