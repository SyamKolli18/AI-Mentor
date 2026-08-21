import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  HelpCircle, Compass, ArrowRight, DollarSign, 
  BrainCircuit, Columns, Target
} from 'lucide-react';

export const CareerComparison: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [recommendations, setRecommendations] = useState<any[]>(user?.careerRecommendations || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [activeRoadmapCareer, setActiveRoadmapCareer] = useState<string | null>(null);

  const fetchRecommendations = async (force: boolean = false) => {
    if (recommendations.length > 0 && !force) return;
    try {
      setIsLoading(true);
      const res = await api.post('/ai/career-recommendations');
      setRecommendations(res.data.recommendations);
      if (user) {
        updateUser({
          ...user,
          careerRecommendations: res.data.recommendations
        });
      }
    } catch (err: any) {
      toast(err.message || 'Failed to retrieve career tracks.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleToggleCompare = (pathId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(pathId)) {
        return prev.filter(id => id !== pathId);
      }
      if (prev.length >= 2) {
        toast('Select at most 2 career tracks to compare side-by-side.', 'info');
        return [prev[1], pathId];
      }
      return [...prev, pathId];
    });
  };

  const handleGenerateRoadmap = async (careerName: string) => {
    try {
      setIsGeneratingRoadmap(true);
      setActiveRoadmapCareer(careerName);
      await api.post('/ai/generate-roadmap', { targetCareer: careerName });
      toast(`Personalized Roadmap for ${careerName} generated!`, 'success');
      navigate('/roadmaps');
    } catch (err: any) {
      toast(err.message || 'Failed to generate roadmap.', 'error');
    } finally {
      setIsGeneratingRoadmap(false);
      setActiveRoadmapCareer(null);
    }
  };

  const comparedCareers = recommendations.filter(rec => selectedForCompare.includes(rec.pathId));

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div className="border-b border-[#27272A] pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold mb-2">
          <Compass className="h-3.5 w-3.5" /> AI CAREER PATHWAYS
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl flex items-center gap-2">
          Career Path Recommendation Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore recommended engineering tracks evaluated against your student profile vector.
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="h-10 w-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="border-rose-500/30 bg-[#111111] text-center flex flex-col items-center gap-4 py-12 shadow-crimson-glow">
          <HelpCircle className="h-12 w-12 text-rose-500 animate-pulse" />
          <div>
            <h3 className="text-xl font-black text-white">No Career Pathways Generated</h3>
            <p className="text-xs text-slate-400">Trigger AI Profile Analysis first to compile career match vectors.</p>
          </div>
          <Button variant="primary" onClick={() => fetchRecommendations(true)} className="bg-rose-600 hover:bg-rose-500 shadow-glow">
            Generate Career Pathways
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">

          {/* VISUAL CONNECTION TREE DIAGRAM */}
          <div className="p-6 rounded-2xl border border-[#27272A] bg-[#111111] flex flex-col items-center text-center gap-6 relative overflow-hidden shadow-glass">
            <div className="absolute top-0 right-0 h-full w-[35%] bg-glow-crimson pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-white text-xs font-mono font-bold shadow-glow">
              <Target className="h-4 w-4 text-rose-400" /> YOUR STUDENT PROFILE
            </div>

            {/* Tree Branch Visual Lines */}
            <div className="w-full flex justify-center items-center relative my-2">
              <div className="w-4/5 h-[2px] bg-gradient-to-r from-rose-500/20 via-rose-500 to-rose-500/20" />
            </div>

            {/* Branch Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {recommendations.slice(0, 3).map((rec, i) => (
                <div key={rec.pathId || i} className="p-4 rounded-xl border border-[#27272A] bg-[#171717] flex flex-col items-center gap-2">
                  <span className="text-[9px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                    {rec.matchPercentage}% MATCH
                  </span>
                  <h4 className="text-sm font-extrabold text-white">{rec.careerName}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{rec.difficultyLevel} • {rec.estimatedLearningTime}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compare Toolbar */}
          {selectedForCompare.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-rose-500/30 bg-rose-500/10">
              <span className="text-xs text-white font-bold flex items-center gap-2">
                <Columns className="h-4 w-4 text-rose-400" /> 
                {selectedForCompare.length} of 2 tracks selected for side-by-side comparison.
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedForCompare([])}
                className="text-slate-400 hover:text-white text-xs"
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => {
              const isSelectedForCompare = selectedForCompare.includes(rec.pathId);
              return (
                <Card 
                  key={rec.pathId} 
                  hoverEffect 
                  className={`flex flex-col justify-between items-start gap-6 bg-[#111111] border ${
                    isSelectedForCompare ? 'border-rose-500/60 bg-rose-500/10 shadow-crimson-glow' : 'border-[#27272A]'
                  }`}
                >
                  <div className="w-full flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">RECOMMENDED PATH</span>
                      <h4 className="text-lg font-black text-white mt-0.5">{rec.careerName}</h4>
                    </div>
                    <div className="h-11 w-11 rounded-full border border-rose-500/40 bg-rose-500/20 flex items-center justify-center font-black text-xs text-rose-400 font-mono shadow-glow">
                      {rec.matchPercentage}%
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed text-left min-h-[50px]">
                    <strong className="text-rose-400 font-bold block mb-1">Why It Matches:</strong>
                    {rec.whyMatches}
                  </p>

                  <div className="flex flex-col gap-2.5 w-full text-left text-xs border-t border-[#27272A] pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Difficulty Level:</span>
                      <span className="text-white font-bold bg-[#171717] border border-[#27272A] px-2 py-0.5 rounded font-mono">{rec.difficultyLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Estimated Time:</span>
                      <span className="text-white font-bold font-mono">{rec.estimatedLearningTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Industry Demand:</span>
                      <span className="text-amber-400 font-bold font-mono">{rec.averageIndustryDemand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Est. Salary:</span>
                      <span className="text-emerald-400 font-extrabold font-mono flex items-center">
                        <DollarSign className="h-3 w-3" />
                        {(rec.expectedSalaryRange.min / 1000).toFixed(0)}k - {(rec.expectedSalaryRange.max / 1000).toFixed(0)}k / yr
                      </span>
                    </div>

                    {/* Skill Gap Breakdown */}
                    <div className="mt-2 flex flex-col gap-2 bg-[#050505] p-3 rounded-lg border border-[#27272A]">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">Current Strengths:</span>
                        <div className="flex flex-wrap gap-1">
                          {(rec.requiredSkills?.filter((s: string) => !rec.currentSkillGap?.includes(s)) || ['Core logic']).map((st: string) => (
                            <span key={st} className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                              ✓ {st}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-1">
                        <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block mb-1">Skill Gaps To Bridge:</span>
                        <div className="flex flex-wrap gap-1">
                          {(rec.currentSkillGap || ['Advanced framework patterns']).map((gap: string) => (
                            <span key={gap} className="text-[9px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded font-mono">
                              ⚡ {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 w-full mt-2">
                    <Button 
                      variant="glass" 
                      size="sm" 
                      onClick={() => handleToggleCompare(rec.pathId)}
                      className={`flex-1 text-xs border-[#27272A] ${
                        isSelectedForCompare ? 'bg-rose-600/30 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSelectedForCompare ? 'Compare ✔' : 'Compare'}
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      isLoading={isGeneratingRoadmap && activeRoadmapCareer === rec.careerName}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      onClick={() => handleGenerateRoadmap(rec.careerName)}
                      className="flex-1 text-xs bg-rose-600 hover:bg-rose-500 shadow-crimson-glow"
                    >
                      Build Map
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Side-by-side comparison view */}
          {selectedForCompare.length === 2 && comparedCareers.length === 2 && (
            <Card className="bg-[#111111] border-[#27272A] relative overflow-hidden shadow-glass">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                  <BrainCircuit className="h-5 w-5 text-rose-500" /> Side-by-Side Track Comparison
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Direct comparison between the two selected pathways.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272A]">
                      <th className="pb-3 text-slate-500 font-semibold w-[20%]">Metric</th>
                      <th className="pb-3 text-white font-bold w-[40%] text-left">{comparedCareers[0].careerName}</th>
                      <th className="pb-3 text-white font-bold w-[40%] text-left">{comparedCareers[1].careerName}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Match Percentage</td>
                      <td className="py-3 font-bold text-rose-400 font-mono">{comparedCareers[0].matchPercentage}%</td>
                      <td className="py-3 font-bold text-rose-400 font-mono">{comparedCareers[1].matchPercentage}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Difficulty</td>
                      <td className="py-3 text-white font-mono">{comparedCareers[0].difficultyLevel}</td>
                      <td className="py-3 text-white font-mono">{comparedCareers[1].difficultyLevel}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Skill Gaps</td>
                      <td className="py-3 text-slate-300 pr-4">
                        <ul className="list-disc pl-4 flex flex-col gap-1 text-[11px]">
                          {comparedCareers[0].currentSkillGap.map((s: string) => <li key={s}>{s}</li>)}
                        </ul>
                      </td>
                      <td className="py-3 text-slate-300 pr-4">
                        <ul className="list-disc pl-4 flex flex-col gap-1 text-[11px]">
                          {comparedCareers[1].currentSkillGap.map((s: string) => <li key={s}>{s}</li>)}
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Est. Time</td>
                      <td className="py-3 text-white font-mono">{comparedCareers[0].estimatedLearningTime}</td>
                      <td className="py-3 text-white font-mono">{comparedCareers[1].estimatedLearningTime}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </div>
  );
};
export default CareerComparison;
