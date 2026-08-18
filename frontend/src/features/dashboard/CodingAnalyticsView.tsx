import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { 
  Sparkles, Flame, Trophy, Code, Plus, 
  HelpCircle, Calendar
} from 'lucide-react';

export const CodingAnalyticsView: React.FC = () => {
  const { toast } = useToast();
  const [coding, setCoding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingProblem, setLoggingProblem] = useState(false);

  // Solved logger fields
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [topicName, setTopicName] = useState('');
  const [count, setCount] = useState<number>(1);

  const fetchCoding = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coding/analytics');
      if (res.data.status === 'success') {
        setCoding(res.data.coding);
      }
    } catch (err: any) {
      toast('Failed to load coding statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoding();
  }, []);

  const handleLogSolved = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName) {
      toast('Please enter a topic name.', 'error');
      return;
    }

    try {
      setLoggingProblem(true);
      const res = await api.post('/coding/sync', {
        difficulty,
        topicName,
        count
      });
      if (res.data.status === 'success') {
        toast(`Logged ${count} solved problems! Streak updated.`, 'success');
        setCoding(res.data.coding);
        setTopicName('');
        setCount(1);
      }
    } catch (err: any) {
      toast('Failed to log problem.', 'error');
    } finally {
      setLoggingProblem(false);
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

  if (!coding) {
    return (
      <div className="flex flex-col gap-6 text-left">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Coding practice Analytics</h1>
        </div>
        <Card className="border-indigo-500/20 bg-indigo-500/5 text-center flex flex-col items-center gap-6 py-12">
          <HelpCircle className="h-10 w-10 text-slate-500 animate-pulse" />
          <div>
            <h3 className="text-lg font-bold text-white">No Statistics Found</h3>
            <p className="text-xs text-slate-400">Initialize profile parameters to compute streaks.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Format data for Recharts
  const masteryData = coding.topicMastery?.map((t: any) => ({
    Topic: t.topicName,
    Solved: t.questionsCount,
    Strength: t.strengthIndex
  })) || [];

  const totalSolved = coding.solvedEasy + coding.solvedMedium + coding.solvedHard;

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          Coding Practice & Learning Analytics <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Monitor Easy/Medium/Hard problem splits, topic mastery metrics, practice streaks, and competitive ratings history.
        </p>
      </div>

      {/* Overview Stat Counters Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Streak Flame */}
        <Card className="bg-gradient-to-br from-amber-600/10 to-slate-900/40 border-amber-500/20 p-6 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 h-16 w-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <Flame className="h-12 w-12 text-amber-500 animate-pulse fill-amber-500/10" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-slate-500 uppercase font-bold">Coding Streak</span>
            <span className="text-2xl font-black text-white">{coding.streakCount} Days</span>
          </div>
        </Card>

        {/* Easy solved */}
        <Card className="bg-[#111827]/40 border-white/5 p-6 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold">
            <span>Easy Solved</span>
            <span className="text-emerald-400 font-bold">{coding.solvedEasy}</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(coding.solvedEasy / (totalSolved || 1)) * 100}%` }} />
          </div>
        </Card>

        {/* Medium solved */}
        <Card className="bg-[#111827]/40 border-white/5 p-6 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold">
            <span>Medium Solved</span>
            <span className="text-indigo-400 font-bold">{coding.solvedMedium}</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(coding.solvedMedium / (totalSolved || 1)) * 100}%` }} />
          </div>
        </Card>

        {/* Hard solved */}
        <Card className="bg-[#111827]/40 border-white/5 p-6 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold">
            <span>Hard Solved</span>
            <span className="text-rose-400 font-bold">{coding.solvedHard}</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(coding.solvedHard / (totalSolved || 1)) * 100}%` }} />
          </div>
        </Card>

      </div>

      {/* Recharts visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Topic mastery chart */}
        <Card className="lg:col-span-2 bg-card/10 flex flex-col gap-4">
          <div className="p-4 border-b border-white/5 pb-2">
            <h3 className="font-extrabold text-white text-xs block uppercase tracking-wider flex items-center gap-1.5">
              <Code className="h-4.5 w-4.5 text-primary" /> Topic Solved Count & Strength Index
            </h3>
          </div>
          <div className="h-[280px] w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGlowSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="barGlowStrength" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="Topic" stroke="#9CA3AF" fontSize={7.5} fontWeight="600" />
                <YAxis stroke="#9CA3AF" fontSize={9} fontWeight="600" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151B2D', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}
                  itemStyle={{ fontSize: 10 }}
                />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Bar name="Solved Count" dataKey="Solved" fill="url(#barGlowSolved)" radius={[4, 4, 0, 0]} />
                <Bar name="Strength Index" dataKey="Strength" fill="url(#barGlowStrength)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Solved Sync logger form */}
        <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4">
          <h3 className="font-extrabold text-white text-xs block uppercase tracking-wider">Sync practice logs</h3>
          
          <form onSubmit={handleLogSolved} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Difficulty Grade</label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl as any)}
                    className={`text-xs font-bold p-2.5 rounded-lg border cursor-pointer text-center transition-colors ${
                      difficulty === lvl 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-white/5 bg-white/2 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <Input 
              label="Topic Name / Area"
              placeholder="e.g. Dynamic Programming, SQL queries, Graphs"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              required
            />

            <Input 
              label="Problems Log Count"
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              required
            />

            <Button
              variant="outline"
              type="submit"
              isLoading={loggingProblem}
              className="mt-2 h-10 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 cursor-pointer"
              rightIcon={<Plus className="h-4 w-4" />}
            >
              Sync solved entries
            </Button>
          </form>
        </Card>

      </div>

      {/* Activity heatmap simulated card and contest history list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Contest history rating records */}
        <Card className="lg:col-span-1 border-white/5 bg-card/10 p-6 flex flex-col gap-4 text-xs text-slate-300">
          <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Trophy className="h-4.5 w-4.5 text-amber-500" /> Contest history rating
          </h4>
          <div className="flex justify-between items-center bg-[#070514]/40 border border-white/5 rounded-lg p-3">
            <span className="font-bold text-slate-400">Current Rating:</span>
            <span className="text-lg font-black text-amber-400 font-mono">{coding.contestRating || 1500}</span>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed contests</span>
            {coding.contestHistory?.map((c: any, index: number) => (
              <div key={index} className="flex justify-between items-center bg-white/2 border border-white/5 rounded p-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-200">{c.contestName}</span>
                  <span className="text-[9px] text-slate-500">Rank: #{c.rank}</span>
                </div>
                <span className="font-bold text-primary font-mono">{c.rating} pts</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Heatmap logs grid */}
        <Card className="lg:col-span-2 border-white/5 bg-card/10 p-6 flex flex-col gap-4">
          <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Calendar className="h-4.5 w-4.5 text-accent" /> Coding activity heatmap
          </h4>
          
          {/* Custom Heatmap Grid simulated */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 28 }).map((_, i) => {
                // Modulate colors based on simulated indices
                const levels = ['bg-slate-900 border-white/2', 'bg-violet-900/35 border-violet-500/10', 'bg-violet-700/50 border-violet-500/20', 'bg-violet-500 border-violet-500/30'];
                const lvlIdx = i % 4; // dummy
                return (
                  <div 
                    key={i} 
                    className={`h-4.5 w-4.5 rounded border transition-colors hover:scale-105 duration-200 cursor-pointer ${levels[lvlIdx]}`} 
                    title={`${lvlIdx * 2} problems solved`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded bg-slate-900 border border-white/2" />
                <div className="h-3 w-3 rounded bg-violet-900/35 border border-violet-500/10" />
                <div className="h-3 w-3 rounded bg-violet-700/50 border border-violet-500/20" />
                <div className="h-3 w-3 rounded bg-violet-500 border border-violet-500/30" />
              </div>
              <span>More</span>
            </div>
          </div>
        </Card>

      </div>

    </div>
  );
};
export default CodingAnalyticsView;
