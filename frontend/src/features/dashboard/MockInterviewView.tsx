import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Sparkles, History, MessageSquare, Timer, ArrowLeft, ArrowRight, SkipForward,
  CheckCircle, Play, Mic, ShieldAlert, Cpu, HeartHandshake, ListChecks, Calendar, Volume2, BookOpen
} from 'lucide-react';

export const MockInterviewView: React.FC = () => {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'setup' | 'session' | 'history'>('setup');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Setup options
  const [interviewType, setInterviewType] = useState<'Technical' | 'HR' | 'Behavioral' | 'Coding' | 'System Design'>('Technical');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');

  // Active Session state
  const [activeSession, setActiveSession] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(120); // 2 minutes per question
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // History list state
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [selectedPastSession, setSelectedPastSession] = useState<any>(null);

  const fetchHistory = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setHistoryLoading(true);
      const res = await api.get('/interviews/history');
      if (res.data.status === 'success') {
        setPastSessions(res.data.history || []);
      }
    } catch (err: any) {
      console.error('Failed to retrieve past interview sessions', err);
    } finally {
      if (showLoading) setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Timer countdown hook for active sessions
  useEffect(() => {
    let interval: any = null;
    if (activeSubTab === 'session' && activeSession && activeSession.status === 'active') {
      interval = setInterval(() => {
        setTimerSeconds(sec => {
          if (sec <= 1) {
            // Auto submit empty answer when timer runs out
            handleAnswerSubmit('Timer expired. No answer submitted.');
            return 120;
          }
          return sec - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeSubTab, activeSession]);

  const handleLaunchInterview = async () => {
    try {
      setLoading(true);
      const res = await api.post('/interviews/generate', { interviewType, difficulty });
      if (res.data.status === 'success') {
        toast('Mock interview questions generated successfully! Launching session.', 'success');
        setActiveSession(res.data.interview);
        setUserAnswer('');
        setTimerSeconds(120);
        setActiveSubTab('session');
      }
    } catch (err: any) {
      toast(err.message || 'Generation failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (forcedAnswer?: string) => {
    if (!activeSession) return;
    const answer = forcedAnswer !== undefined ? forcedAnswer : userAnswer;

    try {
      setLoading(true);
      const res = await api.post(`/interviews/${activeSession._id}/submit-answer`, { userResponse: answer });
      if (res.data.status === 'success') {
        setActiveSession(res.data.interview);
        setUserAnswer('');
        setTimerSeconds(120); // reset timer

        // Check if all questions are completed
        const updatedSession = res.data.interview;
        if (updatedSession.currentQuestionIndex >= updatedSession.questions.length) {
          handleCompleteSession(updatedSession._id);
        }
      }
    } catch (err: any) {
      toast('Failed to save answer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipQuestion = async () => {
    handleAnswerSubmit('Skipped question.');
  };

  const handleCompleteSession = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.post(`/interviews/${id}/complete`);
      if (res.data.status === 'success') {
        toast('Interview completed! Displaying performance analytics.', 'success');
        setActiveSession(res.data.interview);
        fetchHistory(false);
      }
    } catch (err: any) {
      toast('Failed to close interview session.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast('Voice Recognition Activated. Speaking now...', 'info');
      // Simulate speech-to-text writing in 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        setUserAnswer('This is a simulated speech response demonstrating knowledge of virtual dom structures and rendering loops.');
        toast('Voice parsing complete.', 'success');
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          AI Mock Interview Arena <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Rehearse Technical, behavioral, HR, and System Design interviews under timer bounds with detailed, recruiter-mapped scoring guides.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 pb-2 gap-4">
        <button
          onClick={() => { setActiveSubTab('setup'); setSelectedPastSession(null); }}
          className={`text-xs font-semibold py-2 px-1 relative transition-colors cursor-pointer ${
            activeSubTab === 'setup' && !selectedPastSession ? 'text-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          Interview Arena Setup
          {activeSubTab === 'setup' && !selectedPastSession && (
            <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
        <button
          onClick={() => { setActiveSubTab('history'); setSelectedPastSession(null); }}
          className={`text-xs font-semibold py-2 px-1 relative transition-colors cursor-pointer ${
            activeSubTab === 'history' || selectedPastSession ? 'text-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          Interview History logs ({pastSessions.length})
          {(activeSubTab === 'history' || selectedPastSession) && (
            <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
      </div>

      {/* SETUP SELECTION MENU */}
      {activeSubTab === 'setup' && !selectedPastSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in duration-200">
          
          {/* Main selection config card */}
          <Card className="lg:col-span-2 border-white/5 bg-card/10 p-6 flex flex-col gap-6">
            <h3 className="font-extrabold text-white text-base flex items-center gap-1.5"><MessageSquare className="h-4.5 w-4.5 text-primary" /> Calibrate Interview Parameters</h3>
            
            {/* Choose type */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Interview Core Subject</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'Technical', label: 'Technical Core' },
                  { id: 'System Design', label: 'System Design' },
                  { id: 'Coding', label: 'Coding / Logic' },
                  { id: 'HR', label: 'HR / Placement' },
                  { id: 'Behavioral', label: 'Behavioral Teamwork' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setInterviewType(type.id as any)}
                    className={`text-xs font-bold p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      interviewType === type.id 
                        ? 'border-primary bg-primary/10 text-primary shadow-glow shadow-primary/5' 
                        : 'border-white/5 bg-white/2 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose difficulty */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Mock Difficulty Level</label>
              <div className="grid grid-cols-4 gap-3">
                {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level as any)}
                    className={`text-xs font-bold p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      difficulty === level 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-white/5 bg-white/2 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleLaunchInterview}
              isLoading={loading}
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 border-none hover:shadow-glow shadow-violet-500/20 mt-3"
              rightIcon={<Play className="h-4 w-4" />}
            >
              Generate AI Sandbox Questions
            </Button>
          </Card>

          {/* Quick instructions */}
          <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4 text-xs leading-relaxed text-slate-400">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Cpu className="h-4.5 w-4.5 text-accent animate-pulse" /> Sandbox Mechanics
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>You will receive **5 dynamic questions** suited to your preferences and onboarding career tracks.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Each question enforces a **120-second timer limit**. Expired timers trigger auto-submittals.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>You can switch between **Text Input mode** and **Pulsating Voice mode** (simulated speech converter) to verify vocabulary fluency.</span>
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* ACTIVE INTERVIEW RUNNING SESSION */}
      {activeSubTab === 'session' && activeSession && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-in slide-in-from-bottom duration-300">
          
          {activeSession.status === 'active' ? (
            <>
              {/* Session Progress Header */}
              <div className="flex justify-between items-center bg-[#111827]/40 border border-white/5 rounded-xl p-4">
                <div className="flex flex-col text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Active Mock Interview</span>
                  <span className="font-extrabold text-white text-sm mt-0.5">{activeSession.interviewType} | {activeSession.difficulty}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">Q: {activeSession.currentQuestionIndex + 1} / {activeSession.questions?.length}</span>
                  <div className="h-8 border-r border-white/5" />
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-xs font-mono font-bold text-rose-400 rounded-lg animate-pulse">
                    <Timer className="h-4 w-4" /> {formatTimer(timerSeconds)}
                  </div>
                </div>
              </div>

              {/* Question canvas */}
              <Card className="border-white/5 bg-card/10 p-6 min-h-[150px] flex flex-col justify-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-full w-[25%] bg-glow-gradient opacity-20 blur-[30px] pointer-events-none" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Question Matrix</span>
                <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                  {activeSession.questions?.[activeSession.currentQuestionIndex]?.question}
                </h3>
              </Card>

              {/* Input section & Voice layout options */}
              <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-2 shrink-0">
                  <span className="text-xs font-bold text-white">Your Answer Response Block</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setIsVoiceMode(false); setIsRecording(false); }}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        !isVoiceMode ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 text-slate-500 hover:text-white'
                      }`}
                    >
                      Text Entry
                    </button>
                    <button
                      onClick={() => setIsVoiceMode(true)}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        isVoiceMode ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 text-slate-500 hover:text-white'
                      }`}
                    >
                      Voice Mode (Ready)
                    </button>
                  </div>
                </div>

                {!isVoiceMode ? (
                  <textarea
                    placeholder="Type your structured answer details here... Protip: Mention key framework variables and scalability outcomes."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={loading}
                    className="w-full h-36 bg-slate-950 text-slate-300 p-4 text-xs rounded-lg border border-white/5 focus:outline-none focus:border-primary/45 resize-none leading-relaxed"
                  />
                ) : (
                  <div className="border border-white/5 bg-white/2 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center">
                    
                    {/* Visual voice animations */}
                    {isRecording ? (
                      <div className="flex items-center justify-center gap-1.5 h-10">
                        {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                          <div 
                            key={i} 
                            className="w-1 bg-primary rounded-full animate-pulse" 
                            style={{ 
                              height: `${h * 6}px`,
                              animationDelay: `${i * 0.15}s`
                            }} 
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="h-10 flex items-center justify-center">
                        <Volume2 className="h-6 w-6 text-slate-500" />
                      </div>
                    )}

                    <span className="text-xs text-slate-300 font-semibold">
                      {isRecording ? 'Capturing vocabulary frequencies... Speak clearly.' : 'Voice recognition engine loaded in sandbox.'}
                    </span>

                    <Button 
                      variant={isRecording ? 'outline' : 'primary'}
                      onClick={toggleRecording}
                      className="px-4 py-1 text-xs shrink-0 h-9"
                      leftIcon={<Mic className="h-4 w-4" />}
                    >
                      {isRecording ? 'Stop Recording' : 'Start Dictation'}
                    </Button>

                    {userAnswer && (
                      <div className="w-full bg-[#111827]/40 border border-white/5 rounded-lg p-3 text-left text-[11px] text-slate-400 mt-2">
                        <span className="font-bold text-slate-300 block mb-1">Transcribed Response:</span>
                        {userAnswer}
                      </div>
                    )}
                  </div>
                )}

                {/* Submissions & Skip Controls */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleSkipQuestion}
                    isLoading={loading}
                    className="text-xs h-9 border-white/10"
                    rightIcon={<SkipForward className="h-4 w-4" />}
                  >
                    Skip Question
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => handleAnswerSubmit()}
                    isLoading={loading}
                    className="text-xs h-9"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Save & Proceed
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            /* COMPLETED RESULT SCORECARD REPORT VIEW */
            <Card className="border-white/5 bg-slate-900/10 p-6 flex flex-col gap-6 animate-in fade-in duration-300">
              
              {/* Result Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Mock Session Concluded</span>
                  <h2 className="text-xl font-black text-white mt-0.5">{activeSession.interviewType} Diagnostic Report</h2>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 rounded font-semibold font-mono">
                  <CheckCircle className="h-4 w-4" /> COMPLETED
                </div>
              </div>

              {/* Cognitive Score breakdown grids */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Overall rating', score: activeSession.feedback.overallRating, color: 'text-violet-400' },
                  { label: 'Technical Score', score: activeSession.feedback.technicalScore, color: 'text-indigo-400' },
                  { label: 'Communication', score: activeSession.feedback.communicationScore, color: 'text-blue-400' },
                  { label: 'Confidence Score', score: activeSession.feedback.confidenceScore, color: 'text-purple-400' },
                  { label: 'Problem Solving', score: activeSession.feedback.problemSolving, color: 'text-emerald-400' }
                ].map((item, idx) => (
                  <Card key={idx} className="bg-[#111827]/40 border-white/5 p-4 text-center flex flex-col gap-1 items-center justify-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                    <span className={`text-2xl font-black ${item.color}`}>{item.score}%</span>
                  </Card>
                ))}
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
                <Card className="border-emerald-500/10 bg-emerald-500/5 p-4 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/20 pb-1.5">
                    <HeartHandshake className="h-4.5 w-4.5 text-emerald-400" /> Key Strengths
                  </h4>
                  <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1.5">
                    {activeSession.feedback.strengths?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </Card>

                <Card className="border-rose-500/10 bg-rose-500/5 p-4 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-rose-500/20 pb-1.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-rose-400" /> Focus/Weakness Nodes
                  </h4>
                  <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1.5">
                    {activeSession.feedback.weaknesses?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Revision list, study resources and roadmap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
                
                <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1">
                    <ListChecks className="h-4 w-4 text-indigo-400" /> Topics to Revise
                  </h4>
                  <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1">
                    {activeSession.feedback.topicsToRevise?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1">
                    <BookOpen className="h-4 w-4 text-cyan-400" /> Recommended Study Guides
                  </h4>
                  <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1">
                    {activeSession.feedback.recommendedResources?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1">
                    <Calendar className="h-4 w-4 text-amber-400" /> Action Roadmap
                  </h4>
                  <ol className="list-decimal pl-4 text-slate-400 flex flex-col gap-1">
                    {activeSession.feedback.improvementRoadmap?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ol>
                </div>

              </div>

              {/* Questions review listing */}
              <div className="flex flex-col gap-3">
                <h4 className="font-bold text-white text-xs block uppercase tracking-wider">Responses Audit Analysis</h4>
                <div className="flex flex-col gap-4">
                  {activeSession.questions?.map((q: any, idx: number) => (
                    <Card key={idx} className="bg-white/2 border-white/5 p-4 flex flex-col gap-2.5">
                      <div className="flex justify-between font-bold text-xs">
                        <span className="text-white">Question {idx + 1}: {q.question}</span>
                        <span className="text-primary">{q.score || 0}% Score</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <strong className="text-slate-400 block mb-0.5">Your Response:</strong>
                        {q.userResponse}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <strong className="text-slate-400 block mb-0.5">AI Feedback Assessment:</strong>
                        {q.feedback}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <strong className="text-slate-400 block mb-0.5">Ideal Key Points Sample Answer:</strong>
                        {q.sampleAnswer}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button 
                  variant="primary" 
                  onClick={() => { setActiveSubTab('setup'); setActiveSession(null); }}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Return to Arena
                </Button>
              </div>

            </Card>
          )}

        </div>
      )}

      {/* INTERVIEWS ARCHIVE HISTORY RECORD VIEW */}
      {(activeSubTab === 'history' || selectedPastSession) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* History sessions index sidebar */}
          <Card className="lg:col-span-1 border-white/5 bg-card/10 p-4 flex flex-col gap-3">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5"><History className="h-4.5 w-4.5 text-primary" /> Session Records</h3>
            
            {historyLoading ? (
              <div className="py-8 flex justify-center">
                <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : pastSessions.length === 0 ? (
              <div className="text-center py-8 text-[11px] text-slate-500 italic">No mock sessions concluded.</div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {pastSessions.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedPastSession(item)}
                    className={`w-full text-left p-3 rounded-lg border text-xs flex flex-col gap-1 cursor-pointer transition-all ${
                      selectedPastSession?._id === item._id 
                        ? 'border-primary bg-primary/10 text-white' 
                        : 'border-white/5 bg-white/2 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between w-full font-bold">
                      <span>{item.interviewType}</span>
                      <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded shrink-0">{item.feedback?.overallRating || 0}% Score</span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1 flex justify-between">
                      <span>Diff: {item.difficulty}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Detailed past interview report card */}
          <Card className="lg:col-span-2 border-white/5 bg-card/10 p-6 min-h-[300px] flex flex-col justify-center">
            {selectedPastSession ? (
              <div className="flex flex-col gap-6 text-xs text-slate-300 leading-relaxed">
                
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Archived Mock Session Report</span>
                  <h3 className="text-lg font-black text-white mt-1">{selectedPastSession.interviewType} Blueprint</h3>
                  <span className="text-[10px] text-slate-500 block mt-1">Concluded: {new Date(selectedPastSession.createdAt).toLocaleString()} | Diff: {selectedPastSession.difficulty}</span>
                </div>

                {/* Score breakdown grids */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Overall rating', score: selectedPastSession.feedback?.overallRating, color: 'text-violet-400' },
                    { label: 'Technical Score', score: selectedPastSession.feedback?.technicalScore, color: 'text-indigo-400' },
                    { label: 'Communication', score: selectedPastSession.feedback?.communicationScore, color: 'text-blue-400' },
                    { label: 'Confidence Score', score: selectedPastSession.feedback?.confidenceScore, color: 'text-purple-400' },
                    { label: 'Problem Solving', score: selectedPastSession.feedback?.problemSolving, color: 'text-emerald-400' }
                  ].map((item, idx) => (
                    <Card key={idx} className="bg-[#111827]/40 border-white/5 p-3 text-center flex flex-col gap-1 items-center justify-center">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                      <span className={`text-lg font-black ${item.color}`}>{item.score || 0}%</span>
                    </Card>
                  ))}
                </div>

                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
                  <Card className="border-emerald-500/10 bg-emerald-500/5 p-4 flex flex-col gap-2">
                    <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/20 pb-1.5">
                      <HeartHandshake className="h-4.5 w-4.5 text-emerald-400" /> Key Strengths
                    </h4>
                    <ul className="list-disc pl-4 text-slate-400">
                      {selectedPastSession.feedback?.strengths?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="border-rose-500/10 bg-rose-500/5 p-4 flex flex-col gap-2">
                    <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-rose-500/20 pb-1.5">
                      <ShieldAlert className="h-4.5 w-4.5 text-rose-400" /> Focus/Weakness Nodes
                    </h4>
                    <ul className="list-disc pl-4 text-slate-400">
                      {selectedPastSession.feedback?.weaknesses?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* Review checklist details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-1">
                    <span className="font-bold text-white block">Topics to Revise:</span>
                    <ul className="list-disc pl-4 text-slate-400 mt-1">
                      {selectedPastSession.feedback?.topicsToRevise?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-1">
                    <span className="font-bold text-white block">Recommended Guides:</span>
                    <ul className="list-disc pl-4 text-slate-400 mt-1">
                      {selectedPastSession.feedback?.recommendedResources?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-1">
                    <span className="font-bold text-white block">Action Roadmap:</span>
                    <ol className="list-decimal pl-4 text-slate-400 mt-1">
                      {selectedPastSession.feedback?.improvementRoadmap?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Questions audit */}
                <div className="flex flex-col gap-3 mt-2">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Responses Audit Analysis</h4>
                  <div className="flex flex-col gap-3">
                    {selectedPastSession.questions?.map((q: any, idx: number) => (
                      <Card key={idx} className="bg-white/2 border-white/5 p-3.5 flex flex-col gap-2">
                        <div className="flex justify-between font-bold text-xs">
                          <span className="text-white">Question {idx + 1}: {q.question}</span>
                          <span className="text-primary">{q.score || 0}% Score</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <strong className="text-slate-400 block">Your Response:</strong>
                          {q.userResponse}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <strong className="text-slate-400 block">AI Feedback:</strong>
                          {q.feedback}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center text-slate-500 italic text-xs">
                Select a completed interview session from the records list on the left to inspect performance stats and detailed QA audits.
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
};
export default MockInterviewView;
