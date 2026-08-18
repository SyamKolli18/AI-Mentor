import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Sparkles, Folder, Save, Bookmark, BookmarkCheck, CheckCircle2, 
  Image as ImageIcon, Sliders, PenTool, 
  BookOpen, Clock, FileCode, CheckSquare, Server, Rocket, ChevronRight, X, Terminal
} from 'lucide-react';

export const ProjectRecommendationsView: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved' | 'completed'>('recommended');
  
  // Selected project for details modal
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  // Input fields for current selected project progress
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [reflections, setReflections] = useState<string>('');
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects/recommendations');
      if (res.data.status === 'success') {
        setRecommendations(res.data.recommendations);
      }
    } catch (err: any) {
      toast(err.message || 'Failed to retrieve project options.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleSave = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.post(`/projects/${id}/save`);
      if (res.data.status === 'success') {
        toast(res.data.message, 'success');
        
        // Update local state list
        setRecommendations(prev => prev.map(p => p._id === id ? res.data.project : p));
        
        // Sync selected modal view details if open
        if (selectedProject?._id === id) {
          setSelectedProject(res.data.project);
        }
      }
    } catch (err: any) {
      toast(err.message || 'Action failed.', 'error');
    }
  };

  const handleToggleBookmark = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.post(`/projects/${id}/bookmark`);
      if (res.data.status === 'success') {
        toast(res.data.message, 'success');
        setRecommendations(prev => prev.map(p => p._id === id ? res.data.project : p));
        if (selectedProject?._id === id) {
          setSelectedProject(res.data.project);
        }
      }
    } catch (err: any) {
      toast('Failed to toggle bookmark.', 'error');
    }
  };

  const handleOpenDetails = (project: any) => {
    setSelectedProject(project);
    setCompletionPercentage(project.completionPercentage || 0);
    setReflections(project.reflections || '');
    setRepoUrl(project.repoUrl || '');
    setScreenshotUrl('');
  };

  const handleSaveProgress = async () => {
    if (!selectedProject) return;
    try {
      setSaving(true);
      
      // Save slider & reflections
      await api.post(`/projects/${selectedProject._id}/progress`, {
        completionPercentage,
        reflections
      });

      // Save repository url and screenshot if inputted
      if (repoUrl !== selectedProject.repoUrl || screenshotUrl) {
        await api.post(`/projects/${selectedProject._id}/upload`, {
          repoUrl,
          screenshotUrl: screenshotUrl || undefined
        });
      }

      toast('Project modifications saved successfully!', 'success');
      fetchProjects();
      setSelectedProject(null);
    } catch (err: any) {
      toast(err.message || 'Failed to submit modifications.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredProjects = recommendations.filter(p => {
    if (activeTab === 'saved') return p.status === 'saved';
    if (activeTab === 'completed') return p.status === 'completed';
    return p.status === 'recommended'; // default pool
  });

  const getDifficultyColor = (diff: string) => {
    const d = diff.toLowerCase();
    if (d === 'beginner') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (d === 'intermediate') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (d === 'advanced') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20'; // Expert
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          AI Project Recommendations <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Portfolio-grade systems calculated specifically to bridge your current skill gaps and maximize recruitment scores.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 pb-2 gap-4">
        {[
          { id: 'recommended', label: 'All Recommendations' },
          { id: 'saved', label: 'Saved Projects' },
          { id: 'completed', label: 'Completed Portfolio' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`text-xs font-semibold py-2 px-1 relative transition-colors cursor-pointer ${
              activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-indigo-500/20 bg-indigo-500/5 text-center flex flex-col items-center gap-4 py-12">
          <Folder className="h-10 w-10 text-slate-500 animate-pulse" />
          <div>
            <h3 className="text-lg font-bold text-white">No Projects Found</h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'saved' 
                ? 'Save recommended projects from the recommendation deck to track execution progress.' 
                : activeTab === 'completed' 
                ? 'Complete your saved projects at 100% to display them in your portfolio.' 
                : 'Configure onboarding preferences to receive custom developer specifications.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <Card 
              key={p._id} 
              hoverEffect 
              onClick={() => handleOpenDetails(p)}
              className="flex flex-col justify-between items-start gap-4 border-white/5 bg-card/10 cursor-pointer relative group"
            >
              {/* Top Icons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={(e) => handleToggleBookmark(p._id, e)}
                  className="text-slate-500 hover:text-amber-400 cursor-pointer transition-colors"
                >
                  {p.bookmarked ? (
                    <BookmarkCheck className="h-4.5 w-4.5 text-amber-400" />
                  ) : (
                    <Bookmark className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>

              {/* Card Body */}
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex flex-wrap gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getDifficultyColor(p.difficulty)}`}>
                    {p.difficulty}
                  </span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 border border-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {p.estimatedDuration}
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-base mt-1 group-hover:text-primary transition-colors">
                  {p.projectName}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {p.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.requiredTechnologies?.slice(0, 3).map((t: string) => (
                    <span key={t} className="bg-white/5 text-[9px] text-slate-300 px-2 py-0.5 rounded border border-white/5">
                      {t}
                    </span>
                  ))}
                  {p.requiredTechnologies?.length > 3 && (
                    <span className="bg-white/5 text-[9px] text-slate-500 px-2 py-0.5 rounded">
                      +{p.requiredTechnologies.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Slider (Only if saved/completed) */}
              {(p.status === 'saved' || p.status === 'completed') && (
                <div className="w-full flex flex-col gap-1.5 mt-2 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Task Completion</span>
                    <span className="font-bold text-white">{p.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${p.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'} rounded-full`}
                      style={{ width: `${p.completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="w-full mt-2">
                <Button 
                  variant="outline" 
                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(p); }}
                  className="w-full justify-between text-xs h-9 border-white/10 group-hover:bg-primary/5 hover:border-primary/30"
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Configure Spec
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* DETAILED BLUEPRINT MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <Card className="max-w-4xl w-full border-white/5 bg-slate-950/90 shadow-glow relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/5 p-6 shrink-0 bg-slate-900/40">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyColor(selectedProject.difficulty)}`}>
                    {selectedProject.difficulty}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {selectedProject.estimatedDuration}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-2">{selectedProject.projectName}</h2>
              </div>
              
              <button 
                onClick={() => setSelectedProject(null)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-300 leading-relaxed">
              
              {/* Section 1: Overview & Value Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#111827]/40 border-violet-500/10 p-4">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1.5"><PenTool className="h-4 w-4 text-violet-400" /> Resume Impact</h4>
                  <p className="text-[10.5px] text-slate-400">{selectedProject.resumeValue}</p>
                </Card>
                <Card className="bg-[#111827]/40 border-indigo-500/10 p-4">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1.5"><Sparkles className="h-4 w-4 text-indigo-400" /> Portfolio Value</h4>
                  <p className="text-[10.5px] text-slate-400">{selectedProject.portfolioValue}</p>
                </Card>
                <Card className="bg-[#111827]/40 border-purple-500/10 p-4">
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-1.5"><Folder className="h-4 w-4 text-purple-400" /> Recruiter Appeal</h4>
                  <p className="text-[10.5px] text-slate-400">{selectedProject.recruiterValue}</p>
                </Card>
              </div>

              {/* Section 2: Technical Specifications & Directory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Folder Structure */}
                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5"><FileCode className="h-4 w-4 text-primary" /> Directory Architecture</h4>
                  <pre className="bg-[#070514] border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre">
                    {selectedProject.folderStructure}
                  </pre>
                </div>

                {/* DB Schema */}
                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5"><Server className="h-4 w-4 text-emerald-400" /> Database & API Suggestions</h4>
                  <div className="bg-[#070514] border border-white/5 rounded-xl p-4 flex flex-col gap-3 h-full">
                    <div>
                      <span className="font-bold text-slate-200 block mb-1">Database Model Design:</span>
                      <p className="text-slate-400 text-[10.5px]">{selectedProject.databaseDesign}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block mb-1">Suggested API Endpoints:</span>
                      <ul className="list-disc pl-4 text-slate-400 text-[10.5px] flex flex-col gap-0.5">
                        {selectedProject.apiSuggestions?.map((api: string, idx: number) => (
                          <li key={idx} className="font-mono">{api}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Outcomes and Stretch Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-2"><BookOpen className="h-4 w-4 text-cyan-400" /> Learning Outcomes</h4>
                  <ul className="list-disc pl-4 flex flex-col gap-1.5 text-slate-400">
                    {selectedProject.learningOutcomes?.map((o: string, idx: number) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5 mb-2"><CheckSquare className="h-4 w-4 text-amber-400" /> Stretch Challenges</h4>
                  <ul className="list-disc pl-4 flex flex-col gap-1.5 text-slate-400">
                    {selectedProject.stretchGoals?.map((g: string, idx: number) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Deployment Guide */}
              <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-1.5">
                <h4 className="font-bold text-white flex items-center gap-1.5"><Rocket className="h-4 w-4 text-accent" /> Deployment Guide</h4>
                <p className="text-slate-400 text-[10.5px]">{selectedProject.deploymentGuide}</p>
              </div>

              {/* Interactive controls (Visible if Saved/In-Progress) */}
              <div className="border-t border-white/5 pt-6 mt-2 flex flex-col gap-5">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Sliders className="h-4.5 w-4.5 text-primary" /> Track Invoicing Progress
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Slider Progress */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Completion Percentage</span>
                      <span className="text-primary font-bold">{completionPercentage}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={completionPercentage} 
                      onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                      className="w-full accent-primary bg-white/10 rounded-lg cursor-pointer h-2.5 mt-1"
                    />
                    <span className="text-[10px] text-slate-500 mt-1">Increase percentage as you configure routing, controllers, and screens.</span>
                  </div>

                  {/* GitHub Repo */}
                  <div className="flex flex-col gap-1">
                    <Input 
                      label="Connect GitHub Repository"
                      placeholder="https://github.com/username/project-repo"
                      leftIcon={<Terminal className="h-4.5 w-4.5" />}
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reflections */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Engineering Reflection Journal</label>
                    <textarea
                      placeholder="Note down architectural decisions, bottlenecks encountered, and design fixes..."
                      value={reflections}
                      onChange={(e) => setReflections(e.target.value)}
                      className="w-full h-24 bg-slate-950/40 border border-white/5 text-foreground rounded-lg p-3 text-xs focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10"
                    />
                  </div>

                  {/* Screenshots uploads */}
                  <div className="flex flex-col gap-3">
                    <Input 
                      label="Simulate UI Screenshot Upload"
                      placeholder="Paste image link, e.g. https://imgur.com/image.png"
                      leftIcon={<ImageIcon className="h-4.5 w-4.5" />}
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                    />

                    {selectedProject.screenshots?.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Uploaded Screenshots:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.screenshots.map((url: string, index: number) => (
                            <a 
                              key={index} 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="h-12 w-20 border border-white/10 bg-slate-900 rounded overflow-hidden flex items-center justify-center hover:border-primary/45 transition-colors shrink-0"
                            >
                              <img src={url} alt="Screenshot" className="h-full w-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="border-t border-white/5 p-6 bg-slate-900/40 flex items-center justify-between shrink-0">
              <Button
                variant={selectedProject.status === 'saved' ? 'primary' : 'outline'}
                onClick={() => handleToggleSave(selectedProject._id)}
                className="text-xs h-9 font-bold"
                leftIcon={selectedProject.status === 'saved' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              >
                {selectedProject.status === 'saved' ? 'Saved (Track Active)' : 'Save Blueprint'}
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedProject(null)}
                  className="text-xs h-9 border border-white/5 font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={handleSaveProgress}
                  isLoading={saving}
                  className="text-xs h-9 bg-gradient-to-r from-violet-600 to-indigo-600 border-none hover:shadow-glow shadow-violet-500/20"
                >
                  Save Progress
                </Button>
              </div>
            </div>

          </Card>
        </div>
      )}

    </div>
  );
};
export default ProjectRecommendationsView;
