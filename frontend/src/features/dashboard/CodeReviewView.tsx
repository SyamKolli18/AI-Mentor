import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Sparkles, Terminal, CheckCircle2, 
  Settings, History, Code, ShieldAlert, Zap, LayoutList, Layers, Upload
} from 'lucide-react';

export const CodeReviewView: React.FC = () => {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'new' | 'history'>('new');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // Submit state variables
  const [projectName, setProjectName] = useState('');
  const [submissionType, setSubmissionType] = useState<'text' | 'github' | 'zip'>('text');
  const [pastedCode, setPastedCode] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [zipSimName, setZipSimName] = useState('');

  // Results state variables
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  // Detailed view for past review history item
  const [viewingPastReview, setViewingPastReview] = useState<any>(null);

  const fetchHistory = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setHistoryLoading(true);
      const res = await api.get('/code-review/history');
      if (res.data.status === 'success') {
        setHistoryRecords(res.data.history || []);
      }
    } catch (err: any) {
      console.error('Failed to load review logs', err);
    } finally {
      if (showLoading) setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) {
      toast('Please supply a project identifier.', 'error');
      return;
    }

    if (submissionType === 'text' && !pastedCode) {
      toast('Please paste your source code inside the terminal canvas.', 'error');
      return;
    }

    if (submissionType === 'github' && !repositoryUrl) {
      toast('Please enter a GitHub repository URL.', 'error');
      return;
    }

    if (submissionType === 'zip' && !zipSimName) {
      toast('Please enter a ZIP filename or upload a file.', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        projectName,
        submissionType,
        pastedCode: submissionType === 'text' ? pastedCode : undefined,
        repositoryUrl: submissionType === 'github' ? repositoryUrl : zipSimName ? `zip://${zipSimName}` : undefined
      };

      const res = await api.post('/code-review/submit', payload);
      if (res.data.status === 'success') {
        toast('AI Code Review compiled successfully!', 'success');
        setReviewResult(res.data.review);
        fetchHistory(false); // reload background history silently
      }
    } catch (err: any) {
      toast(err.message || 'Auditing failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreData = (record: any) => {
    if (!record) return [];
    return [
      { metric: 'Code Quality', score: record.codeQualityScore, fill: '#8b5cf6' },
      { metric: 'Recruiter Readiness', score: record.recruiterReadinessScore, fill: '#6366f1' },
      { metric: 'Portfolio Appeal', score: record.portfolioScore, fill: '#ec4899' },
      { metric: 'Performance Index', score: record.performanceScore, fill: '#3b82f6' },
      { metric: 'Security Bounds', score: record.securityScore, fill: '#10b981' }
    ];
  };

  const getRadarData = (record: any) => {
    if (!record) return [];
    return [
      { subject: 'Code Quality', score: record.codeQualityScore, fullMark: 100 },
      { subject: 'Recruiter Readiness', score: record.recruiterReadinessScore, fullMark: 100 },
      { subject: 'Portfolio Appeal', score: record.portfolioScore, fullMark: 100 },
      { subject: 'Performance', score: record.performanceScore, fullMark: 100 },
      { subject: 'Security', score: record.securityScore, fullMark: 100 }
    ];
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          AI Code Reviewer <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Upload file archives, paste code variables, or connect GitHub nodes to compute code readability and security metrics.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 pb-2 gap-4">
        <button
          onClick={() => { setActiveSubTab('new'); setViewingPastReview(null); }}
          className={`text-xs font-semibold py-2 px-1 relative transition-colors cursor-pointer ${
            activeSubTab === 'new' && !viewingPastReview ? 'text-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          New Audit Canvas
          {activeSubTab === 'new' && !viewingPastReview && (
            <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
        <button
          onClick={() => { setActiveSubTab('history'); setViewingPastReview(null); }}
          className={`text-xs font-semibold py-2 px-1 relative transition-colors cursor-pointer ${
            activeSubTab === 'history' || viewingPastReview ? 'text-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          Audit History logs ({historyRecords.length})
          {(activeSubTab === 'history' || viewingPastReview) && (
            <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
      </div>

      {/* NEW REVIEW VIEW */}
      {activeSubTab === 'new' && !viewingPastReview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Submission Panel */}
          <Card className="lg:col-span-2 border-white/5 bg-card/10 p-6 flex flex-col gap-5">
            <h3 className="font-extrabold text-white text-base flex items-center gap-1.5"><Terminal className="h-4.5 w-4.5 text-primary" /> Audit Submission Config</h3>
            
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              <Input
                label="Project Identifier / Name"
                placeholder="e.g. Invoicing Engine, Chat Client"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1.5">Input Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'text', label: 'Paste Source Code' },
                    { id: 'github', label: 'GitHub Repository' },
                    { id: 'zip', label: 'Upload ZIP archive' }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSubmissionType(option.id as any)}
                      className={`text-xs font-semibold p-2.5 rounded-lg border transition-all cursor-pointer ${
                        submissionType === option.id 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-white/5 bg-white/2 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {submissionType === 'text' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Pasted Source Code Canvas</label>
                  <textarea
                    placeholder="// Paste main routes, models, or screen codes here..."
                    value={pastedCode}
                    onChange={(e) => setPastedCode(e.target.value)}
                    className="w-full h-64 bg-slate-950 text-slate-300 font-mono p-4 text-[11px] rounded-lg border border-white/5 focus:outline-none focus:border-primary/45 resize-none leading-relaxed"
                  />
                </div>
              )}

              {submissionType === 'github' && (
                <Input
                  label="GitHub Public Repository Link"
                  placeholder="https://github.com/username/project-repo"
                  leftIcon={<History className="h-4.5 w-4.5" />}
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                />
              )}

              {submissionType === 'zip' && (
                <div className="flex flex-col gap-3">
                  <div className="border border-dashed border-white/10 bg-white/2 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-white/5 cursor-pointer transition-colors relative">
                    <input 
                      type="file" 
                      accept=".zip" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setZipSimName(file.name);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <Upload className="h-8 w-8 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-300">Click or drag & drop ZIP project archive to simulate review</span>
                    <span className="text-[10px] text-slate-500">Max size 20MB</span>
                  </div>
                  {zipSimName && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3.5 py-2 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Selected File: {zipSimName}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                isLoading={loading}
                className="mt-2"
                rightIcon={<Sparkles className="h-4 w-4" />}
              >
                Compile AI Project Audit
              </Button>
            </form>
          </Card>

          {/* Quick Metrics Guide panel */}
          <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4 text-xs">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Zap className="h-4.5 w-4.5 text-accent" /> Evaluation Guidelines
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Our cognitive auditor compiles performance statistics of your application by looking for code patterns:
            </p>
            <ul className="flex flex-col gap-3 text-slate-400">
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold shrink-0">1.</span>
                <span>**Security Vector**: Hardcoded API credentials or innerHTML queries degrade security.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold shrink-0">2.</span>
                <span>**Performance Vector**: High nested loops index iterations degrade scaling scores.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 font-bold shrink-0">3.</span>
                <span>**Typing Cleanliness**: TypeScript parameters using implicit `any` variables reduce code quality markers.</span>
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* RESULTS DISPLAY SHOWN ON SUBMIT SUCCESS */}
      {activeSubTab === 'new' && reviewResult && !viewingPastReview && (
        <Card className="border-white/5 bg-slate-900/10 p-6 flex flex-col gap-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Blueprint Compiled</span>
              <h2 className="text-xl font-extrabold text-white mt-1">{reviewResult.projectName} Evaluation Report</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Ready for Recruiters
            </div>
          </div>

          {/* Visual Score Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#111827]/20 border-white/5 p-4 flex flex-col gap-2">
              <h4 className="font-bold text-white text-xs border-b border-white/5 pb-1">Cognitive Score Distribution</h4>
              <div className="h-[250px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getScoreData(reviewResult)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="metric" stroke="#9CA3AF" fontSize={8} fontWeight="600" />
                    <YAxis stroke="#9CA3AF" fontSize={8} fontWeight="600" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151B2D', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}
                      itemStyle={{ fontSize: 10 }}
                    />
                    <Bar dataKey="score" fill="url(#barGlow)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="bg-[#111827]/20 border-white/5 p-4 flex flex-col gap-2">
              <h4 className="font-bold text-white text-xs border-b border-white/5 pb-1">Architecture Radar Vector</h4>
              <div className="h-[250px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getRadarData(reviewResult)}>
                    <defs>
                      <radialGradient id="radarGlowReview" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.65}/>
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.15}/>
                      </radialGradient>
                    </defs>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#D1D5DB', fontSize: 8, fontWeight: '600' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
                    <Radar name="Project Vectors" dataKey="score" stroke="#6366F1" strokeWidth={2} fill="url(#radarGlowReview)" fillOpacity={0.8} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Detailed feedbacks section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-300">
            {/* Conventions and directory mapping */}
            <div className="flex flex-col gap-4">
              <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                <span className="font-bold text-white flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> Directory Layout Audit</span>
                <p className="text-slate-400 mt-1">{reviewResult.folderStructureFeedback}</p>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                <span className="font-bold text-white flex items-center gap-1.5"><Code className="h-4 w-4 text-indigo-400" /> Naming Styles Analysis</span>
                <p className="text-slate-400 mt-1">{reviewResult.namingConventionFeedback}</p>
              </div>
            </div>

            {/* Checklist lists */}
            <div className="flex flex-col gap-4">
              <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1"><ShieldAlert className="h-4 w-4 text-rose-400" /> Vulnerabilities & Warnings</span>
                <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1">
                  {reviewResult.suggestions?.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1"><Zap className="h-4 w-4 text-amber-400" /> Refactoring Action Recommendations</span>
                <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1">
                  {reviewResult.refactoringRecommendations?.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Missing features checklist and roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
              <span className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1"><LayoutList className="h-4 w-4 text-cyan-400" /> Missing Project Features</span>
              <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1">
                {reviewResult.missingFeatures?.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
              <span className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1"><Settings className="h-4 w-4 text-primary" /> Roadmap to Production Readiness</span>
              <ol className="list-decimal pl-4 text-slate-400 flex flex-col gap-1.5">
                {reviewResult.improvementRoadmap?.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
            </div>
          </div>

        </Card>
      )}

      {/* AUDIT LOGS HISTORY TABS */}
      {(activeSubTab === 'history' || viewingPastReview) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* History Sidebar list */}
          <Card className="lg:col-span-1 border-white/5 bg-card/10 p-4 flex flex-col gap-3">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5"><History className="h-4.5 w-4.5 text-primary" /> Audit Records</h3>
            
            {historyLoading ? (
              <div className="py-8 flex justify-center">
                <svg className="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : historyRecords.length === 0 ? (
              <div className="text-center py-8 text-[11px] text-slate-500 italic">No prior audits recorded.</div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {historyRecords.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setViewingPastReview(item)}
                    className={`w-full text-left p-3 rounded-lg border text-xs flex flex-col gap-1 cursor-pointer transition-all ${
                      viewingPastReview?._id === item._id 
                        ? 'border-primary bg-primary/10 text-white' 
                        : 'border-white/5 bg-white/2 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between w-full font-bold">
                      <span className="truncate max-w-[120px]">{item.projectName}</span>
                      <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded shrink-0">{item.codeQualityScore}% QOS</span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1">
                      Audited {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Selected Past Review Details */}
          <Card className="lg:col-span-2 border-white/5 bg-card/10 p-6 min-h-[300px] flex flex-col justify-center">
            {viewingPastReview ? (
              <div className="flex flex-col gap-6 text-xs text-slate-300 leading-relaxed">
                
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Archived evaluation log</span>
                  <h3 className="text-lg font-black text-white mt-1">{viewingPastReview.projectName} Blueprint</h3>
                  <span className="text-[10px] text-slate-500 block mt-1">Date: {new Date(viewingPastReview.createdAt).toLocaleString()}</span>
                </div>

                {/* Score Chart */}
                <Card className="bg-[#111827]/20 border-white/5 p-4 flex flex-col gap-2">
                  <h4 className="font-bold text-white text-xs border-b border-white/5 pb-1">Cognitive Vector Graph</h4>
                  <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getScoreData(viewingPastReview)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGlowPast" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="metric" stroke="#9CA3AF" fontSize={8} fontWeight="600" />
                        <YAxis stroke="#9CA3AF" fontSize={8} fontWeight="600" domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#151B2D', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}
                          itemStyle={{ fontSize: 10 }}
                        />
                        <Bar dataKey="score" fill="url(#barGlowPast)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Feedback blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                    <span className="font-bold text-white flex items-center gap-1.5"><Layers className="h-4 w-4 text-primary" /> Directory Layout Audit</span>
                    <p className="text-slate-400 mt-1">{viewingPastReview.folderStructureFeedback}</p>
                  </div>
                  <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                    <span className="font-bold text-white flex items-center gap-1.5"><Code className="h-4 w-4 text-indigo-400" /> Naming Styles Analysis</span>
                    <p className="text-slate-400 mt-1">{viewingPastReview.namingConventionFeedback}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1"><ShieldAlert className="h-4 w-4 text-rose-400" /> Vulnerabilities Warnings</span>
                    <ul className="list-disc pl-4 text-slate-400">
                      {viewingPastReview.suggestions?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1"><Zap className="h-4 w-4 text-amber-400" /> Refactoring Action Recommendations</span>
                    <ul className="list-disc pl-4 text-slate-400">
                      {viewingPastReview.refactoringRecommendations?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1"><LayoutList className="h-4 w-4 text-cyan-400" /> Missing Project Features</span>
                    <ul className="list-disc pl-4 text-slate-400">
                      {viewingPastReview.missingFeatures?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1"><Settings className="h-4 w-4 text-primary" /> Roadmap to Production Readiness</span>
                    <ol className="list-decimal pl-4 text-slate-400">
                      {viewingPastReview.improvementRoadmap?.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ol>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center text-slate-500 italic text-xs">
                Select a code audit report from the records index on the left to examine vector chart distributions and recommendations list.
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
};
export default CodeReviewView;
