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
  
  // Phase E AI Learning States
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
      
      // 1. Fetch Explain & Teach content
      const teachRes = await api.post('/ai/learn/explain-teach', {
        topicTitle: topicParam,
        moduleTitle: moduleParam
      });
      setExplainTeachData(teachRes.data.data);

      // 2. Fetch Practice Questions
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

      // Evaluate
      const evalRes = await api.post('/ai/learn/evaluate', {
        question,
        studentAnswer: studentConceptAnswer
      });
      setEvaluationData(evalRes.data.data);

      // Trigger Adaptive Mentor Engine Decision
      const adaptiveRes = await api.post('/ai/learn/adaptive-decision', {
        topicTitle: topicParam,
        quizScore: evalRes.data.data.score >= 70 ? 2 : 1,
        totalQuestions: 2
      });
      setAdaptiveData(adaptiveRes.data.data);

      setCurrentStep(4); // Move to Evaluate & Feedback
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A2720] pb-5">
        <div>
          <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Interactive AI Tutor
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-50 md:text-3xl mt-1 flex items-center gap-2">
            {topicParam} <Sparkles className="h-6 w-6 text-orange-400 animate-pulse" />
          </h1>
          <p className="text-xs text-stone-300">
            Module: <span className="font-semibold text-orange-300">{moduleParam}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="glass" 
            size="sm" 
            onClick={() => navigate('/roadmaps')}
            className="text-xs border-[#3A2720] text-stone-300 hover:text-white"
          >
            ← Back to Roadmap
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={fetchLearningData} 
            isLoading={isLoading}
            className="text-xs bg-orange-500 hover:bg-orange-400 shadow-glow"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reload Topic
          </Button>
        </div>
      </div>

      {/* 6-STEP PROGRESS TRACKER BAR */}
      <div className="grid grid-cols-6 gap-2 bg-[#18120F] border border-[#3A2720] p-2 rounded-xl text-center text-xs">
        {[
          { num: 1, label: '1. Explain' },
          { num: 2, label: '2. Teach' },
          { num: 3, label: '3. Practice' },
          { num: 4, label: '4. Evaluate' },
          { num: 5, label: '5. Feedback' },
          { num: 6, label: '6. Next Action' },
        ].map((step) => {
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;
          return (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num as any)}
              className={`py-2 px-1 rounded-lg font-extrabold transition-all cursor-pointer truncate ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-glow'
                  : isDone
                  ? 'bg-[#211712] text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#0C0A09] text-stone-400 hover:text-stone-200'
              }`}
            >
              {isDone ? `✓ ${step.label.split('. ')[1]}` : step.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <Card className="p-12 text-center bg-[#18120F] border-[#3A2720] flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-stone-300">AI Tutor is generating tailored lessons for {topicParam}...</span>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">

          {/* STEP 1: EXPLAIN */}
          {currentStep === 1 && explainTeachData && (
            <Card className="bg-slate-900/90 border-slate-800 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <Brain className="h-6 w-6 text-violet-400" />
                <div>
                  <h2 className="text-lg font-extrabold text-white">1. Concept Explanation</h2>
                  <p className="text-xs text-slate-300">Explained specifically at your student experience level.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed text-sm text-slate-200">
                  <strong className="text-violet-400 font-bold block mb-1">Simple Explanation:</strong>
                  {explainTeachData.simpleExplanation}
                </div>

                <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/20 text-xs text-indigo-200">
                  <strong className="text-indigo-300 font-bold block mb-1">Why It Matters:</strong>
                  {explainTeachData.whyItMatters}
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Key Takeaways:</h4>
                  <ul className="flex flex-col gap-2">
                    {explainTeachData.keyTakeaways?.map((takeaway: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentStep(2)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  Proceed to Step 2: Teach
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: TEACH */}
          {currentStep === 2 && explainTeachData && (
            <Card className="bg-slate-900/90 border-slate-800 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <Lightbulb className="h-6 w-6 text-amber-400" />
                <div>
                  <h2 className="text-lg font-extrabold text-white">2. Analogies & Code Examples</h2>
                  <p className="text-xs text-slate-300">Understand with real-world scenarios and runnable snippets.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Real World Analogy */}
                <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-500/20 text-xs text-amber-200">
                  <strong className="text-amber-300 font-bold block mb-1 text-sm flex items-center gap-1.5">
                    💡 Real-World Analogy:
                  </strong>
                  {explainTeachData.realWorldAnalogy}
                </div>

                {/* Code Example */}
                {explainTeachData.codeExample && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="h-4 w-4 text-emerald-400" /> Code Example:
                    </span>
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                      <code>{explainTeachData.codeExample}</code>
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <Button variant="glass" onClick={() => setCurrentStep(1)}>
                  ← Back to Explain
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentStep(3)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Proceed to Step 3: Practice
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: PRACTICE */}
          {currentStep === 3 && practiceData && (
            <Card className="bg-slate-900/90 border-slate-800 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <HelpCircle className="h-6 w-6 text-indigo-400" />
                <div>
                  <h2 className="text-lg font-extrabold text-white">3. Practice Exercises & Reflection</h2>
                  <p className="text-xs text-slate-300">Test your understanding with MCQs and written reflection.</p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* MCQ Question */}
                {practiceData.mcqs && practiceData.mcqs.length > 0 && (
                  <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Multiple Choice Exercise</span>
                    <h4 className="text-sm font-bold text-white">{practiceData.mcqs[0].question}</h4>
                    
                    <div className="flex flex-col gap-2 mt-1">
                      {practiceData.mcqs[0].options?.map((opt: string, optIdx: number) => (
                        <button
                          key={optIdx}
                          onClick={() => setSelectedMcqAnswer(optIdx)}
                          className={`p-3 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                            selectedMcqAnswer === optIdx
                              ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {selectedMcqAnswer !== null && (
                      <div className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
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

                {/* Open Concept Answer */}
                <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Concept Reflection Question</span>
                  <h4 className="text-sm font-bold text-white">
                    {practiceData.conceptQuestions?.[0]?.question || `Explain in your own words how ${topicParam} works.`}
                  </h4>
                  <textarea
                    rows={4}
                    value={studentConceptAnswer}
                    onChange={(e) => setStudentConceptAnswer(e.target.value)}
                    placeholder="Write your explanation here..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400">
                    Your response will be evaluated in real-time by the AI Mentor engine.
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <Button variant="glass" onClick={() => setCurrentStep(2)}>
                  ← Back to Teach
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleEvaluateAnswer}
                  isLoading={isSubmittingAnswer}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Submit & Evaluate
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4 & STEP 5: EVALUATE & FEEDBACK */}
          {(currentStep === 4 || currentStep === 5) && evaluationData && (
            <Card className="bg-slate-900/90 border-slate-800 p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-emerald-400" />
                  <div>
                    <h2 className="text-lg font-extrabold text-white">4 & 5. AI Evaluation & Constructive Feedback</h2>
                    <p className="text-xs text-slate-300">Detailed breakdown of correct understanding, misconceptions, and mistakes.</p>
                  </div>
                </div>

                <div className="h-14 w-14 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex flex-col items-center justify-center font-extrabold text-white">
                  <span className="text-sm">{evaluationData.score}%</span>
                  <span className="text-[8px] uppercase text-emerald-300">Score</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Correct understanding */}
                <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 flex flex-col gap-2">
                  <strong className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Correct Understanding:
                  </strong>
                  <ul className="flex flex-col gap-1.5 text-xs text-slate-200">
                    {evaluationData.correctUnderstanding?.map((item: string, idx: number) => (
                      <li key={idx}>✓ {item}</li>
                    )) || <li>Answer demonstrates effort.</li>}
                  </ul>
                </div>

                {/* Misconceptions / Missing */}
                <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-500/20 flex flex-col gap-2">
                  <strong className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Misconceptions & Gaps:
                  </strong>
                  <ul className="flex flex-col gap-1.5 text-xs text-slate-200">
                    {evaluationData.misconceptions?.map((item: string, idx: number) => (
                      <li key={idx}>⚠️ {item}</li>
                    ))}
                    {evaluationData.missingConcepts?.map((item: string, idx: number) => (
                      <li key={idx}>⚡ Missing: {item}</li>
                    ))}
                    {(!evaluationData.misconceptions?.length && !evaluationData.missingConcepts?.length) && (
                      <li>No major misconceptions detected. Excellent job!</li>
                    )}
                  </ul>
                </div>

                {/* Feedback Text */}
                <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <strong className="text-indigo-400 font-bold block mb-1">AI Mentor Feedback:</strong>
                  {evaluationData.feedbackText}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <Button variant="glass" onClick={() => setCurrentStep(3)}>
                  ← Back to Practice
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentStep(6)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  View Step 6: Next Action
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 6: NEXT ACTION (ADAPTIVE MENTOR ENGINE) */}
          {currentStep === 6 && (
            <Card className="bg-slate-900/90 border-slate-800 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <PlayCircle className="h-6 w-6 text-violet-400" />
                <div>
                  <h2 className="text-lg font-extrabold text-white">6. Adaptive Mentor Engine — Next Recommendation</h2>
                  <p className="text-xs text-slate-300">Determines your next adaptive step based on topic mastery.</p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-950 p-5 rounded-xl border border-slate-800 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic Assessment Status</span>
                    <h3 className="text-xl font-extrabold text-white">{adaptiveData?.status || 'Strong topic'}</h3>
                    <p className="text-xs text-slate-300 max-w-lg mt-1">
                      {adaptiveData?.recommendationReason || 'You have demonstrated solid comprehension of this topic. Ready for the next module.'}
                    </p>
                  </div>

                  <div className="bg-violet-600/20 border border-violet-500/30 p-4 rounded-xl text-center shrink-0">
                    <span className="text-xs font-bold text-violet-300 uppercase block mb-1">Recommended Action</span>
                    <span className="text-lg font-black text-white px-3 py-1 bg-violet-600 rounded-lg inline-block">
                      {adaptiveData?.nextAction || 'Continue'}
                    </span>
                  </div>
                </div>

                {/* Remediation details if weak */}
                {adaptiveData?.easierExamples && adaptiveData.easierExamples.length > 0 && (
                  <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-500/20 flex flex-col gap-2">
                    <strong className="text-amber-300 font-bold text-xs uppercase tracking-wider">
                      🛠️ Remediation & Easier Practice Suggestions:
                    </strong>
                    <ul className="flex flex-col gap-1 text-xs text-slate-200">
                      {adaptiveData.easierExamples.map((ex: string, idx: number) => (
                        <li key={idx}>• {ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <Button variant="glass" onClick={() => setCurrentStep(4)}>
                  ← Back to Feedback
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/roadmaps')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
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
