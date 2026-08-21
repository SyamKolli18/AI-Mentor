import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Sparkles, BookOpen, Lock, 
  Unlock, Play, CheckCircle, RefreshCw, 
  ArrowUp, ArrowDown
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'kanban' | 'progress'>('timeline');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchRoadmapData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/roadmap');
      if (res.data.status === 'success' && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err: any) {
      console.error('Failed to load roadmap details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  const handleToggleLesson = async (moduleId: string, topicIndex: number, lessonIndex: number, currentVal: boolean) => {
    if (!roadmap) return;
    try {
      setIsUpdating(true);
      const res = await api.post('/ai/roadmap/complete-lesson', {
        roadmapId: roadmap._id,
        moduleId,
        topicIndex,
        lessonIndex,
        isCompleted: !currentVal
      });
      if (res.data.status === 'success') {
        setRoadmap(res.data.roadmap);
        toast(`Lesson marked as ${!currentVal ? 'completed' : 'incomplete'}!`, 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to toggle lesson', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveOrder = async (moduleId: string, direction: 'up' | 'down') => {
    if (!roadmap) return;
    const currentIdx = roadmap.modules.findIndex((m: any) => m.id === moduleId);
    if (currentIdx === -1) return;

    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= roadmap.modules.length) return;

    try {
      setIsUpdating(true);
      const updatedModules = [...roadmap.modules];
      const temp = updatedModules[currentIdx].order;
      updatedModules[currentIdx].order = updatedModules[targetIdx].order;
      updatedModules[targetIdx].order = temp;

      const orderPayload = updatedModules.map(m => ({ id: m.id, order: m.order }));
      await api.post('/ai/roadmap/reorder', { moduleOrders: orderPayload });
      toast('Modules sequence adjusted.', 'success');
      fetchRoadmapData();
    } catch (err: any) {
      toast('Failed to reorder modules', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerating will compile a new syllabus version. Proceed?')) return;
    try {
      setIsUpdating(true);
      const res = await api.post('/ai/generate-roadmap', { targetCareer: roadmap.targetCareer });
      setRoadmap(res.data.roadmap);
      toast('AI generated a new adaptive roadmap track!', 'success');
      fetchRoadmapData();
    } catch (err: any) {
      toast('Regeneration failed.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getProgressStats = () => {
    if (!roadmap) return { percent: 0, completed: 0, total: 0 };
    let totalLessons = 0;
    let completedLessons = 0;

    roadmap.modules.forEach((m: any) => {
      m.topics.forEach((t: any) => {
        t.lessons.forEach((l: any) => {
          totalLessons++;
          if (l.isCompleted || m.status === 'completed') {
            completedLessons++;
          }
        });
      });
    });

    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { percent, completed: completedLessons, total: totalLessons };
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col gap-6 text-left font-sans">
        <div className="border-b border-[#27272A] pb-5">
          <h1 className="text-3xl font-black tracking-tight text-white">Visual Career Journey</h1>
          <p className="text-xs text-slate-400">Generate your personalized milestone roadmap.</p>
        </div>
        <Card className="border-rose-500/40 bg-[#111111] text-center flex flex-col items-center gap-6 py-12 shadow-crimson-glow">
          <BookOpen className="h-12 w-12 text-rose-500 animate-pulse" />
          <div className="max-w-md flex flex-col gap-2">
            <h3 className="text-xl font-extrabold text-white">No Active Roadmap Found</h3>
            <p className="text-xs text-slate-400">Select a career pathway to compile your custom milestone roadmap.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/career')} className="bg-rose-600 hover:bg-rose-500 shadow-glow">
            Generate Career Track
          </Button>
        </Card>
      </div>
    );
  }

  const stats = getProgressStats();
  const sortedModules = [...roadmap.modules].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 text-left relative font-sans">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
            SYLLABUS VERSION {roadmap.version}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl mt-1.5 flex items-center gap-2">
            {roadmap.targetCareer} Journey <Sparkles className="h-6 w-6 text-rose-500 animate-pulse" />
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="glass" 
            size="sm" 
            isLoading={isUpdating}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={handleRegenerate}
            className="text-xs border-[#27272A]"
          >
            Regenerate AI Path
          </Button>
        </div>
      </div>

      {/* VISUAL MILESTONE STAGE OVERVIEW (FOUNDATION -> CORE -> PROJECTS -> ADVANCED -> CAREER READY) */}
      <div className="p-6 rounded-2xl border border-[#27272A] bg-[#111111] flex flex-col gap-4 shadow-glass">
        <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400 border-b border-[#27272A] pb-3">
          <span>CAREER PATH JOURNEY PIPELINE</span>
          <span className="text-rose-400">{stats.percent}% COMPLETED ({stats.completed}/{stats.total} LESSONS)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {['FOUNDATION', 'CORE SKILLS', 'PROJECTS', 'ADVANCED', 'CAREER READY'].map((stage, idx) => {
            const isDone = stats.percent >= ((idx + 1) * 20);
            const isCurrent = stats.percent >= (idx * 20) && stats.percent < ((idx + 1) * 20);
            return (
              <div key={stage} className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                isDone 
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' 
                  : isCurrent 
                    ? 'border-rose-500/60 bg-rose-500/20 text-white shadow-glow' 
                    : 'border-[#27272A] bg-[#171717] text-slate-500'
              }`}>
                <span className="text-[10px] font-mono font-bold">{isDone ? '✓ DONE' : isCurrent ? '● ACTIVE' : '🔒 LOCKED'}</span>
                <span className="text-xs font-extrabold">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#27272A]">
        {(['timeline', 'kanban', 'progress'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer uppercase font-mono ${
              activeTab === tab 
                ? 'bg-rose-600/20 text-white border border-rose-500/40 shadow-glow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab} View
          </button>
        ))}
      </div>

      {/* TAB RENDERERS */}
      <div className="min-h-[400px]">
        {activeTab === 'timeline' && (
          <div className="relative pl-6 border-l-2 border-rose-500/30 flex flex-col gap-6 text-left">
            {sortedModules.map((mod, index) => {
              const statusIcons = {
                locked: <Lock className="h-4 w-4 text-slate-500" />,
                unlocked: <Unlock className="h-4 w-4 text-rose-400" />,
                'in-progress': <Play className="h-4 w-4 text-rose-400 animate-pulse" />,
                completed: <CheckCircle className="h-4 w-4 text-emerald-400" />
              };

              return (
                <div key={mod.id} className="relative flex flex-col gap-4">
                  {/* Node Dot */}
                  <div className={`absolute left-[-32px] top-2 h-4 w-4 rounded-full border bg-[#050505] flex items-center justify-center transition-all ${
                    mod.status === 'completed' 
                      ? 'border-emerald-500 shadow-glow'
                      : mod.status === 'in-progress'
                        ? 'border-rose-500 animate-pulse'
                        : 'border-[#27272A]'
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${
                      mod.status === 'completed' ? 'bg-emerald-400' : mod.status === 'in-progress' ? 'bg-rose-500' : 'bg-slate-600'
                    }`} />
                  </div>

                  <Card className="bg-[#111111] flex flex-col gap-4 border-[#27272A] p-6 shadow-glass">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#27272A] pb-3">
                      <div className="flex items-center gap-2.5">
                        {statusIcons[mod.status as keyof typeof statusIcons]}
                        <h3 className="font-extrabold text-white text-base">{mod.title}</h3>
                        {mod.completionPercentage > 0 && (
                          <span className="text-[10px] bg-[#171717] border border-[#27272A] text-rose-400 font-mono font-bold px-2 py-0.5 rounded">
                            {mod.completionPercentage}% Complete
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button variant="ghost" size="sm" disabled={index === 0 || isUpdating} onClick={() => handleMoveOrder(mod.id, 'up')} className="h-7 w-7 p-0">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" disabled={index === sortedModules.length - 1 || isUpdating} onClick={() => handleMoveOrder(mod.id, 'down')} className="h-7 w-7 p-0">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        {mod.status !== 'locked' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/learning?topic=${encodeURIComponent(mod.topics?.[0]?.title || mod.title)}&module=${encodeURIComponent(mod.title)}`)}
                            className="h-7 px-3 text-[11px] bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-glow"
                          >
                            <Sparkles className="h-3 w-3 mr-1" /> Study with AI
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{mod.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#050505] p-3 rounded-lg border border-[#27272A]">
                      <div>
                        <strong className="text-rose-400 block mb-0.5">Why It Matters:</strong>
                        <span className="text-slate-300">{mod.notes || 'Core foundational knowledge for your target career track.'}</span>
                      </div>
                      <div>
                        <strong className="text-amber-400 block mb-0.5">Prerequisites:</strong>
                        <span className="text-slate-300">{mod.prerequisites?.length > 0 ? mod.prerequisites.join(', ') : 'None (Entry level)'}</span>
                      </div>
                      <div>
                        <strong className="text-emerald-400 block mb-0.5">Learning Outcome:</strong>
                        <span className="text-slate-300">{mod.learningOutcome || 'Master core syntax and practical code execution.'}</span>
                      </div>
                    </div>

                    {/* Lessons list */}
                    <div className="flex flex-col gap-3 mt-2 border-t border-[#27272A] pt-4 text-left">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Lessons & Practical Exercises</h4>
                      {mod.topics.map((t: any, tid: number) => (
                        <div key={tid} className="flex flex-col gap-3 bg-[#171717]/80 border border-[#27272A] rounded-xl p-4">
                          <h5 className="text-xs font-bold text-white">{t.title}</h5>
                          <div className="flex flex-col gap-2 pl-2">
                            {t.lessons.map((l: any, lid: number) => (
                              <label key={lid} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={l.isCompleted || mod.status === 'completed'} 
                                  disabled={mod.status === 'locked'}
                                  onChange={() => handleToggleLesson(mod.id, tid, lid, l.isCompleted)}
                                  className="rounded border-[#27272A] bg-[#050505] text-rose-500 focus:ring-rose-500/20 accent-rose-600"
                                />
                                <span className={l.isCompleted || mod.status === 'completed' ? 'line-through text-slate-500' : ''}>{l.title}</span>
                                {l.duration && <span className="text-[10px] text-slate-500 font-mono">({l.duration})</span>}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {(['unlocked', 'in-progress', 'completed'] as const).map(colStatus => (
              <div key={colStatus} className="flex flex-col gap-4 p-4 rounded-xl border border-[#27272A] bg-[#111111]">
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-white border-b border-[#27272A] pb-2 flex justify-between">
                  <span>{colStatus}</span>
                  <span className="text-rose-400">({sortedModules.filter(m => m.status === colStatus).length})</span>
                </h4>
                <div className="flex flex-col gap-3">
                  {sortedModules.filter(m => m.status === colStatus).map(m => (
                    <Card key={m.id} className="p-4 bg-[#171717] border-[#27272A] flex flex-col gap-2">
                      <h5 className="font-bold text-white text-xs">{m.title}</h5>
                      <p className="text-[11px] text-slate-400">{m.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <Card className="p-8 bg-[#111111] border-[#27272A] flex flex-col gap-6 text-left">
            <h3 className="text-xl font-black text-white">Syllabus Completion Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border border-[#27272A] bg-[#171717] flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold">TOTAL SYLLABUS LESSONS</span>
                <span className="text-3xl font-black text-white font-mono">{stats.total}</span>
              </div>
              <div className="p-4 rounded-xl border border-[#27272A] bg-[#171717] flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold">LESSONS COMPLETED</span>
                <span className="text-3xl font-black text-rose-400 font-mono">{stats.completed}</span>
              </div>
              <div className="p-4 rounded-xl border border-[#27272A] bg-[#171717] flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold">PROGRESS PERCENTAGE</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">{stats.percent}%</span>
              </div>
            </div>
          </Card>
        )}
      </div>

    </div>
  );
};
export default RoadmapView;
