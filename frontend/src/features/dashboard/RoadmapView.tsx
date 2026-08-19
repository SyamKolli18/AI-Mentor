import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Sparkles, BookOpen, Clock, Lock, 
  Unlock, Play, CheckCircle, RefreshCw, 
  Edit3, ArrowUp, ArrowDown, Settings, AlertCircle
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [roadmap, setRoadmap] = useState<any>(null);
  const [progressLogs, setProgressLogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'kanban' | 'progress' | 'calendar'>('timeline');
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit module modals
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Quiz modals
  const [quizModule, setQuizModule] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number; total: number } | null>(null);

  const fetchRoadmapData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/roadmap');
      if (res.data.status === 'success' && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        // Load progress records
        const statsRes = await api.get('/ai/dashboard-stats');
        if (statsRes.data.status === 'success') {
          // Sync completion states
          setProgressLogs({
            completedLessons: statsRes.data.goal?.completedLessonsCount || 0,
            completedProjects: [], // populated below
          });
        }
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

  const handleToggleProject = async (moduleId: string, projectType: 'mini' | 'major', currentVal: boolean) => {
    if (!roadmap) return;
    try {
      setIsUpdating(true);
      const res = await api.post('/ai/roadmap/complete-project', {
        roadmapId: roadmap._id,
        moduleId,
        projectType,
        isCompleted: !currentVal
      });
      if (res.data.status === 'success') {
        setRoadmap(res.data.roadmap);
        // Add to completed projects mock
        const newProjKey = `${moduleId}_${projectType}`;
        const prevProj = progressLogs?.completedProjects || [];
        setProgressLogs({
          ...progressLogs,
          completedProjects: !currentVal 
            ? [...prevProj, newProjKey]
            : prevProj.filter((k: string) => k !== newProjKey)
        });
        toast(`Project marked as ${!currentVal ? 'completed' : 'incomplete'}! Career readiness updated.`, 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to update project status', 'error');
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
      // Swap order
      const temp = updatedModules[currentIdx].order;
      updatedModules[currentIdx].order = updatedModules[targetIdx].order;
      updatedModules[targetIdx].order = temp;

      const orderPayload = updatedModules.map(m => ({ id: m.id, order: m.order }));
      const res = await api.post('/ai/roadmap/reorder', { moduleOrders: orderPayload });
      setRoadmap(res.data.roadmap);
      toast('Modules sequence adjusted.', 'success');
    } catch (err: any) {
      toast('Failed to reorder modules', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (moduleId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const res = await api.post('/ai/roadmap/customise', { moduleId, status: newStatus });
      setRoadmap(res.data.roadmap);
      toast('Module status updated successfully.', 'success');
    } catch (err: any) {
      toast('Failed to change status.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenEdit = (mod: any) => {
    setEditingModule(mod);
    setEditTitle(mod.title);
    setEditDesc(mod.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingModule) return;
    try {
      setIsUpdating(true);
      const res = await api.post('/ai/roadmap/customise', { 
        moduleId: editingModule.id, 
        title: editTitle, 
        description: editDesc 
      });
      setRoadmap(res.data.roadmap);
      toast('Module customized successfully.', 'success');
      setEditingModule(null);
    } catch (err: any) {
      toast('Failed to update details.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerating will compile a new syllabus version. Progress states will reset. Proceed?')) return;
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

  // Checkpoint Quiz Handling
  const handleStartQuiz = (mod: any) => {
    setQuizModule(mod);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleSubmitQuiz = async () => {
    if (!quizModule || !roadmap) return;
    const questions = quizModule.checkpointQuiz.questions;
    let score = 0;
    
    questions.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.answerIndex) {
        score++;
      }
    });

    try {
      setSaving(true);
      await api.post('/ai/roadmap/submit-quiz', {
        roadmapId: roadmap._id,
        moduleId: quizModule.id,
        score,
        totalQuestions: questions.length
      });
      
      const passed = (score / questions.length) >= 0.5;
      setQuizResult({
        passed,
        score,
        total: questions.length
      });

      if (passed) {
        toast('Congratulations! You passed the checkpoint validation!', 'success');
        fetchRoadmapData(); // Reload status locks
      } else {
        toast('Score below passing grade. Review topics and retry.', 'error');
      }
    } catch (err: any) {
      toast('Failed to submit quiz results', 'error');
    } finally {
      setSaving(false);
    }
  };

  const [saving, setSaving] = useState(false);

  // Helper values for Progress View
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
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col gap-6 text-left">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Your Syllabus Roadmap</h1>
          <p className="text-sm text-slate-400">Generates custom topic nodes depending on your time constraints.</p>
        </div>
        <Card className="border-indigo-500/20 bg-indigo-500/5 text-center flex flex-col items-center gap-6 py-12">
          <BookOpen className="h-12 w-12 text-primary animate-bounce" />
          <div className="max-w-md flex flex-col gap-2">
            <h3 className="text-lg font-bold text-white">No Active Roadmap</h3>
            <p className="text-xs text-slate-400">
              Please predict suitable careers and select a target track to compile your custom syllabus learning paths.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/career')}>
            Generate Career Tracks
          </Button>
        </Card>
      </div>
    );
  }

  const stats = getProgressStats();
  const sortedModules = [...roadmap.modules].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 text-left relative font-sans">
      
      {/* 1. HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
            Syllabus Version {roadmap.version}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl mt-1.5 flex items-center gap-2">
            {roadmap.targetCareer} Roadmap <Sparkles className="h-5.5 w-5.5 text-accent animate-pulse" />
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="glass" 
            size="sm" 
            isLoading={isUpdating}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={handleRegenerate}
            className="text-xs"
          >
            Regenerate AI Path
          </Button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-white/5">
        {(['timeline', 'kanban', 'progress', 'calendar'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer capitalize ${
              activeTab === tab ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab} View
          </button>
        ))}
      </div>

      {/* 3. TAB RENDERERS */}
      <div className="min-h-[400px]">
        
        {/* TIMELINE VIEW */}
        {activeTab === 'timeline' && (
          <div className="relative pl-6 border-l border-white/5 flex flex-col gap-6 text-left">
            {sortedModules.map((mod, index) => {
              const statusIcons = {
                locked: <Lock className="h-4 w-4 text-slate-500" />,
                unlocked: <Unlock className="h-4 w-4 text-primary" />,
                'in-progress': <Play className="h-4 w-4 text-amber-400 animate-pulse" />,
                completed: <CheckCircle className="h-4 w-4 text-emerald-400" />
              };

              return (
                <div key={mod.id} className="relative flex flex-col gap-4 group">
                  {/* Timeline pointer dot */}
                  <div className={`absolute left-[-31px] top-1.5 h-4 w-4 rounded-full border bg-background flex items-center justify-center transition-all ${
                    mod.status === 'completed' 
                      ? 'border-emerald-500 shadow-glow shadow-emerald-500/20'
                      : mod.status === 'in-progress'
                        ? 'border-amber-400 animate-pulse'
                        : 'border-white/10'
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${
                      mod.status === 'completed' ? 'bg-emerald-400' : mod.status === 'in-progress' ? 'bg-amber-400' : 'bg-slate-600'
                    }`} />
                  </div>

                  {/* Content card */}
                  <Card className="bg-card/10 flex flex-col gap-4 border-white/5 p-5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        {statusIcons[mod.status as keyof typeof statusIcons]}
                        <h3 className="font-extrabold text-white text-base">{mod.title}</h3>
                        {mod.completionPercentage > 0 && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                            {mod.completionPercentage}% Done
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={index === 0 || isUpdating}
                          onClick={() => handleMoveOrder(mod.id, 'up')}
                          className="h-7 w-7 p-0 rounded"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={index === sortedModules.length - 1 || isUpdating}
                          onClick={() => handleMoveOrder(mod.id, 'down')}
                          className="h-7 w-7 p-0 rounded"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenEdit(mod)}
                          className="h-7 px-2 text-[10px] gap-1 text-slate-400 hover:text-white"
                        >
                          <Edit3 className="h-3 w-3" /> Customize
                        </Button>
                        {mod.status !== 'locked' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/learning?topic=${encodeURIComponent(mod.topics?.[0]?.title || mod.title)}&module=${encodeURIComponent(mod.title)}`)}
                            className="h-7 px-3 text-[11px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-glow"
                          >
                            <Sparkles className="h-3 w-3 mr-1" /> Study with AI
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{mod.description}</p>

                    {/* Phase D Fields: Why it matters, Prerequisites, Learning Objectives */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      <div>
                        <strong className="text-indigo-400 block mb-0.5">Why It Matters:</strong>
                        <span className="text-slate-300">{mod.notes || 'Core foundational knowledge for your target career track.'}</span>
                      </div>
                      <div>
                        <strong className="text-purple-400 block mb-0.5">Prerequisites:</strong>
                        <span className="text-slate-300">{mod.prerequisites?.length > 0 ? mod.prerequisites.join(', ') : 'None (Entry level)'}</span>
                      </div>
                      <div>
                        <strong className="text-emerald-400 block mb-0.5">Learning Outcome:</strong>
                        <span className="text-slate-300">{mod.learningOutcome || 'Master core syntax and practical code execution.'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-400" />
                        <span>Pacing: {mod.estimatedCompletionTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-purple-400" />
                        <span>Difficulty: {mod.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-emerald-400" />
                        <span>Status: <span className="font-bold text-white uppercase">{mod.status}</span></span>
                      </div>
                    </div>

                    {/* Topics rendering nested inside */}
                    <div className="flex flex-col gap-3 mt-2 border-t border-white/5 pt-4 text-left">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Lessons & resource lists</h4>
                      {mod.topics.map((t: any, tid: number) => (
                        <div key={tid} className="flex flex-col gap-3 bg-[#0d0a27]/20 border border-white/5 rounded-xl p-4">
                          <h5 className="text-xs font-bold text-slate-200">{t.title}</h5>
                          
                          {/* Lessons list */}
                          <div className="flex flex-col gap-2 pl-2">
                            {t.lessons.map((l: any, lid: number) => (
                              <label key={lid} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={l.isCompleted || mod.status === 'completed'} 
                                  disabled={mod.status === 'locked'}
                                  onChange={() => handleToggleLesson(mod.id, tid, lid, l.isCompleted)}
                                  className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 accent-primary"
                                />
                                <span className={l.isCompleted || mod.status === 'completed' ? 'line-through text-slate-500' : ''}>{l.title}</span>
                                {l.duration && <span className="text-[10px] text-slate-600">({l.duration})</span>}
                              </label>
                            ))}
                          </div>

                          {/* Resources database maps */}
                          {t.resources && t.resources.length > 0 && (
                            <div className="mt-3 border-t border-white/5 pt-3 flex flex-col gap-2">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Indexed Learning Resources</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {t.resources.map((res: any, rid: number) => {
                                  const isObj = typeof res === 'object' && res !== null;
                                  const resTitle = isObj ? res.title : res;
                                  const resUrl = isObj ? res.externalUrl : `https://google.com/search?q=${encodeURIComponent(res)}`;
                                  const resType = isObj ? res.resourceType : 'guide';
                                  const resDiff = isObj ? res.difficulty : 'general';
                                  return (
                                    <a 
                                      key={rid}
                                      href={resUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center justify-between p-2 bg-slate-950/40 border border-white/5 rounded-lg hover:border-primary/30 text-[10px] text-slate-300 hover:text-white transition-all"
                                    >
                                      <span className="truncate max-w-[140px] font-medium">{resTitle}</span>
                                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded uppercase shrink-0">
                                        {resType} ({resDiff})
                                      </span>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Checkpoint quiz */}
                    {mod.checkpointQuiz && mod.checkpointQuiz.questions && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Checkpoint Quiz</span>
                        <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-white/5">
                          <div className="flex flex-col text-left gap-0.5">
                            <span className="text-xs font-bold text-slate-200">Checkpoint Validation Quiz</span>
                            <span className="text-[10px] text-slate-400">{mod.checkpointQuiz.questions.length} questions to check mastery.</span>
                          </div>
                          
                          <Button 
                            variant="glass" 
                            size="sm" 
                            disabled={mod.status === 'locked'}
                            onClick={() => handleStartQuiz(mod)}
                            className="text-xs px-3 h-8"
                          >
                            Launch Quiz
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Projects checklist */}
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mod.miniProjects && mod.miniProjects.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-accent uppercase">Mini Project Challenges</span>
                          {mod.miniProjects.map((p: any, pid: number) => {
                            const isCompleted = progressLogs?.completedProjects?.includes(`${mod.id}_mini`) || mod.status === 'completed';
                            return (
                              <label key={pid} className="flex gap-2.5 p-3 bg-slate-900/40 border border-white/5 rounded-xl cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={isCompleted}
                                  disabled={mod.status === 'locked'}
                                  onChange={() => handleToggleProject(mod.id, 'mini', isCompleted)}
                                  className="mt-0.5 rounded border-white/10 bg-white/5 text-primary accent-primary"
                                />
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-bold text-white">{p.title}</span>
                                  <span className="text-[10px] text-slate-400 leading-normal">{p.description}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {mod.majorProject && (
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-accent uppercase">Major Milestone Project</span>
                          {(() => {
                            const isCompleted = progressLogs?.completedProjects?.includes(`${mod.id}_major`) || mod.status === 'completed';
                            return (
                              <label className="flex gap-2.5 p-3 bg-indigo-950/10 border border-indigo-500/20 rounded-xl cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={isCompleted}
                                  disabled={mod.status === 'locked'}
                                  onChange={() => handleToggleProject(mod.id, 'major', isCompleted)}
                                  className="mt-0.5 rounded border-white/10 bg-white/5 text-primary accent-primary"
                                />
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-bold text-white">{mod.majorProject.title}</span>
                                  <span className="text-[10px] text-slate-400 leading-normal">{mod.majorProject.description}</span>
                                </div>
                              </label>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Notes & AI Tips */}
                    {(mod.notes || mod.aiTips) && (
                      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mod.notes && (
                          <div className="flex flex-col gap-1 text-left bg-slate-950/20 p-3 rounded-lg border border-white/5">
                            <span className="text-[9px] font-bold uppercase text-slate-400">Architects Notes</span>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{mod.notes}</p>
                          </div>
                        )}
                        {mod.aiTips && (
                          <div className="flex flex-col gap-1 text-left bg-primary/5 p-3 rounded-lg border border-primary/10">
                            <span className="text-[9px] font-bold uppercase text-primary">AI Quick Tips</span>
                            <p className="text-[10px] text-indigo-300 leading-relaxed">{mod.aiTips}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* KANBAN BOARD VIEW */}
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            {['locked', 'unlocked', 'in-progress', 'completed'].map((col) => {
              const colMods = sortedModules.filter(m => m.status === col);
              const titles = {
                locked: 'Locked Stages',
                unlocked: 'Todo Queue',
                'in-progress': 'In Progress',
                completed: 'Completed'
              };

              return (
                <div key={col} className="flex flex-col gap-3 p-3 bg-white/2 rounded-xl border border-white/5 min-h-[300px]">
                  <h3 className="text-xs font-extrabold text-white border-b border-white/5 pb-2 uppercase tracking-wide flex justify-between">
                    <span>{titles[col as keyof typeof titles]}</span>
                    <span className="bg-white/5 px-1.5 py-0.2 rounded text-[10px]">{colMods.length}</span>
                  </h3>

                  <div className="flex flex-col gap-2">
                    {colMods.map(m => (
                      <div 
                        key={m.id} 
                        className="p-3 bg-card/25 border border-white/5 rounded-lg flex flex-col gap-2 shadow-sm relative group"
                      >
                        <h4 className="font-bold text-xs text-slate-200">{m.title}</h4>
                        <span className="text-[9px] text-slate-500 font-medium">Difficulty: {m.difficulty}</span>
                        <div className="w-full bg-white/5 h-1 rounded overflow-hidden mt-1">
                          <div className="bg-primary h-full" style={{ width: `${m.completionPercentage}%` }} />
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                          <span className="text-[9px] text-slate-400">{m.completionPercentage}% Complete</span>
                          <select
                            value={m.status}
                            onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                            className="bg-background border border-white/10 text-[9px] text-slate-400 rounded px-1 py-0.5 focus:outline-none focus:border-primary/50 cursor-pointer"
                          >
                            <option value="locked">Lock</option>
                            <option value="unlocked">Todo</option>
                            <option value="in-progress">Start</option>
                            <option value="completed">Complete</option>
                          </select>
                        </div>
                      </div>
                    ))}

                    {colMods.length === 0 && (
                      <span className="text-[10px] text-slate-600 text-center py-8">Empty column</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PROGRESS VIEW */}
        {activeTab === 'progress' && (
          <div className="flex flex-col gap-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Overall Completion Card */}
              <Card className="flex flex-col items-center justify-center p-8 gap-4 text-center border-white/5 bg-slate-900/30">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="absolute transform -rotate-90 w-full h-full">
                    <circle cx="56" cy="56" r="48" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      stroke="#6366F1" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray={301.6}
                      strokeDashoffset={301.6 - (301.6 * stats.percent) / 100}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="font-black text-2xl text-white">{stats.percent}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-sm text-slate-300">Total Completion Score</h4>
                  <span className="text-xs text-slate-500">{stats.completed} of {stats.total} syllabus checkpoints completed.</span>
                </div>
              </Card>

              {/* Status checklist */}
              <Card className="md:col-span-2 flex flex-col gap-4 border-white/5">
                <h4 className="font-bold text-sm text-white">Stage Completion Checklist</h4>
                <div className="flex flex-col gap-3">
                  {sortedModules.map(m => (
                    <div key={m.id} className="flex flex-col gap-1 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-300">{m.title}</span>
                        <span className="font-bold text-slate-400">{m.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            m.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${m.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* CALENDAR SCHEDULE VIEW */}
        {activeTab === 'calendar' && (
          <Card className="p-6 border-white/5 bg-slate-900/10 text-left">
            <h3 className="text-sm font-bold text-white mb-2">Estimated Pacing Blocks</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Mapped using your preferred study constraint of {roadmap.modules[0]?.estimatedCompletionTime || '2 hours daily'} sessions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sortedModules.map((m, idx) => (
                <div key={m.id} className="border border-white/5 bg-slate-950/40 p-4 rounded-xl flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute right-2 top-2 text-[40px] font-black text-white/2 select-none leading-none">
                    0{idx + 1}
                  </div>
                  <div>
                    <span className="text-[8px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded uppercase">
                      Stage {idx + 1}
                    </span>
                    <h4 className="font-bold text-xs text-slate-200 mt-1">{m.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Allocated: {m.estimatedCompletionTime}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Prerequisite check: {m.prerequisites?.join(', ') || 'None'}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>

      {/* 4. CUSTOMISE MODULE MODAL */}
      {editingModule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 flex flex-col gap-4 bg-slate-900 border-white/10 shadow-2xl text-left">
            <h3 className="font-bold text-sm text-white">Customize Stage Details</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Stage Title</label>
                <Input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Description</label>
                <textarea 
                  value={editDesc} 
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary min-h-[80px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="glass" onClick={() => setEditingModule(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveEdit} isLoading={isUpdating}>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 5. INTERACTIVE QUIZ MODAL */}
      {quizModule && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-lg w-full p-6 flex flex-col gap-4 bg-slate-900 border-white/10 shadow-2xl text-left my-8">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <span className="text-[8px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded uppercase">
                  Checkpoint Validation
                </span>
                <h3 className="font-bold text-sm text-white mt-1">{quizModule.title} - Quiz</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setQuizModule(null)} className="h-6 w-6 p-0">×</Button>
            </div>

            {quizResult ? (
              <div className="flex flex-col gap-6 items-center text-center py-6">
                {quizResult.passed ? (
                  <>
                    <CheckCircle className="h-14 w-14 text-emerald-400 animate-bounce" />
                    <div className="flex flex-col gap-2">
                      <h4 className="text-lg font-bold text-white">Checkpoint Unlocked!</h4>
                      <p className="text-xs text-slate-400">
                        You scored {quizResult.score} / {quizResult.total}. Next syllabus modules have unlocked. Keep going!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-14 w-14 text-red-400 animate-pulse" />
                    <div className="flex flex-col gap-2">
                      <h4 className="text-lg font-bold text-white">Try Again</h4>
                      <p className="text-xs text-slate-400">
                        You scored {quizResult.score} / {quizResult.total}. Study the topic guidelines and lessons checklists before re-evaluating.
                      </p>
                    </div>
                  </>
                )}
                <Button 
                  variant="primary" 
                  onClick={() => {
                    if (quizResult.passed) {
                      setQuizModule(null);
                    } else {
                      setQuizResult(null);
                      setQuizAnswers({});
                    }
                  }}
                  className="px-6"
                >
                  {quizResult.passed ? 'Continue Study Map' : 'Retry Quiz'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1">
                {quizModule.checkpointQuiz.questions.map((q: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-3 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-slate-200">Question {idx + 1}: {q.question}</span>
                    <div className="flex flex-col gap-2 pl-2">
                      {q.options.map((opt: string, oIdx: number) => (
                        <label key={oIdx} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white select-none">
                          <input 
                            type="radio" 
                            name={`q-${idx}`}
                            checked={quizAnswers[idx] === oIdx}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: oIdx })}
                            className="text-primary focus:ring-primary/20 accent-primary"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="primary" 
                  onClick={handleSubmitQuiz} 
                  isLoading={saving}
                  className="w-full mt-4 h-10 shadow-glow"
                >
                  Verify Checkpoint Answers
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
};
export default RoadmapView;
