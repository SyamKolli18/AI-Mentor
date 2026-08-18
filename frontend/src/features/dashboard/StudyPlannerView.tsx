import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Sparkles, Calendar, Clock, CheckCircle2, Circle, AlertCircle, Plus, Flame, Play, Square, RotateCcw
} from 'lucide-react';

export const StudyPlannerView: React.FC = () => {
  const { toast } = useToast();
  const [planner, setPlanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);

  // Task creation fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Roadmap' | 'Practice' | 'General'>('General');
  const [duration, setDuration] = useState<number>(30);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('');

  // Pomodoro Focus variables
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<any>(null);

  const fetchPlanner = async () => {
    try {
      setLoading(true);
      const res = await api.get('/planner/tasks');
      if (res.data.status === 'success') {
        setPlanner(res.data.planner);
      }
    } catch (err: any) {
      toast('Failed to load study calendar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner();
    // Default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        setPomodoroSeconds(s => {
          if (s === 0) {
            setPomodoroMinutes(m => {
              if (m === 0) {
                // Focus complete!
                handleCompleteFocusSession();
                clearInterval(interval);
                setIsTimerRunning(false);
                return 25;
              }
              return m - 1;
            });
            return 59;
          }
          return s - 1;
        });
      }, 1000);
      setTimerIntervalId(interval);
      return () => clearInterval(interval);
    } else {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    }
  }, [isTimerRunning]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      toast('Task title and due date are required.', 'error');
      return;
    }

    try {
      setAddingTask(true);
      const res = await api.post('/planner/tasks', {
        title,
        category,
        duration,
        priority,
        dueDate
      });
      if (res.data.status === 'success') {
        toast('Custom task scheduled successfully!', 'success');
        setPlanner(res.data.planner);
        setTitle('');
        setCategory('General');
        setDuration(30);
        setPriority('Medium');
      }
    } catch (err: any) {
      toast('Failed to create task.', 'error');
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const res = await api.put(`/planner/tasks/${id}`, { status: nextStatus });
      if (res.data.status === 'success') {
        setPlanner(res.data.planner);
        toast(nextStatus === 'completed' ? 'Task checked off! Study minutes logged.' : 'Task reverted to pending.', 'success');
      }
    } catch (err: any) {
      toast('Failed to check task.', 'error');
    }
  };

  const handleAdaptiveRecovery = async (id: string) => {
    try {
      // Toggle adaptive recovery flag -> Reschedules task to tomorrow
      const res = await api.put(`/planner/tasks/${id}`, { adaptiveRecoveryActive: true });
      if (res.data.status === 'success') {
        setPlanner(res.data.planner);
        toast('Adaptive scheduler activated. Task rescheduled to tomorrow!', 'success');
      }
    } catch (err: any) {
      toast('Failed to trigger recovery.', 'error');
    }
  };

  const handleToggleHabit = async (habitName: string) => {
    try {
      const res = await api.post('/planner/habits', { habitName });
      if (res.data.status === 'success') {
        setPlanner(res.data.planner);
        toast(`Habit status toggled. Streak score: ${res.data.habit.streak}`, 'success');
      }
    } catch (err: any) {
      toast('Failed to update habit.', 'error');
    }
  };

  const handleCompleteFocusSession = async () => {
    try {
      const minutesLog = planner?.focusConfig?.pomodoroDuration || 25;
      const res = await api.post('/planner/focus', { minutes: minutesLog });
      if (res.data.status === 'success') {
        setPlanner(res.data.planner);
        toast(`Pomodoro complete! Solved study period: ${minutesLog} mins logged in dashboard.`, 'success');
        setPomodoroMinutes(25);
        setPomodoroSeconds(0);
      }
    } catch (err: any) {
      toast('Failed to log study statistics.', 'error');
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setPomodoroMinutes(25);
    setPomodoroSeconds(0);
  };

  const getPriorityColor = (prio: string) => {
    if (prio === 'High') return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
    if (prio === 'Medium') return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
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

  const tasks = planner?.tasks || [];
  const habits = planner?.habits || [];
  const focusConfig = planner?.focusConfig || { pomodoroDuration: 25, completedSessions: 0, focusStudyMinutes: 0 };

  // Calculate missed tasks counts (pending tasks where dueDate is before today)
  const today = new Date();
  today.setHours(0,0,0,0);
  const missedTasks = tasks.filter((t: any) => t.status === 'pending' && new Date(t.dueDate) < today);
  const activeTasks = tasks.filter((t: any) => t.status !== 'completed' && new Date(t.dueDate) >= today);
  const completedTasks = tasks.filter((t: any) => t.status === 'completed');

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          AI Study Planner & Coach <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Smart calendar allocations, Pomodoro focus configurations, and adaptive scheduler mechanics to retrieve missed task overdues.
        </p>
      </div>

      {/* Main Grid: Planner items & timers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Planner Left: Tasks and Custom Add form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Overdue/Missed Tasks warning (Adaptive Scheduler active) */}
          {missedTasks.length > 0 && (
            <Card className="border-rose-500/20 bg-rose-950/20 p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-full w-[20%] bg-glow-gradient opacity-10 blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertCircle className="h-4.5 w-4.5" /> Overdue Tasks Detected ({missedTasks.length})
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adaptive scheduler tracks overdue items. Trigger recovery to move target dates to tomorrow.
              </p>
              <div className="flex flex-col gap-2">
                {missedTasks.map((t: any) => (
                  <div key={t._id} className="flex justify-between items-center bg-[#070514]/40 border border-white/5 rounded-lg p-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-slate-200 line-through decoration-rose-500/50">{t.title}</span>
                      <span className="text-[9px] text-rose-400">Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleAdaptiveRecovery(t._id)}
                      className="text-[9px] h-7 px-2.5 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      leftIcon={<RotateCcw className="h-3 w-3" />}
                    >
                      Reschedule
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Active Tasks Deck */}
          <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Calendar className="h-4.5 w-4.5 text-primary" /> Calibrated Study Calendar
            </h3>
            
            {activeTasks.length === 0 ? (
              <div className="text-center py-6 text-slate-500 italic text-xs">No active study items scheduled. Add a task below to coordinate.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeTasks.map((t: any) => (
                  <div 
                    key={t._id} 
                    className="flex justify-between items-center bg-[#070514]/40 border border-white/5 rounded-lg p-3 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleToggleTask(t._id, t.status)}
                        className="text-slate-500 hover:text-white cursor-pointer"
                      >
                        <Circle className="h-4.5 w-4.5 text-slate-400" />
                      </button>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white">{t.title}</span>
                        <div className="flex gap-2 items-center mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getPriorityColor(t.priority)}`}>
                            {t.priority}
                          </span>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-white/5">
                            {t.category}
                          </span>
                          <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {t.duration} mins
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500">
                      Due {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Task section */}
            {completedTasks.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Checklist Logs</span>
                <div className="flex flex-col gap-2">
                  {completedTasks.map((t: any) => (
                    <div 
                      key={t._id} 
                      className="flex justify-between items-center bg-[#070514]/20 border border-white/5 rounded-lg p-2.5 opacity-55"
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleToggleTask(t._id, t.status)}
                          className="text-emerald-400 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        </button>
                        <span className="text-xs font-bold text-slate-400 line-through">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{t.duration}m logged</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Add custom Task form */}
          <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4">
            <h3 className="font-extrabold text-white text-xs block uppercase tracking-wider">Schedule Custom task</h3>
            
            <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Task Description"
                  placeholder="e.g. Solve dynamic programming arrays challenges"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">Target Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950/40 border border-white/5 text-foreground rounded-lg h-10 px-3 text-xs focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10"
                >
                  <option value="General">General Study</option>
                  <option value="Practice">Coding Practice</option>
                  <option value="Roadmap">Roadmap Milestone</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">Priority Score</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-950/40 border border-white/5 text-foreground rounded-lg h-10 px-3 text-xs focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <Input
                  label="Allotted Duration (Minutes)"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <Input
                  label="Schedule Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2 mt-2">
                <Button
                  variant="outline"
                  type="submit"
                  isLoading={addingTask}
                  className="w-full h-10 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 cursor-pointer"
                  rightIcon={<Plus className="h-4 w-4" />}
                >
                  Schedule study target
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Planner Right: Pomodoro timer & habits tracker */}
        <div className="flex flex-col gap-6">
          
          {/* Pomodoro Timer focus session widget */}
          <Card className="bg-gradient-to-br from-[#0c0823]/60 via-slate-950/40 to-slate-900/60 border-indigo-500/10 p-6 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-full w-[30%] bg-glow-gradient opacity-10 blur-2xl pointer-events-none" />
            <h3 className="font-extrabold text-white text-xs block uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-accent animate-pulse" /> Focus Pomodoro
            </h3>

            {/* Big digit countdown display */}
            <div className="h-32 w-32 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center gap-0.5 shrink-0 bg-slate-950/40 shadow-glow shadow-indigo-500/5">
              <span className="text-3xl font-black text-white font-mono">
                {pomodoroMinutes}:{pomodoroSeconds < 10 ? '0' : ''}{pomodoroSeconds}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Session timer</span>
            </div>

            {/* Timer Actions */}
            <div className="flex gap-3 w-full justify-center">
              <Button
                variant={isTimerRunning ? 'outline' : 'primary'}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-xs h-9 px-4 cursor-pointer"
                leftIcon={isTimerRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              >
                {isTimerRunning ? 'Pause' : 'Start Focus'}
              </Button>
              <Button
                variant="ghost"
                onClick={handleResetTimer}
                className="text-xs h-9 px-3 border border-white/5 cursor-pointer text-slate-400 hover:text-white"
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Reset
              </Button>
            </div>

            {/* Focus stats metrics */}
            <div className="w-full border-t border-white/5 pt-4 grid grid-cols-2 gap-3 text-center text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Sessions Solved</span>
                <span className="font-black text-white">{focusConfig.completedSessions}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Focus Study Mins</span>
                <span className="font-black text-white">{focusConfig.focusStudyMinutes}m</span>
              </div>
            </div>
          </Card>

          {/* Active Habits list with flame indicators */}
          <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4">
            <h3 className="font-extrabold text-white text-xs block uppercase tracking-wider">Productivity Habits checklist</h3>
            <div className="flex flex-col gap-3">
              {habits.map((h: any, index: number) => {
                // Check if completed today
                const isCompletedToday = h.completedDates?.some((d: string) => {
                  const comp = new Date(d);
                  comp.setHours(0,0,0,0);
                  const td = new Date();
                  td.setHours(0,0,0,0);
                  return comp.getTime() === td.getTime();
                });

                return (
                  <div 
                    key={index}
                    className="flex justify-between items-center bg-[#070514]/40 border border-white/5 rounded-lg p-3 hover:border-primary/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleToggleHabit(h.name)}
                        className={`cursor-pointer transition-colors ${isCompletedToday ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
                      >
                        {isCompletedToday ? (
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        ) : (
                          <Circle className="h-4.5 w-4.5" />
                        )}
                      </button>
                      <span className={`text-xs font-bold ${isCompletedToday ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {h.name}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-black text-amber-500 shrink-0">
                      <Flame className="h-4 w-4 animate-pulse fill-amber-500/20" /> {h.streak}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
export default StudyPlannerView;
