import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, BookOpen, Brain, Briefcase, FileText, CheckCircle, 
  ChevronRight, ChevronLeft, Plus, Trash, Terminal, Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Options for pills
const AVAILABLE_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'Swift', 'Kotlin', 'PHP', 'SQL', 'HTML/CSS'];
const AVAILABLE_SUBJECTS = ['Data Structures', 'Algorithms', 'Database Systems (DBMS)', 'Operating Systems', 'Computer Networks', 'System Design', 'Compiler Design', 'Cloud Computing', 'Machine Learning', 'Cyber Security'];

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [personal, setPersonal] = useState({ phone: '', gender: 'male', location: '' });
  const [academic, setAcademic] = useState({ degree: '', branch: '', graduationYear: 2027, cgpa: 0, college: '' });
  const [skills, setSkills] = useState<{ languages: string[]; subjects: string[]; otherSkills: string[] }>({
    languages: [],
    subjects: [],
    otherSkills: [],
  });
  const [careerGoals, setCareerGoals] = useState<{ preferredCareer: string; confidenceLevel: 'high' | 'medium' | 'low'; strengths: string[]; weaknesses: string[] }>({
    preferredCareer: '',
    confidenceLevel: 'medium',
    strengths: [],
    weaknesses: [],
  });
  const [preferences, setPreferences] = useState<{ learningStyle: 'visual' | 'auditory' | 'read-write' | 'kinesthetic'; preferredLanguage: string; dailyStudyTime: number; laptopSpecs: string; communicationSkills: 'excellent' | 'good' | 'average' | 'needs-improvement' }>({
    learningStyle: 'visual',
    preferredLanguage: 'English',
    dailyStudyTime: 2,
    laptopSpecs: '8GB RAM, i5 Processor',
    communicationSkills: 'good',
  });
  const [projects, setProjects] = useState<Array<{ title: string; description: string; technologies: string; link?: string }>>([]);
  const [certifications, setCertifications] = useState<Array<{ name: string; issuingOrganization: string; credentialUrl?: string }>>([]);
  const [socials, setSocials] = useState({ github: '', linkedin: '', resumeUrl: '' });

  // Temp item builders for lists
  const [tempOtherSkill, setTempOtherSkill] = useState('');
  const [tempStrength, setTempStrength] = useState('');
  const [tempWeakness, setTempWeakness] = useState('');
  
  // Project builder
  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '', link: '' });
  const [newCert, setNewCert] = useState({ name: '', issuingOrganization: '', credentialUrl: '' });

  // Load saved onboarding data on mount
  useEffect(() => {
    const fetchOnboarding = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/onboarding');
        const ob = res.data.onboarding;
        if (ob) {
          if (ob.personal) setPersonal({ ...personal, ...ob.personal });
          if (ob.academic) setAcademic({ ...academic, ...ob.academic });
          if (ob.skills) setSkills({ ...skills, ...ob.skills });
          if (ob.careerGoals) setCareerGoals({ ...careerGoals, ...ob.careerGoals });
          if (ob.preferences) setPreferences({ ...preferences, ...ob.preferences });
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
          if (ob.currentStep) setStep(ob.currentStep);
        }
      } catch (err: any) {
        console.error('Failed to retrieve onboarding state:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOnboarding();
  }, []);

  // Sync / Save progress to backend
  const saveStepProgress = async (nextStep: number) => {
    try {
      setIsSaving(true);
      const formattedProjects = projects.map(p => ({
        ...p,
        technologies: p.technologies.split(',').map(t => t.trim()).filter(Boolean)
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
    // Basic validation before going forward
    if (step === 1) {
      if (!academic.college || !academic.degree || !academic.branch || !personal.phone || !personal.location) {
        toast('Please fill out all required academic and personal details.', 'error');
        return;
      }
    }
    if (step === 2) {
      if (skills.languages.length === 0 || skills.subjects.length === 0) {
        toast('Please select at least one language and one subject.', 'error');
        return;
      }
    }
    if (step === 3) {
      if (!careerGoals.preferredCareer) {
        toast('Preferred Career is required.', 'error');
        return;
      }
    }

    const nextStep = step + 1;
    saveStepProgress(nextStep);
  };

  const handleBack = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
    }
  };

  // Submission handler
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const formattedProjects = projects.map(p => ({
        ...p,
        technologies: p.technologies.split(',').map(t => t.trim()).filter(Boolean)
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
      
      // Update session context
      updateUser(res.data.user);
      toast('Onboarding completed! Welcome to your dashboard.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Validation failed. Please verify all details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Skill pill toggling
  const toggleLanguage = (lang: string) => {
    setSkills(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const toggleSubject = (sub: string) => {
    setSkills(prev => ({
      ...prev,
      subjects: prev.subjects.includes(sub)
        ? prev.subjects.filter(s => s !== sub)
        : [...prev.subjects, sub]
    }));
  };

  // Add list helper
  const addOtherSkill = () => {
    if (tempOtherSkill.trim()) {
      setSkills(prev => ({ ...prev, otherSkills: [...prev.otherSkills, tempOtherSkill.trim()] }));
      setTempOtherSkill('');
    }
  };

  const addStrength = () => {
    if (tempStrength.trim()) {
      setCareerGoals(prev => ({ ...prev, strengths: [...prev.strengths, tempStrength.trim()] }));
      setTempStrength('');
    }
  };

  const addWeakness = () => {
    if (tempWeakness.trim()) {
      setCareerGoals(prev => ({ ...prev, weaknesses: [...prev.weaknesses, tempWeakness.trim()] }));
      setTempWeakness('');
    }
  };

  // Add Project / Cert helpers
  const addProject = () => {
    if (newProject.title && newProject.description) {
      setProjects([...projects, newProject]);
      setNewProject({ title: '', description: '', technologies: '', link: '' });
    } else {
      toast('Project title and description are required.', 'error');
    }
  };

  const addCert = () => {
    if (newCert.name && newCert.issuingOrganization) {
      setCertifications([...certifications, newCert]);
      setNewCert({ name: '', issuingOrganization: '', credentialUrl: '' });
    } else {
      toast('Certification name and organization are required.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-slate-400">Loading profile data...</span>
        </div>
      </div>
    );
  }

  // Steps definitions
  const stepsHeader = [
    { id: 1, label: "Academics", icon: User },
    { id: 2, label: "Skills", icon: BookOpen },
    { id: 3, label: "Goals & Fit", icon: Brain },
    { id: 4, label: "Experience", icon: Briefcase },
    { id: 5, label: "Review", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="glow-blur -top-40 -left-40" />

      <div className="max-w-4xl mx-auto z-10 relative flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-5">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="font-extrabold text-sm tracking-wider text-white">AI MENTOR</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Step {step} of 5
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="w-full flex items-center justify-between gap-2 md:gap-4 overflow-x-auto pb-2">
          {stepsHeader.map((s) => {
            const StepIcon = s.icon;
            const isCompleted = step > s.id;
            const isActive = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 shrink-0 select-none">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-primary/20 border-primary text-primary shadow-glow shadow-primary/10'
                    : isActive
                      ? 'bg-primary border-primary text-white shadow-glow shadow-primary/25'
                      : 'border-white/15 bg-white/5 text-slate-500'
                }`}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                </div>
                <span className={`text-xs font-semibold hidden md:inline ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}>{s.label}</span>
                {s.id < 5 && <ChevronRight className="h-3 w-3 text-slate-700 hidden md:block" />}
              </div>
            );
          })}
        </div>

        {/* Form panel container */}
        <Card className="p-8 bg-card/10 flex flex-col gap-6 relative overflow-hidden min-h-[450px]">
          <div className="absolute top-0 right-0 h-full w-[40%] bg-glow-gradient opacity-20 blur-[50px] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              {/* STEP 1: Personal & Academics */}
              {step === 1 && (
                <div className="flex flex-col gap-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Personal & Academic Foundation</h2>
                    <p className="text-xs text-slate-400">Tell us about yourself and your academic standing.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Contact Phone"
                      placeholder="+1 (555) 019-2834"
                      value={personal.phone}
                      onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                      required
                    />
                    <Input
                      label="Location (City, Country)"
                      placeholder="San Francisco, CA"
                      value={personal.location}
                      onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                      required
                    />
                    <div>
                      <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase select-none block mb-1.5">Gender</label>
                      <select
                        value={personal.gender}
                        onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                        className="w-full h-11 bg-slate-950/40 border border-white/5 text-foreground rounded-lg px-3.5 text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10"
                      >
                        <option value="male" className="bg-[#111827]">Male</option>
                        <option value="female" className="bg-[#111827]">Female</option>
                        <option value="other" className="bg-[#111827]">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/5 my-2" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="College Name"
                      placeholder="Stanford University"
                      value={academic.college}
                      onChange={(e) => setAcademic({ ...academic, college: e.target.value })}
                      required
                    />
                    <Input
                      label="Degree Course"
                      placeholder="Bachelor of Science"
                      value={academic.degree}
                      onChange={(e) => setAcademic({ ...academic, degree: e.target.value })}
                      required
                    />
                    <Input
                      label="Branch / Stream"
                      placeholder="Computer Science & Engineering"
                      value={academic.branch}
                      onChange={(e) => setAcademic({ ...academic, branch: e.target.value })}
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Graduation Year"
                        type="number"
                        placeholder="2027"
                        value={academic.graduationYear || ''}
                        onChange={(e) => setAcademic({ ...academic, graduationYear: Number(e.target.value) })}
                        required
                      />
                      <Input
                        label="Current CGPA"
                        type="number"
                        step="0.01"
                        placeholder="3.85"
                        value={academic.cgpa || ''}
                        onChange={(e) => setAcademic({ ...academic, cgpa: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Skills Selection */}
              {step === 2 && (
                <div className="flex flex-col gap-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Skills Inventory</h2>
                    <p className="text-xs text-slate-400 font-medium">Select your current competencies. (Select at least 1 language & subject)</p>
                  </div>

                  {/* Languages Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 tracking-wide uppercase">Programming Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_LANGUAGES.map((lang) => {
                        const isSelected = skills.languages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary/20 border-primary text-white shadow-glow shadow-primary/5'
                                : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Core Subjects Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 tracking-wide uppercase">Core Academic Subjects</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SUBJECTS.map((sub) => {
                        const isSelected = skills.subjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubject(sub)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary/20 border-primary text-white shadow-glow shadow-primary/5'
                                : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Other Skills Builders */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 tracking-wide uppercase">Other Frameworks / Skills</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. React, Node.js, Docker, Kubernetes"
                        value={tempOtherSkill}
                        onChange={(e) => setTempOtherSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOtherSkill())}
                      />
                      <Button variant="outline" type="button" onClick={addOtherSkill} className="shrink-0 h-11 px-4">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {skills.otherSkills.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-slate-800 border border-white/5 text-xs text-slate-300 rounded px-2.5 py-1">
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => setSkills({ ...skills, otherSkills: skills.otherSkills.filter(val => val !== s) })}
                            className="text-slate-500 hover:text-white font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Goals & Career Preferences */}
              {step === 3 && (
                <div className="flex flex-col gap-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Career Goals & Style</h2>
                    <p className="text-xs text-slate-400">Map your learning path targets and study traits.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Preferred Career Role"
                      placeholder="e.g. Full-Stack Engineer, Machine Learning Engineer"
                      value={careerGoals.preferredCareer}
                      onChange={(e) => setCareerGoals({ ...careerGoals, preferredCareer: e.target.value })}
                      required
                    />
                    <div>
                      <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase select-none block mb-1.5">Career Path Confidence</label>
                      <select
                        value={careerGoals.confidenceLevel}
                        onChange={(e) => setCareerGoals({ ...careerGoals, confidenceLevel: e.target.value as any })}
                        className="w-full h-11 bg-slate-950/40 border border-white/5 text-foreground rounded-lg px-3.5 text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10"
                      >
                        <option value="high" className="bg-[#111827]">High Confidence</option>
                        <option value="medium" className="bg-[#111827]">Medium Confidence</option>
                        <option value="low" className="bg-[#111827]">Still Figuring It Out (Low)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths builder */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase">Your Strengths</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Problem Solving, Fast Learner"
                          value={tempStrength}
                          onChange={(e) => setTempStrength(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                        />
                        <Button variant="outline" type="button" onClick={addStrength} className="shrink-0 h-11">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {careerGoals.strengths.map((str, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-900/30 text-xs text-emerald-300 rounded px-2.5 py-1">
                            <span>{str}</span>
                            <button type="button" onClick={() => setCareerGoals({ ...careerGoals, strengths: careerGoals.strengths.filter(v => v !== str) })} className="text-emerald-500 font-bold">×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses builder */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase">Your Weaknesses</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Public Speaking, CSS layouts"
                          value={tempWeakness}
                          onChange={(e) => setTempWeakness(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWeakness())}
                        />
                        <Button variant="outline" type="button" onClick={addWeakness} className="shrink-0 h-11">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {careerGoals.weaknesses.map((wk, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-rose-950/30 border border-rose-900/30 text-xs text-rose-300 rounded px-2.5 py-1">
                            <span>{wk}</span>
                            <button type="button" onClick={() => setCareerGoals({ ...careerGoals, weaknesses: careerGoals.weaknesses.filter(v => v !== wk) })} className="text-rose-500 font-bold">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/5 my-1" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase block mb-1.5">Learning Style</label>
                      <select
                        value={preferences.learningStyle}
                        onChange={(e) => setPreferences({ ...preferences, learningStyle: e.target.value as any })}
                        className="w-full h-11 bg-slate-950/40 border border-white/5 text-foreground rounded-lg px-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10"
                      >
                        <option value="visual" className="bg-[#111827]">Visual (Videos/Diagrams)</option>
                        <option value="auditory" className="bg-[#111827]">Auditory (Podcasts/Lectures)</option>
                        <option value="read-write" className="bg-[#111827]">Read / Write (Docs/Blogs)</option>
                        <option value="kinesthetic" className="bg-[#111827]">Kinesthetic (Coding Practice)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase block mb-1.5">Daily Study Target</label>
                      <select
                        value={preferences.dailyStudyTime}
                        onChange={(e) => setPreferences({ ...preferences, dailyStudyTime: Number(e.target.value) })}
                        className="w-full h-11 bg-slate-950/40 border border-white/5 text-foreground rounded-lg px-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10"
                      >
                        <option value="1" className="bg-[#111827]">1 Hour</option>
                        <option value="2" className="bg-[#111827]">2 Hours</option>
                        <option value="4" className="bg-[#111827]">4 Hours</option>
                        <option value="6" className="bg-[#111827]">6+ Hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase block mb-1.5">Communication Skills</label>
                      <select
                        value={preferences.communicationSkills}
                        onChange={(e) => setPreferences({ ...preferences, communicationSkills: e.target.value as any })}
                        className="w-full h-11 bg-slate-950/40 border border-white/5 text-foreground rounded-lg px-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10"
                      >
                        <option value="excellent" className="bg-[#111827]">Excellent (Fluent)</option>
                        <option value="good" className="bg-[#111827]">Good</option>
                        <option value="average" className="bg-[#111827]">Average</option>
                        <option value="needs-improvement" className="bg-[#111827]">Needs Improvement</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Preferred Learning Language"
                      placeholder="e.g. English, Hindi, Spanish"
                      value={preferences.preferredLanguage}
                      onChange={(e) => setPreferences({ ...preferences, preferredLanguage: e.target.value })}
                      required
                    />
                    <Input
                      label="Laptop / Hardware Specs"
                      placeholder="e.g. 8GB RAM, Windows Laptop (i5)"
                      value={preferences.laptopSpecs}
                      onChange={(e) => setPreferences({ ...preferences, laptopSpecs: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Projects & Links */}
              {step === 4 && (
                <div className="flex flex-col gap-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Projects & Professional Profiles</h2>
                    <p className="text-xs text-slate-400">List previous builds and professional URLs.</p>
                  </div>

                  {/* Dynamic Projects Adder */}
                  <div className="border border-white/5 rounded-xl p-4 bg-white/2 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add a Project</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Project Title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
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
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          placeholder="GitHub/Live Demo link"
                          value={newProject.link}
                          onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button variant="outline" type="button" onClick={addProject} className="self-end text-xs h-8">
                      <Plus className="h-3 w-3 mr-1" /> Add Project
                    </Button>
                  </div>

                  {/* Projects List display */}
                  {projects.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Projects Added</label>
                      <div className="grid grid-cols-1 gap-2">
                        {projects.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-start border border-white/5 bg-[#111827]/40 rounded-lg p-3">
                            <div>
                              <h5 className="font-bold text-white text-xs">{p.title}</h5>
                              <p className="text-[10px] text-slate-400 leading-tight mt-1">{p.description}</p>
                              <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 rounded px-1.5 py-0.2 mt-2 inline-block">
                                {p.technologies}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="h-[1px] bg-white/5" />

                  {/* Certifications builder */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <Input
                      label="Certificate Name"
                      placeholder="AWS Cloud Practitioner"
                      value={newCert.name}
                      onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    />
                    <Input
                      label="Issuing Organization"
                      placeholder="Amazon Web Services"
                      value={newCert.issuingOrganization}
                      onChange={(e) => setNewCert({ ...newCert, issuingOrganization: e.target.value })}
                    />
                    <Button variant="outline" type="button" onClick={addCert} className="h-11">
                      <Plus className="h-4 w-4 mr-1" /> Add Cert
                    </Button>
                  </div>

                  {certifications.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {certifications.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-800/30 border border-white/5 rounded-lg px-3.5 py-2 text-xs">
                          <div>
                            <span className="font-bold text-white">{c.name}</span>
                            <span className="text-slate-500 mx-2">|</span>
                            <span className="text-slate-400">{c.issuingOrganization}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="h-[1px] bg-white/5" />

                  {/* Social links */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="GitHub Profile URL"
                      placeholder="https://github.com/yourusername"
                      value={socials.github}
                      onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                    />
                    <Input
                      label="LinkedIn Profile URL"
                      placeholder="https://linkedin.com/in/yourusername"
                      value={socials.linkedin}
                      onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                    />
                    <Input
                      label="Resume Link / File URL"
                      placeholder="https://drive.google.com/resume"
                      value={socials.resumeUrl}
                      onChange={(e) => setSocials({ ...socials, resumeUrl: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Final Review & Confirmation */}
              {step === 5 && (
                <div className="flex flex-col gap-6 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Review & Confirm Profile</h2>
                    <p className="text-xs text-slate-400 font-medium">Verify your entries before locking profile creation.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Academic panel */}
                    <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                      <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" /> Academics & Bio
                      </h4>
                      <div className="text-xs flex flex-col gap-1.5 text-slate-300">
                        <div><strong className="text-slate-400">College:</strong> {academic.college}</div>
                        <div><strong className="text-slate-400">Degree:</strong> {academic.degree} ({academic.branch})</div>
                        <div><strong className="text-slate-400">GPA / Year:</strong> {academic.cgpa} CGPA | Graduating {academic.graduationYear}</div>
                        <div><strong className="text-slate-400">Location / Tel:</strong> {personal.location} | {personal.phone}</div>
                      </div>
                    </div>

                    {/* Skill summary */}
                    <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                      <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-primary" /> Skill Summary
                      </h4>
                      <div className="text-xs flex flex-col gap-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          <strong className="text-slate-400 w-full mb-1">Languages:</strong>
                          {skills.languages.map(l => (
                            <span key={l} className="bg-slate-800 border border-white/5 text-slate-300 px-2 py-0.5 rounded text-[10px]">{l}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <strong className="text-slate-400 w-full mb-1">Academic Subjects:</strong>
                          {skills.subjects.map(s => (
                            <span key={s} className="bg-slate-800 border border-white/5 text-slate-300 px-2 py-0.5 rounded text-[10px]">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Goals panel */}
                    <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                      <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-primary" /> Career Path & Focus
                      </h4>
                      <div className="text-xs flex flex-col gap-1.5 text-slate-300">
                        <div><strong className="text-slate-400">Target Role:</strong> {careerGoals.preferredCareer}</div>
                        <div><strong className="text-slate-400">Confidence:</strong> {careerGoals.confidenceLevel.toUpperCase()}</div>
                        <div><strong className="text-slate-400">Study Goal:</strong> {preferences.dailyStudyTime} Hours Daily | {preferences.learningStyle}</div>
                        <div><strong className="text-slate-400">System Specs:</strong> {preferences.laptopSpecs}</div>
                      </div>
                    </div>

                    {/* Profiles and Links */}
                    <div className="border border-white/5 bg-white/2 rounded-xl p-4 flex flex-col gap-2">
                      <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-1 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-primary" /> Professional Links
                      </h4>
                      <div className="text-xs flex flex-col gap-1.5 text-slate-300 truncate">
                        <div><strong className="text-slate-400">GitHub:</strong> {socials.github || 'Not provided'}</div>
                        <div><strong className="text-slate-400">LinkedIn:</strong> {socials.linkedin || 'Not provided'}</div>
                        <div><strong className="text-slate-400">Resume Link:</strong> {socials.resumeUrl || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Warning banner */}
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-slate-300">
                    <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
                    <span>Clicking final submission triggers AI recommendation pipelines to initialize custom roadmaps, match projects, and calibrate milestones.</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav Controls Footer inside Card */}
          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isSaving}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            
            {step < 5 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                isLoading={isSaving}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSaving}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 border-none hover:shadow-glow shadow-violet-500/20"
                rightIcon={<CheckCircle className="h-4 w-4" />}
              >
                Complete Onboarding
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default OnboardingWizard;
