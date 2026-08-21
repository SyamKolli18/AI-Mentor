import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Brain, Sparkles, Lightbulb, Code, 
  CheckCircle2, AlertCircle, ArrowRight, RefreshCw, 
  HelpCircle, Check, PlayCircle, Award
} from 'lucide-react';

export const LearningView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const topicParam = searchParams.get('topic') || 'JavaScript Promises & Async/Await';
  const moduleParam = searchParams.get('module') || 'Core Fundamentals';

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [explainTeachData, setExplainTeachData] = useState<any>(null);
  const [practiceData, setPracticeData] = useState<any>(null);
  const [studentConceptAnswer, setStudentConceptAnswer] = useState('');
  const [selectedMcqAnswer, setSelectedMcqAnswer] = useState<number | null>(null);
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [adaptiveData, setAdaptiveData] = useState<any>(null);

  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const fetchLearningData = async () => {
    try {
      setIsLoading(true);
      
      const teachRes = await api.post('/ai/learn/explain-teach', {
        topicTitle: topicParam,
        moduleTitle: moduleParam
      });
      setExplainTeachData(teachRes.data.data);

      const practiceRes = await api.post('/ai/learn/practice', {
        topicTitle: topicParam
      });
      setPracticeData(practiceRes.data.data);

    } catch (err: any) {
      toast(err.message || 'Failed to initialize AI Learning System.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, [topicParam, moduleParam]);

  const handleEvaluateAnswer = async () => {
    if (!studentConceptAnswer.trim()) {
      toast('Please write your answer before submitting.', 'info');
      return;
    }

    try {
      setIsSubmittingAnswer(true);
      const question = practiceData?.conceptQuestions?.[0]?.question || `Explain the mechanics of ${topicParam}.`;

      const evalRes = await api.post('/ai/learn/evaluate', {
        question,
        studentAnswer: studentConceptAnswer
      });
      setEvaluationData(evalRes.data.data);

      const adaptiveRes = await api.post('/ai/learn/adaptive-decision', {
        topicTitle: topicParam,
        quizScore: evalRes.data.data.score >= 70 ? 2 : 1,
        totalQuestions: 2
      });
      setAdaptiveData(adaptiveRes.data.data);

      setCurrentStep(4);
      toast('AI Evaluation complete!', 'success');
    } catch (err: any) {
      toast(err.message || 'Evaluation failed.', 'error');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> INTERACTIVE AI TUTOR
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl flex items-center gap-2">
            {topicParam}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Module Target: <span className="font-semibold text-rose-400">{moduleParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="glass" 
            size="sm" 
            onClick={() => navigate('/roadmaps')}
            className="text-xs border-[#27272A] text-slate-300 hover:text-white"
          >
            ← Back to Roadmap
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={fetchLearningData} 
            isLoading={isLoading}
            className="text-xs bg-rose-600 hover:bg-rose-500 shadow-glow"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reload Topic
          </Button>
        </div>
      </div>

      {/* 6-STEP WORKFLOW TRACKER */}
      <div className="grid grid-cols-6 gap-2 bg-[#111111] border border-[#27272A] p-2 rounded-xl text-center text-xs">
        {[
          { num: 1, label: '1. EXPLAIN' },
          { num: 2, label: '2. TEACH' },
          { num: 3, label: '3. PRACTICE' },
          { num: 4, label: '4. EVALUATE' },
          { num: 5, label: '5. FEEDBACK' },
          { num: 6, label: '6. NEXT ACTION' },
        ].map((step) => {
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;
          return (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num as any)}
              className={`py-2 px-1 rounded-lg font-mono font-bold transition-all cursor-pointer truncate ${
                isActive
                  ? 'bg-rose-600 text-white shadow-crimson-glow'
                  : isDone
                  ? 'bg-[#171717] text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#050505] text-slate-500 hover:text-slate-200'
              }`}
            >
              {isDone ? `✓ ${step.label.split('. ')[1]}` : step.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <Card className="p-12 text-center bg-[#111111] border-[#27272A] flex flex-col items-center gap-4 shadow-glass">
          <div className="h-10 w-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">AI Tutor is generating tailored lessons for {topicParam}...</span>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">

          {/* STEP 1: EXPLAIN */}
          {currentStep === 1 && explainTeachData && (
            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col gap-6 shadow-glass">
              <div className="flex items-center gap-3 border-b border-[#27272A] pb-3">
                <Brain className="h-6 w-6 text-rose-400" />
                <div>
                  <h2 className="text-xl font-black text-white">1. Concept Explanation</h2>
                  <p className="text-xs text-slate-400">Explained specifically at your student experience level.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-[#171717] p-4 rounded-xl border border-[#27272A] leading-relaxed text-sm text-slate-200">
                  <strong className="text-rose-400 font-bold block mb-1">Simple Explanation:</strong>
                  {explainTeachData.simpleExplanation}
                </div>

                <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-xs text-slate-200">
                  <strong className="text-rose-300 font-bold block mb-1">Why It Matters:</strong>
                  {explainTeachData.whyItMatters}
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Key Takeaways:</h4>
                  <ul className="flex flex-col gap-2">
                    {explainTeachData.keyTakeaways?.map((takeaway: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-[#171717] p-3 rounded-lg border border-[#27272A]">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#27272A]">
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentStep(2)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-glow"
                >
                  Proceed to Step 2: Teach
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: TEACH */}
          {currentStep === 2 && explainTeachData && (
            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col gap-6 shadow-glass">
              <div className="flex items-center gap-3 border-b border-[#27272A] pb-3">
                <Lightbulb className="h-6 w-6 text-amber-400" />
                <div>
                  <h2 className="text-xl font-black text-white">2. Analogies & Code Examples</h2>
                  <p className="text-xs text-slate-400">Real-world scenarios and runnable code snippets.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-xs text-slate-200">
                  <strong className="text-amber-300 font-bold block mb-1 text-sm flex items-center gap-1.5">
                    💡 Real-World Analogy:
                  </strong>
                  {explainTeachData.realWorldAnalogy}
                </div>

                {explainTeachData.codeExample && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="h-4 w-4 text-rose-400" /> Runnable Code Example:
                    </span>
                    <pre className="bg-[#050505] p-4 rounded-xl border border-[#27272A] text-xs font-mono text-emerald-400 overflow-x-auto">
                      <code>{explainTeachData.codeExample}</code>
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-[#27272A]">
                <Button variant="glass" onClick={() => setCurrentStep(1)}>
                  ← Back to Explain
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentStep(3)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-glow"
                >
                  Proceed to Step 3: Practice
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: PRACTICE */}
          {currentStep === 3 && practiceData && (
            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col gap-6 shadow-glass">
              <div className="flex items-center gap-3 border-b border-[#27272A] pb-3">
                <HelpCircle className="h-6 w-6 text-rose-400" />
                <div>
                  <h2 className="text-xl font-black text-white">3. Practice Exercises & Reflection</h2>
                  <p className="text-xs text-slate-400">Test your understanding with MCQs and concept answers.</p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {practiceData.mcqs && practiceData.mcqs.length > 0 && (
                  <div className="flex flex-col gap-3 bg-[#171717] p-4 rounded-xl border border-[#27272A]">
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">MULTIPLE CHOICE QUESTION</span>
                    <h4 className="text-sm font-bold text-white">{practiceData.mcqs[0].question}</h4>
                    
                    <div className="flex flex-col gap-2 mt-1">
                      {practiceData.mcqs[0].options?.map((opt: string, optIdx: number) => (
                        <button
                          key={optIdx}
                          onClick={() => setSelectedMcqAnswer(optIdx)}
                          className={`p-3 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                            selectedMcqAnswer === optIdx
                              ? 'bg-rose-600 text-white border-rose-400 font-bold shadow-glow'
                              : 'bg-[#050505] text-slate-300 border-[#27272A] hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {selectedMcqAnswer !== null && (
                      <div className="mt-2 p-3 rounded-lg bg-[#050505] border border-[#27272A] text-xs">
                        {selectedMcqAnswer === practiceData.mcqs[0].answerIndex ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="h-4 w-4" /> Correct! {practiceData.mcqs[0].explanation}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" /> Incorrect. Try another choice or review Step 2.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3 bg-[#171717] p-4 rounded-xl border border-[#27272A]">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">CONCEPT REFLECTION QUESTION</span>
                  <h4 className="text-sm font-bold text-white">
                    {practiceData.conceptQuestions?.[0]?.question || `Explain in your own words how ${topicParam} works.`}
                  </h4>
                  <textarea
                    rows={4}
                    value={studentConceptAnswer}
                    onChange={(e) => setStudentConceptAnswer(e.target.value)}
                    placeholder="Write your explanation here..."
                    className="w-full bg-[#050505] border border-[#27272A] rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#27272A]">
                <Button variant="glass" onClick={() => setCurrentStep(2)}>
                  ← Back to Teach
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleEvaluateAnswer}
                  isLoading={isSubmittingAnswer}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-glow"
                >
                  Submit & Evaluate
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4 & 5: EVALUATE & FEEDBACK */}
          {(currentStep === 4 || currentStep === 5) && evaluationData && (
            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col gap-6 shadow-glass">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-emerald-400" />
                  <div>
                    <h2 className="text-xl font-black text-white">4 & 5. AI Evaluation & Constructive Feedback</h2>
                    <p className="text-xs text-slate-400">Detailed breakdown of correct understanding and gaps.</p>
                  </div>
                </div>

                <div className="h-14 w-14 rounded-full border-2 border-rose-500 bg-rose-500/20 flex flex-col items-center justify-center font-black text-white font-mono shadow-glow">
                  <span className="text-base">{evaluationData.score}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex flex-col gap-2">
                  <strong className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Correct Understanding:
                  </strong>
                  <ul className="flex flex-col gap-1.5 text-xs text-slate-200">
                    {evaluationData.correctUnderstanding?.map((item: string, idx: number) => (
                      <li key={idx}>✓ {item}</li>
                    )) || <li>Answer demonstrates valid reasoning.</li>}
                  </ul>
                </div>

                <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 flex flex-col gap-2">
                  <strong className="text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Misconceptions & Gaps:
                  </strong>
                  <ul className="flex flex-col gap-1.5 text-xs text-slate-200">
                    {evaluationData.misconceptions?.map((item: string, idx: number) => (
                      <li key={idx}>⚠️ {item}</li>
                    ))}
                    {evaluationData.missingConcepts?.map((item: string, idx: number) => (
                      <li key={idx}>⚡ Missing: {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-2 bg-[#171717] p-4 rounded-xl border border-[#27272A] text-xs text-slate-200 leading-relaxed">
                  <strong className="text-rose-400 font-bold block mb-1">AI Mentor Feedback:</strong>
                  {evaluationData.feedbackText}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#27272A]">
                <Button variant="glass" onClick={() => setCurrentStep(3)}>
                  ← Back to Practice
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentStep(6)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-glow"
                >
                  Step 6: Next Action
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 6: NEXT ACTION */}
          {currentStep === 6 && (
            <Card className="bg-[#111111] border-[#27272A] p-6 flex flex-col gap-6 shadow-glass">
              <div className="flex items-center gap-3 border-b border-[#27272A] pb-3">
                <PlayCircle className="h-6 w-6 text-rose-500" />
                <div>
                  <h2 className="text-xl font-black text-white">6. Adaptive Mentor Engine — Next Recommendation</h2>
                  <p className="text-xs text-slate-400">Determines your next adaptive step based on topic mastery.</p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#171717] p-5 rounded-xl border border-[#27272A] gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">TOPIC ASSESSMENT STATUS</span>
                    <h3 className="text-xl font-extrabold text-white">{adaptiveData?.status || 'Strong topic mastery'}</h3>
                    <p className="text-xs text-slate-300 max-w-lg mt-1">
                      {adaptiveData?.recommendationReason || 'You have demonstrated solid comprehension. Ready to unlock next module.'}
                    </p>
                  </div>

                  <div className="bg-rose-600/20 border border-rose-500/40 p-4 rounded-xl text-center shrink-0">
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase block mb-1">Recommended Action</span>
                    <span className="text-base font-black text-white px-4 py-1.5 bg-rose-600 rounded-lg inline-block font-mono">
                      {adaptiveData?.nextAction || 'Continue Roadmap'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#27272A]">
                <Button variant="glass" onClick={() => setCurrentStep(4)}>
                  ← Back to Feedback
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/roadmaps')}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-glow"
                >
                  Return to Roadmap & Continue
                </Button>
              </div>
            </Card>
          )}

        </div>
      )}
    </div>
  );
};
export default LearningView;
