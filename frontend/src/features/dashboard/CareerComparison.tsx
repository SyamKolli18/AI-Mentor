import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  HelpCircle, Compass, ArrowRight, DollarSign, 
  BrainCircuit, Columns 
} from 'lucide-react';

export const CareerComparison: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [recommendations, setRecommendations] = useState<any[]>(user?.careerRecommendations || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  
  // Comparative State
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
        // limit to 2
        toast('Select at most 2 career tracks to compare.', 'info');
        return [prev[1], pathId];
      }
      return [...prev, pathId];
    });
  };

  const handleGenerateRoadmap = async (careerName: string) => {
    try {
      setIsGeneratingRoadmap(true);
      setActiveRoadmapCareer(careerName);
      const res = await api.post('/ai/generate-roadmap', { targetCareer: careerName });
      toast(`Personalized Roadmap version ${res.data.roadmap.version} initialized!`, 'success');
      navigate('/dashboard'); // Route back to overview, or we can route directly to RoadmapView
    } catch (err: any) {
      toast(err.message || 'Failed to generate roadmap.', 'error');
    } finally {
      setIsGeneratingRoadmap(false);
      setActiveRoadmapCareer(null);
    }
  };

  const comparedCareers = recommendations.filter(rec => selectedForCompare.includes(rec.pathId));

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          AI Career Path Predictor <Compass className="h-6 w-6 text-primary animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Compare recommended engineering tracks matched to your logical scores, current skills, and interests.
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="border-indigo-500/20 bg-indigo-500/5 text-center flex flex-col items-center gap-4 py-12">
          <HelpCircle className="h-10 w-10 text-primary animate-pulse" />
          <div>
            <h3 className="text-lg font-bold text-white">No Predictions Found</h3>
            <p className="text-xs text-slate-400">Please trigger AI Profile Analysis first to compile scores.</p>
          </div>
          <Button variant="primary" onClick={() => fetchRecommendations(true)}>
            Fetch Recommendations
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Compare Toolbar */}
          {selectedForCompare.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in duration-200">
              <span className="text-xs text-slate-200 font-semibold flex items-center gap-2">
                <Columns className="h-4.5 w-4.5 text-primary" /> 
                {selectedForCompare.length} of 2 tracks selected for comparison.
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedForCompare([])}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
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
                  className={`flex flex-col justify-between items-start gap-6 bg-[#18120F] border ${
                    isSelectedForCompare ? 'border-orange-500/50 bg-orange-500/10' : 'border-[#3A2720]'
                  }`}
                >
                  <div className="w-full flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Recommendation</span>
                      <h4 className="text-lg font-bold text-stone-50 mt-0.5">{rec.careerName}</h4>
                    </div>
                    {/* Match percentage node */}
                    <div className="h-11 w-11 rounded-full border border-orange-500/30 bg-orange-500/10 flex items-center justify-center font-bold text-xs text-orange-400 shadow-glow">
                      {rec.matchPercentage}%
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed text-left min-h-[50px]">
                    <strong className="text-orange-400 font-bold block mb-1">Why It Matches You:</strong>
                    {rec.whyMatches}
                  </p>

                  <div className="flex flex-col gap-2.5 w-full text-left text-xs border-t border-[#3A2720] pt-4">
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Difficulty Level:</span>
                      <span className="text-stone-100 font-bold bg-[#211712] border border-[#3A2720] px-2 py-0.5 rounded">{rec.difficultyLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Expected Learning Path:</span>
                      <span className="text-stone-100 font-bold">{rec.estimatedLearningTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Industry Demand:</span>
                      <span className="text-amber-400 font-bold">{rec.averageIndustryDemand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Salary Range:</span>
                      <span className="text-emerald-400 font-extrabold flex items-center">
                        <DollarSign className="h-3 w-3" />
                        {(rec.expectedSalaryRange.min / 1000).toFixed(0)}k - {(rec.expectedSalaryRange.max / 1000).toFixed(0)}k / yr
                      </span>
                    </div>

                    {/* Strengths & Missing Skills Breakdown */}
                    <div className="mt-2 flex flex-col gap-2 bg-[#0C0A09] p-3 rounded-lg border border-[#3A2720]">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Current Strengths:</span>
                        <div className="flex flex-wrap gap-1">
                          {(rec.requiredSkills?.filter((s: string) => !rec.currentSkillGap?.includes(s)) || ['Core logic']).map((st: string) => (
                            <span key={st} className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                              ✓ {st}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-1">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Missing Skills & Next Steps:</span>
                        <div className="flex flex-wrap gap-1">
                          {(rec.currentSkillGap || ['Advanced framework patterns']).map((gap: string) => (
                            <span key={gap} className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                              ⚡ {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 w-full mt-2">
                    <Button 
                      variant="glass" 
                      size="sm" 
                      onClick={() => handleToggleCompare(rec.pathId)}
                      className={`flex-1 text-xs border-white/5 ${
                        isSelectedForCompare ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-white'
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
                      className="flex-1 text-xs shadow-glow shadow-primary/10"
                    >
                      Generate Map
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Comparative Grid View */}
          {selectedForCompare.length === 2 && comparedCareers.length === 2 && (
            <Card className="bg-card/5 border-primary/20 relative overflow-hidden animate-in slide-in-from-bottom-5 duration-350">
              <div className="absolute top-0 right-0 h-full w-[35%] bg-glow-gradient opacity-20 blur-[50px] pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-accent" /> Side-by-Side Path Comparison
                </CardTitle>
                <CardDescription className="text-xs">
                  Direct evaluation of the two chosen career routes matching your onboarding profiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-3 text-slate-500 font-semibold w-[20%]">Metric</th>
                      <th className="pb-3 text-white font-bold w-[40%] text-left">{comparedCareers[0].careerName}</th>
                      <th className="pb-3 text-white font-bold w-[40%] text-left">{comparedCareers[1].careerName}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Match Rate</td>
                      <td className="py-3 font-bold text-primary">{comparedCareers[0].matchPercentage}%</td>
                      <td className="py-3 font-bold text-primary">{comparedCareers[1].matchPercentage}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Difficulty</td>
                      <td className="py-3 text-slate-200">{comparedCareers[0].difficultyLevel}</td>
                      <td className="py-3 text-slate-200">{comparedCareers[1].difficultyLevel}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Gaps Evaluated</td>
                      <td className="py-3 text-slate-300 pr-4">
                        <ul className="list-disc pl-4 flex flex-col gap-1">
                          {comparedCareers[0].currentSkillGap.map((s: string) => <li key={s}>{s}</li>)}
                        </ul>
                      </td>
                      <td className="py-3 text-slate-300 pr-4">
                        <ul className="list-disc pl-4 flex flex-col gap-1">
                          {comparedCareers[1].currentSkillGap.map((s: string) => <li key={s}>{s}</li>)}
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Est. Syllabus Time</td>
                      <td className="py-3 text-slate-200">{comparedCareers[0].estimatedLearningTime}</td>
                      <td className="py-3 text-slate-200">{comparedCareers[1].estimatedLearningTime}</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Market Salaries</td>
                      <td className="py-3 text-emerald-400 font-medium">
                        ${(comparedCareers[0].expectedSalaryRange.min / 1000).toFixed(0)}k - ${(comparedCareers[0].expectedSalaryRange.max / 1000).toFixed(0)}k
                      </td>
                      <td className="py-3 text-emerald-400 font-medium">
                        ${(comparedCareers[1].expectedSalaryRange.min / 1000).toFixed(0)}k - ${(comparedCareers[1].expectedSalaryRange.max / 1000).toFixed(0)}k
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-400">Suggested Start</td>
                      <td className="py-3 text-slate-300 leading-relaxed pr-4">{comparedCareers[0].suggestedStartingPoint}</td>
                      <td className="py-3 text-slate-300 leading-relaxed pr-4">{comparedCareers[1].suggestedStartingPoint}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Recalculate options */}
          <div className="flex justify-end mt-2">
            <Button variant="glass" onClick={() => fetchRecommendations(true)} isLoading={isLoading} className="text-xs">
              Re-evaluate Career Tracks
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default CareerComparison;
