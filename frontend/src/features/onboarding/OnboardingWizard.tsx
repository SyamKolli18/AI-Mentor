import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, BookOpen, Brain, Briefcase, Sparkles, CheckCircle2, 
  ChevronRight, ChevronLeft, Plus, Trash2, ShieldAlert,
  Target, Rocket, Check, Compass, Cpu, Layers, Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateUrl } from '../../lib/urlValidation';

const AVAILABLE_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'Swift', 'Kotlin', 'PHP', 'SQL', 'HTML/CSS'
];

const AVAILABLE_SUBJECTS = [
  'Data Structures & Algorithms', 'Database Systems (DBMS)', 'Operating Systems', 'Computer Networks', 
  'System Design', 'Compiler Design', 'Cloud Computing', 'Machine Learning', 'Cyber Security', 'Software Engineering'
];

const PROCESSING_STEPS = [
  'Analyzing your profile vectors...',
  'Understanding your skill profile...',
  'Identifying critical skill gaps...',
  'Evaluating career path fit...',
  'Building your personalized roadmap...',
  'Preparing your intelligent mentor journey...'
];

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Stage 5 AI Processing state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProcessingIndex, setAiProcessingIndex] = useState(0);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<any>(null);

  // Form State
  const [personal, setPersonal] = useState({
    phone: '',
    gender: 'male',
    location: '',
    country: 'United States'
  });

  const [academic, setAcademic] = useState({
    college: '',
    degree: '',
    branch: '',
    currentYear: 3,
    graduationYear: 2027,
    cgpa: 3.8,
  });

  const [skills, setSkills] = useState<{ languages: string[]; subjects: string[]; otherSkills: string[] }>({
    languages: [],
    subjects: [],
    otherSkills: [],
  });

  const [careerGoals, setCareerGoals] = useState<{
    preferredCareer: string;
    confidenceLevel: 'high' | 'medium' | 'low';
    strengths: string[];
    weaknesses: string[];
  }>({
    preferredCareer: '',
    confidenceLevel: 'medium',
    strengths: [],
    weaknesses: [],
  });

  const [preferences, setPreferences] = useState<{
    learningStyle: 'visual' | 'auditory' | 'read-write' | 'kinesthetic';
    preferredLanguage: string;
    dailyStudyTime: number;
    laptopSpecs: string;
    communicationSkills: 'excellent' | 'good' | 'average' | 'needs-improvement';
  }>({
    learningStyle: 'visual',
    preferredLanguage: 'English',
    dailyStudyTime: 2,
    laptopSpecs: '16GB RAM, i7 Processor',
    communicationSkills: 'good',
  });

  const [projects, setProjects] = useState<Array<{ title: string; description: string; technologies: string; link?: string }>>([]);
  const [certifications, setCertifications] = useState<Array<{ name: string; issuingOrganization: string; credentialUrl?: string }>>([]);
  const [socials, setSocials] = useState({ github: '', linkedin: '', resumeUrl: '' });

  // Temporary Inputs
  const [tempOtherSkill, setTempOtherSkill] = useState('');
  const [tempStrength, setTempStrength] = useState('');
  const [tempWeakness, setTempWeakness] = useState('');

  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '', link: '' });
  const [newProjectErrors, setNewProjectErrors] = useState<Record<string, string>>({});

  const [newCert, setNewCert] = useState({ name: '', issuingOrganization: '', credentialUrl: '' });
  const [newCertErrors, setNewCertErrors] = useState<Record<string, string>>({});

  // Load saved onboarding state
  useEffect(() => {
    const fetchOnboarding = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/onboarding');
        const ob = res.data.onboarding;
        if (ob) {
          if (ob.personal) setPersonal((prev) => ({ ...prev, ...ob.personal }));
          if (ob.academic) setAcademic((prev) => ({ ...prev, ...ob.academic }));
          if (ob.skills) setSkills((prev) => ({ ...prev, ...ob.skills }));
          if (ob.careerGoals) setCareerGoals((prev) => ({ ...prev, ...ob.careerGoals }));
          if (ob.preferences) setPreferences((prev) => ({ ...prev, ...ob.preferences }));
          if (ob.experience) {
            const exp = ob.experience;
            if (exp.projects) {
              setProjects(exp.projects.map((p: any) => ({
                ...p,
                technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies || ''
              })));
            }
            if (exp.certifications) setCertifications(exp.certifications);
            setSocials({
              github: exp.github || '',
              linkedin: exp.linkedin || '',
              resumeUrl: exp.resumeUrl || '',
            });
          }
          if (ob.currentStep && ob.currentStep >= 1 && ob.currentStep <= 5) {
            setStep(ob.currentStep);
            if (ob.currentStep === 5 && ob.completed) {
              setAiAnalysisComplete(true);
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to load onboarding state:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOnboarding();
  }, []);

  // Validation Rules
  const validateStage = (currentStage: number): boolean => {
    const errors: Record<string, string> = {};

    if (currentStage === 1) {
      if (!academic.college.trim()) errors.college = 'College or University name is required.';
      if (!academic.degree.trim()) errors.degree = 'Degree title is required.';
      if (!academic.branch.trim()) errors.branch = 'Branch or Specialization is required.';
      if (!personal.phone.trim() || personal.phone.trim().length < 7) errors.phone = 'Valid phone number is required.';
      if (!personal.location.trim()) errors.location = 'Location (City, Country) is required.';
      if (!academic.graduationYear || academic.graduationYear < 2000 || academic.graduationYear > 2035) {
        errors.graduationYear = 'Graduation year must be between 2000 and 2035.';
      }
      if (typeof academic.cgpa !== 'number' || isNaN(academic.cgpa) || academic.cgpa < 0 || academic.cgpa > 10) {
        errors.cgpa = 'CGPA / GPA must be a valid number between 0 and 10.';
      }
    }

    if (currentStage === 2) {
      if (skills.languages.length === 0 && skills.otherSkills.length === 0) {
        errors.skills = 'Select at least one programming language or technical skill.';
      }
      if (skills.subjects.length === 0) {
        errors.subjects = 'Select at least one core CS subject.';
      }
    }

    if (currentStage === 3) {
      if (!careerGoals.preferredCareer.trim()) {
        errors.preferredCareer = 'Preferred career role is required.';
      }
      if (careerGoals.strengths.length === 0) {
        errors.strengths = 'Please add at least one key strength.';
      }
      if (careerGoals.weaknesses.length === 0) {
        errors.weaknesses = 'Please add at least one weakness or focus area.';
      }
      if (!preferences.preferredLanguage.trim()) {
        errors.preferredLanguage = 'Preferred learning language is required.';
      }
      if (!preferences.laptopSpecs.trim()) {
        errors.laptopSpecs = 'Hardware / Laptop specifications are required.';
      }
    }

    if (currentStage === 4) {
      // Validate URLs
      const ghCheck = validateUrl(socials.github, 'github');
      if (!ghCheck.isValid) errors.github = ghCheck.error || 'Invalid GitHub URL';

      const liCheck = validateUrl(socials.linkedin, 'linkedin');
      if (!liCheck.isValid) errors.linkedin = liCheck.error || 'Invalid LinkedIn URL';

      const resCheck = validateUrl(socials.resumeUrl, 'resume');
      if (!resCheck.isValid) errors.resumeUrl = resCheck.error || 'Invalid Resume URL';
    }

    setFieldErrors(errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      toast(`Please fix ${errorKeys.length} error${errorKeys.length > 1 ? 's' : ''} before continuing.`, 'error');
      return false;
    }
    return true;
  };

  // Sync / Save progress to backend
  const saveStepProgress = async (nextStep: number) => {
    try {
      setIsSaving(true);
      const formattedProjects = projects.map(p => ({
        ...p,
        technologies: typeof p.technologies === 'string' 
          ? p.technologies.split(',').map(t => t.trim()).filter(Boolean) 
          : p.technologies
      }));

      const payload = {
        personal,
        academic,
        skills,
        careerGoals,
        preferences,
        experience: {
          projects: formattedProjects,
          certifications,
          github: socials.github,
          linkedin: socials.linkedin,
          resumeUrl: socials.resumeUrl,
        },
        currentStep: nextStep,
      };

      await api.post('/onboarding/save', payload);
      setStep(nextStep);
    } catch (err: any) {
      toast(err.message || 'Failed to auto-save progress.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (!validateStage(step)) return;

    if (step < 4) {
      const nextStep = step + 1;
      saveStepProgress(nextStep);
    } else if (step === 4) {
      // Advance to Stage 5 and trigger AI Analysis & Roadmap generation!
      triggerStage5AIAnalysis();
    }
  };

  const handleBack = () => {
    if (step > 1 && !isAiProcessing) {
      setStep(step - 1);
    }
  };

  // Trigger Stage 5 AI Processing Sequence & Submission
  const triggerStage5AIAnalysis = async () => {
    if (!validateStage(4)) return;

    setStep(5);
    setIsAiProcessing(true);
    setAiProcessingIndex(0);

    // Animated Processing sequence
    const interval = setInterval(() => {
      setAiProcessingIndex((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 800);

    try {
      const formattedProjects = projects.map(p => ({
        ...p,
        technologies: typeof p.technologies === 'string'
          ? p.technologies.split(',').map(t => t.trim()).filter(Boolean)
          : p.technologies
      }));

      const payload = {
        personal,
        academic,
        skills,
        careerGoals,
        preferences,
        experience: {
          projects: formattedProjects,
          certifications,
          github: socials.github,
          linkedin: socials.linkedin,
          resumeUrl: socials.resumeUrl,
        },
      };

      const res = await api.post('/onboarding/submit', payload);
      updateUser(res.data.user);

      // Trigger AI profile analysis and career recommendations
      try {
        const profileRes = await api.post('/ai/analyze-profile');
        const recsRes = await api.get('/ai/career-recommendations');
        setGeneratedAnalysis({
          profile: profileRes.data.aiProfile,
          recommendations: recsRes.data.recommendations
        });
      } catch (aiErr) {
        console.warn('AI Analysis fallback:', aiErr);
      }

      // Finish processing sequence
      setTimeout(() => {
        setIsAiProcessing(false);
        setAiAnalysisComplete(true);
        toast('Your AI Mentor Roadmap has been generated!', 'success');
      }, 4800);

    } catch (err: any) {
      clearInterval(interval);
      setIsAiProcessing(false);
      toast(err.message || 'Submission failed. Please check your entries.', 'error');
      setStep(4);
    }
  };

  // Skill toggling
  const toggleLanguage = (lang: string) => {
    setSkills(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
    setFieldErrors((prev) => ({ ...prev, skills: '' }));
  };

  const toggleSubject = (sub: string) => {
    setSkills(prev => ({
      ...prev,
      subjects: prev.subjects.includes(sub)
        ? prev.subjects.filter(s => s !== sub)
        : [...prev.subjects, sub]
    }));
    setFieldErrors((prev) => ({ ...prev, subjects: '' }));
  };

  const addOtherSkill = () => {
    if (!tempOtherSkill.trim()) return;
    if (skills.otherSkills.includes(tempOtherSkill.trim())) return;
    setSkills(prev => ({ ...prev, otherSkills: [...prev.otherSkills, tempOtherSkill.trim()] }));
    setTempOtherSkill('');
    setFieldErrors((prev) => ({ ...prev, skills: '' }));
  };

  const addStrength = () => {
    if (!tempStrength.trim()) return;
    if (careerGoals.strengths.includes(tempStrength.trim())) return;
    setCareerGoals(prev => ({ ...prev, strengths: [...prev.strengths, tempStrength.trim()] }));
    setTempStrength('');
    setFieldErrors((prev) => ({ ...prev, strengths: '' }));
  };

  const addWeakness = () => {
    if (!tempWeakness.trim()) return;
    if (careerGoals.weaknesses.includes(tempWeakness.trim())) return;
    setCareerGoals(prev => ({ ...prev, weaknesses: [...prev.weaknesses, tempWeakness.trim()] }));
    setTempWeakness('');
    setFieldErrors((prev) => ({ ...prev, weaknesses: '' }));
  };

  // Add Project
  const addProject = () => {
    const errs: Record<string, string> = {};
    if (!newProject.title.trim()) errs.title = 'Project title is required.';
    if (!newProject.description.trim()) errs.description = 'Short description is required.';
    if (newProject.link) {
      const pUrlCheck = validateUrl(newProject.link, 'project');
      if (!pUrlCheck.isValid) errs.link = pUrlCheck.error || 'Invalid URL';
    }

    setNewProjectErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setProjects([...projects, { ...newProject }]);
    setNewProject({ title: '', description: '', technologies: '', link: '' });
    setNewProjectErrors({});
  };

  // Add Certification
  const addCert = () => {
    const errs: Record<string, string> = {};
    if (!newCert.name.trim()) errs.name = 'Certificate name is required.';
    if (!newCert.issuingOrganization.trim()) errs.issuingOrganization = 'Issuing organization is required.';
    if (newCert.credentialUrl) {
      const cUrlCheck = validateUrl(newCert.credentialUrl, 'any');
      if (!cUrlCheck.isValid) errs.credentialUrl = cUrlCheck.error || 'Invalid URL';
    }

    setNewCertErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCertifications([...certifications, { ...newCert }]);
    setNewCert({ name: '', issuingOrganization: '', credentialUrl: '' });
    setNewCertErrors({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground bg-grid">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading student profile...</span>
        </div>
      </div>
    );
  }

  const stepsHeader = [
    { id: 1, label: "Academics", icon: User },
    { id: 2, label: "Skills", icon: BookOpen },
    { id: 3, label: "Goals & Fit", icon: Brain },
    { id: 4, label: "Experience", icon: Briefcase },
    { id: 5, label: "AI Roadmap", icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid p-4 md:p-10 relative overflow-hidden font-sans select-none">
      {/* Background glow effects */}
      <div className="glow-blur -top-40 -left-40" />
      <div className="glow-blur -bottom-40 -right-40" />

      <div className="max-w-4xl mx-auto z-10 relative flex flex-col gap-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-glow">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider text-white flex items-center gap-2">
                AI MENTOR <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-mono">INTELLIGENCE OS</span>
              </span>
              <p className="text-[11px] text-slate-400">Student Profile & Career Calibration</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono font-semibold bg-[#111111] px-3 py-1.5 rounded-lg border border-[#27272A]">
            Stage {step} of 5
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="w-full flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {stepsHeader.map((s) => {
            const StepIcon = s.icon;
            const isCompleted = step > s.id;
            const isActive = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 shrink-0">
                <div className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-glow'
                    : isActive
                      ? 'bg-rose-600 border-rose-500 text-white shadow-crimson-glow'
                      : 'border-[#27272A] bg-[#111111] text-slate-500'
                }`}>
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : <StepIcon className="h-4 w-4" />}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                  <span className="text-[9px] text-slate-500">Stage 0{s.id}</span>
                </div>
                {s.id < 5 && <ChevronRight className="h-4 w-4 text-[#27272A] hidden md:block" />}
              </div>
            );
          })}
        </div>

        {/* Main Card Panel */}
        <Card className="p-6 md:p-8 bg-[#111111]/90 border-[#27272A] flex flex-col gap-6 relative overflow-hidden min-h-[500px] shadow-glass">
          <div className="absolute top-0 right-0 h-full w-[40%] bg-glow-crimson pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              {/* STAGE 1: ACADEMICS */}
              {step === 1 && (
                <div className="flex flex-col gap-6 text-left">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      Academic Profile & Standing
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Tell AI Mentor about your current institution, degree, and academic standing.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="College / University"
                      placeholder="e.g. Stanford University"
                      value={academic.college}
                      onChange={(e) => {
                        setAcademic({ ...academic, college: e.target.value });
                        setFieldErrors((prev) => ({ ...prev, college: '' }));
                      }}
                      error={fieldErrors.college}
                      required
                    />
                    <Input
                      label="Degree Program"
                      placeholder="e.g. B.Tech / B.S."
                      value={academic.degree}
                      onChange={(e) => {
                        setAcademic({ ...academic, degree: e.target.value });
                        setFieldErrors((prev) => ({ ...prev, degree: '' }));
                      }}
                      error={fieldErrors.degree}
                      required
                    />
                    <Input
                      label="Branch / Specialization"
                      placeholder="e.g. Computer Science & Engineering"
                      value={academic.branch}
                      onChange={(e) => {
                        setAcademic({ ...academic, branch: e.target.value });
                        setFieldErrors((prev) => ({ ...prev, branch: '' }));
                      }}
                      error={fieldErrors.branch}
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Graduation Year"
                        type="number"
                        placeholder="2027"
                        value={academic.graduationYear || ''}
                        onChange={(e) => {
                          setAcademic({ ...academic, graduationYear: Number(e.target.value) });
                          setFieldErrors((prev) => ({ ...prev, graduationYear: '' }));
                        }}
                        error={fieldErrors.graduationYear}
                        required
                      />
                      <Input
                        label="Current GPA / CGPA"
                        type="number"
                        step="0.01"
                        placeholder="3.85"
                        value={academic.cgpa || ''}
                        onChange={(e) => {
                          setAcademic({ ...academic, cgpa: Number(e.target.value) });
                          setFieldErrors((prev) => ({ ...prev, cgpa: '' }));
                        }}
                        error={fieldErrors.cgpa}
                        required
                      />
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#27272A] my-1" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Contact Phone"
                      placeholder="+1 (555) 019-2834"
                      value={personal.phone}
                      onChange={(e) => {
                        setPersonal({ ...personal, phone: e.target.value });
                        setFieldErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      error={fieldErrors.phone}
                      required
                    />
                    <Input
                      label="Location (City, Country)"
                      placeholder="San Francisco, CA, USA"
                      value={personal.location}
                      onChange={(e) => {
                        setPersonal({ ...personal, location: e.target.value });
                        setFieldErrors((prev) => ({ ...prev, location: '' }));
                      }}
                      error={fieldErrors.location}
                      required
                    />
                  </div>
                </div>
              )}

              {/* STAGE 2: SKILLS */}
              {step === 2 && (
                <div className="flex flex-col gap-6 text-left">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      Technical Skills & Competencies
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Select programming languages and core CS subjects you have worked with.</p>
                  </div>

                  {fieldErrors.skills && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      {fieldErrors.skills}
                    </div>
                  )}

                  {/* Languages Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 tracking-wider uppercase">
                      Programming Languages & Core Technologies
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_LANGUAGES.map((lang) => {
                        const isSelected = skills.languages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-rose-600/25 border-rose-500 text-white shadow-glow'
                                : 'border-[#27272A] bg-[#171717] text-slate-400 hover:border-[#3F3F46] hover:text-white'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 inline mr-1 text-rose-400" />}
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Core Subjects Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 tracking-wider uppercase">
                      Core Academic Computer Science Subjects
                    </label>
                    {fieldErrors.subjects && (
                      <span className="text-xs text-rose-400 font-medium">{fieldErrors.subjects}</span>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SUBJECTS.map((sub) => {
                        const isSelected = skills.subjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubject(sub)}
                            className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-rose-600/25 border-rose-500 text-white shadow-glow'
                                : 'border-[#27272A] bg-[#171717] text-slate-400 hover:border-[#3F3F46] hover:text-white'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 inline mr-1 text-rose-400" />}
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Skill Adder */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 tracking-wider uppercase">
                      Frameworks & Other Technical Skills
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. React, Node.js, Docker, PyTorch"
                        value={tempOtherSkill}
                        onChange={(e) => setTempOtherSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOtherSkill())}
                      />
                      <Button variant="outline" type="button" onClick={addOtherSkill} className="shrink-0 h-11 px-4">
                        <Plus className="h-4 w-4 mr-1 text-rose-400" /> Add Skill
                      </Button>
                    </div>
                    {skills.otherSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skills.otherSkills.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-[#171717] border border-[#27272A] text-xs font-medium text-slate-200 rounded-lg px-3 py-1.5">
                            <span>{s}</span>
                            <button
                              type="button"
                              onClick={() => setSkills({ ...skills, otherSkills: skills.otherSkills.filter(val => val !== s) })}
                              className="text-slate-500 hover:text-rose-400 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 3: GOALS & FIT */}
              {step === 3 && (
                <div className="flex flex-col gap-6 text-left">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      Career Goals & Learning Fit
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Map your target career role, self-assessed strengths, and preferred study pace.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Preferred Career Role"
                      placeholder="e.g. Full-Stack Software Engineer"
                      value={careerGoals.preferredCareer}
                      onChange={(e) => {
                        setCareerGoals({ ...careerGoals, preferredCareer: e.target.value });
                        setFieldErrors((prev) => ({ ...prev, preferredCareer: '' }));
                      }}
                      error={fieldErrors.preferredCareer}
                      required
                    />
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 tracking-wider uppercase block mb-1.5">
                        Career Path Confidence
                      </label>
                      <select
                        value={careerGoals.confidenceLevel}
                        onChange={(e) => setCareerGoals({ ...careerGoals, confidenceLevel: e.target.value as any })}
                        className="w-full h-11 bg-[#111111] border border-[#27272A] text-slate-100 rounded-lg px-3.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      >
                        <option value="high">High Confidence (Clear vision)</option>
                        <option value="medium">Medium Confidence (Exploring options)</option>
                        <option value="low">Low Confidence (Need AI Mentor guidance)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-300 tracking-wider uppercase">
                        Key Strengths (Add at least 1)
                      </label>
                      {fieldErrors.strengths && <span className="text-xs text-rose-400">{fieldErrors.strengths}</span>}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Problem Solving, Logic, Fast Learner"
                          value={tempStrength}
                          onChange={(e) => setTempStrength(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                        />
                        <Button variant="outline" type="button" onClick={addStrength} className="shrink-0 h-11">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {careerGoals.strengths.map((str, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 rounded-lg px-3 py-1.5">
                            <span>{str}</span>
                            <button type="button" onClick={() => setCareerGoals({ ...careerGoals, strengths: careerGoals.strengths.filter(v => v !== str) })} className="text-emerald-500 hover:text-emerald-300 font-bold">×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-300 tracking-wider uppercase">
                        Focus / Growth Areas (Add at least 1)
                      </label>
                      {fieldErrors.weaknesses && <span className="text-xs text-rose-400">{fieldErrors.weaknesses}</span>}
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. System Architecture, Time Complexity"
                          value={tempWeakness}
                          onChange={(e) => setTempWeakness(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWeakness())}
                        />
                        <Button variant="outline" type="button" onClick={addWeakness} className="shrink-0 h-11">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {careerGoals.weaknesses.map((wk, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 rounded-lg px-3 py-1.5">
                            <span>{wk}</span>
                            <button type="button" onClick={() => setCareerGoals({ ...careerGoals, weaknesses: careerGoals.weaknesses.filter(v => v !== wk) })} className="text-rose-500 hover:text-rose-300 font-bold">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#27272A] my-1" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 tracking-wider uppercase block mb-1.5">Learning Style</label>
                      <select
                        value={preferences.learningStyle}
                        onChange={(e) => setPreferences({ ...preferences, learningStyle: e.target.value as any })}
                        className="w-full h-11 bg-[#111111] border border-[#27272A] text-slate-100 rounded-lg px-3.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      >
                        <option value="visual">Visual (Diagrams / Video)</option>
                        <option value="kinesthetic">Kinesthetic (Hands-on coding)</option>
                        <option value="read-write">Read/Write (Documentation / Articles)</option>
                        <option value="auditory">Auditory (Lectures / Audio)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-300 tracking-wider uppercase block mb-1.5">Daily Study Commitment</label>
                      <select
                        value={preferences.dailyStudyTime}
                        onChange={(e) => setPreferences({ ...preferences, dailyStudyTime: Number(e.target.value) })}
                        className="w-full h-11 bg-[#111111] border border-[#27272A] text-slate-100 rounded-lg px-3.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      >
                        <option value="1">1 Hour / Day</option>
                        <option value="2">2 Hours / Day</option>
                        <option value="4">4 Hours / Day</option>
                        <option value="6">6+ Hours / Day</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-300 tracking-wider uppercase block mb-1.5">Communication Skill Level</label>
                      <select
                        value={preferences.communicationSkills}
                        onChange={(e) => setPreferences({ ...preferences, communicationSkills: e.target.value as any })}
                        className="w-full h-11 bg-[#111111] border border-[#27272A] text-slate-100 rounded-lg px-3.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="average">Average</option>
                        <option value="needs-improvement">Needs Improvement</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Preferred Learning Language"
                      placeholder="e.g. English"
                      value={preferences.preferredLanguage}
                      onChange={(e) => setPreferences({ ...preferences, preferredLanguage: e.target.value })}
                      error={fieldErrors.preferredLanguage}
                      required
                    />
                    <Input
                      label="Hardware / Device Specifications"
                      placeholder="e.g. 16GB RAM, i7 Processor"
                      value={preferences.laptopSpecs}
                      onChange={(e) => setPreferences({ ...preferences, laptopSpecs: e.target.value })}
                      error={fieldErrors.laptopSpecs}
                      required
                    />
                  </div>
                </div>
              )}

              {/* STAGE 4: EXPERIENCE & PROFESSIONAL LINKS */}
              {step === 4 && (
                <div className="flex flex-col gap-6 text-left">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      Experience & Professional Links
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Add previous projects, certifications, and verified professional profile links.</p>
                  </div>

                  {/* Add Project Form */}
                  <div className="border border-[#27272A] bg-[#171717]/60 rounded-xl p-4 flex flex-col gap-3">
                    <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-rose-400" /> Add a Project (Optional)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Project Title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        error={newProjectErrors.title}
                      />
                      <Input
                        placeholder="Technologies (comma separated)"
                        value={newProject.technologies}
                        onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                      />
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Short description of what you built"
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          error={newProjectErrors.description}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          placeholder="GitHub / Live Demo URL (e.g. https://github.com/user/repo)"
                          value={newProject.link}
                          onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                          error={newProjectErrors.link}
                        />
                      </div>
                    </div>
                    <Button variant="outline" type="button" onClick={addProject} className="self-end text-xs h-9">
                      <Plus className="h-4 w-4 mr-1 text-rose-400" /> Add Project
                    </Button>
                  </div>

                  {/* Projects List */}
                  {projects.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Projects Added ({projects.length})</span>
                      <div className="grid grid-cols-1 gap-2">
                        {projects.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-start border border-[#27272A] bg-[#111111] rounded-xl p-4">
                            <div>
                              <h5 className="font-bold text-white text-sm">{p.title}</h5>
                              <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                              {p.technologies && (
                                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded px-2 py-0.5 mt-2 inline-block font-mono">
                                  {typeof p.technologies === 'string' ? p.technologies : (p.technologies as string[]).join(', ')}
                                </span>
                              )}
                            </div>
                            <button type="button" onClick={() => setProjects(projects.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400 cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="h-[1px] bg-[#27272A]" />

                  {/* Add Cert Form */}
                  <div className="border border-[#27272A] bg-[#171717]/60 rounded-xl p-4 flex flex-col gap-3">
                    <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-rose-400" /> Add a Certification (Optional)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Certificate Name"
                        value={newCert.name}
                        onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                        error={newCertErrors.name}
                      />
                      <Input
                        placeholder="Issuing Organization"
                        value={newCert.issuingOrganization}
                        onChange={(e) => setNewCert({ ...newCert, issuingOrganization: e.target.value })}
                        error={newCertErrors.issuingOrganization}
                      />
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Credential URL (Optional)"
                          value={newCert.credentialUrl}
                          onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                          error={newCertErrors.credentialUrl}
                        />
                      </div>
                    </div>
                    <Button variant="outline" type="button" onClick={addCert} className="self-end text-xs h-9">
                      <Plus className="h-4 w-4 mr-1 text-rose-400" /> Add Certification
                    </Button>
                  </div>

                  {certifications.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {certifications.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#171717] border border-[#27272A] rounded-lg px-4 py-2.5 text-xs">
                          <div>
                            <span className="font-bold text-white">{c.name}</span>
                            <span className="text-slate-500 mx-2">•</span>
                            <span className="text-slate-400">{c.issuingOrganization}</span>
                          </div>
                          <button type="button" onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="h-[1px] bg-[#27272A]" />

                  {/* Professional Links */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="GitHub Profile URL"
                      placeholder="https://github.com/username"
                      value={socials.github}
                      onChange={(e) => {
                        setSocials({ ...socials, github: e.target.value });
                        setFieldErrors((prev) => ({ ...prev, github: '' }));
                      }}
                      error={fieldErrors.github}
                    />
                    <Input
                      label="LinkedIn Profile URL"
                      placeholder="https://www.linkedin.com/in/username"
                      value={socials.linkedin}
                      onChange={(e) => {
                        setSocials({ ...socials, linkedin: e.target.value });
                        setFieldErrors((prev) => ({ ...prev, linkedin: '' }));
                      }}
                      error={fieldErrors.linkedin}
                    />
                    <Input
                      label="Resume URL"
                      placeholder="https://example.com/resume.pdf"
                      value={socials.resumeUrl}
                      onChange={(e) => {
                        setSocials({ ...socials, resumeUrl: e.target.value });
                        setFieldErrors((prev) => ({ ...prev, resumeUrl: '' }));
                      }}
                      error={fieldErrors.resumeUrl}
                    />
                  </div>
                </div>
              )}

              {/* STAGE 5: AI ANALYSIS & PERSONALIZED ROADMAP */}
              {step === 5 && (
                <div className="flex flex-col items-center text-center gap-6 py-4">
                  {isAiProcessing ? (
                    <div className="flex flex-col items-center gap-6 py-12 my-auto">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
                        <Sparkles className="h-10 w-10 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <h3 className="text-xl font-extrabold text-white tracking-tight">
                          {PROCESSING_STEPS[aiProcessingIndex]}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-md">
                          AI Mentor is processing your academic background, skills, and goals to build your custom career roadmap.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex flex-col gap-6 text-left"
                    >
                      {/* Banner Header */}
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#171717] to-[#111111] border border-rose-500/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-mono font-bold border border-rose-500/30 mb-2">
                            <Sparkles className="h-3.5 w-3.5" /> STAGE 5 COMPLETE • ROADMAP READY
                          </div>
                          <h2 className="text-2xl font-extrabold text-white">YOUR AI MENTOR ROADMAP</h2>
                          <p className="text-xs text-slate-300 mt-1 max-w-xl">
                            Tailored for <strong className="text-rose-400">{careerGoals.preferredCareer || 'Software Engineer'}</strong> based on your academics at {academic.college || 'University'}. {aiAnalysisComplete && generatedAnalysis?.profile?.scores?.careerReadinessScore && `(Readiness score: ${generatedAnalysis.profile.scores.careerReadinessScore}%)`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 bg-[#111111]/80 px-4 py-3 rounded-xl border border-[#27272A] shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Learning Readiness</span>
                            <span className="text-xl font-black text-rose-400 font-mono">78%</span>
                          </div>
                          <Target className="h-8 w-8 text-rose-500" />
                        </div>
                      </div>

                      {/* Briefing Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Box 1: Strengths & Fit */}
                        <div className="p-4 rounded-xl border border-[#27272A] bg-[#171717]/50 flex flex-col gap-2">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Key Strengths
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {careerGoals.strengths.length > 0 ? (
                              careerGoals.strengths.map((s, idx) => (
                                <span key={idx} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-medium">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">Problem Solving, Fast Learner</span>
                            )}
                          </div>
                        </div>

                        {/* Box 2: Skill Gaps Identified */}
                        <div className="p-4 rounded-xl border border-[#27272A] bg-[#171717]/50 flex flex-col gap-2">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4 text-rose-400" /> Priority Skill Gaps
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {careerGoals.weaknesses.length > 0 ? (
                              careerGoals.weaknesses.map((w, idx) => (
                                <span key={idx} className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-2.5 py-1 rounded-md font-medium">
                                  {w}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">System Design, Data Structures</span>
                            )}
                          </div>
                        </div>

                        {/* Box 3: Roadmap Sequence */}
                        <div className="p-4 rounded-xl border border-[#27272A] bg-[#171717]/50 flex flex-col gap-2">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Compass className="h-4 w-4 text-sky-400" /> Estimated Timeline
                          </span>
                          <div className="text-xs text-slate-300 flex flex-col gap-1 mt-1 font-mono">
                            <div>• Daily Target: <strong className="text-white">{preferences.dailyStudyTime} Hours</strong></div>
                            <div>• Est. Duration: <strong className="text-white">12 Weeks</strong></div>
                            <div>• First Milestone: <strong className="text-rose-400">Core Foundations</strong></div>
                          </div>
                        </div>
                      </div>

                      {/* AI Recommendation Message */}
                      <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5 flex items-start gap-4">
                        <Cpu className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1 text-xs text-slate-200 leading-relaxed">
                          <strong className="text-white text-sm">AI MENTOR'S INITIAL RECOMMENDATION:</strong>
                          <span>
                            "Based on your profile, start by solidifying core CS fundamentals and building 2 full-stack projects in the first 4 weeks. Your daily {preferences.dailyStudyTime}-hour target is optimal for achieving job readiness in 3 months."
                          </span>
                        </div>
                      </div>

                      {/* CTA Action */}
                      <div className="flex justify-end pt-4">
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => navigate('/dashboard')}
                          className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-crimson-glow text-base px-8 py-3"
                          rightIcon={<Rocket className="h-5 w-5 ml-1" />}
                        >
                          Start My Roadmap
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls for Stages 1–4 */}
          {step <= 4 && (
            <div className="flex items-center justify-between border-t border-[#27272A] pt-6 mt-auto">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || isSaving || isAiProcessing}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Back
              </Button>
              
              <Button
                variant="primary"
                onClick={handleNext}
                isLoading={isSaving || isAiProcessing}
                rightIcon={step === 4 ? <Sparkles className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              >
                {step === 4 ? 'Build My Roadmap' : 'Next Stage'}
              </Button>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default OnboardingWizard;
