import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Compass, 
  BookOpen, Code, Briefcase, Cpu, Plus, Minus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  } as any;

  const features = [
    {
      icon: <Compass className="h-6 w-6 text-rose-400" />,
      title: "Career Pathfinder Engine",
      desc: "Analyzes your interests, academic profile, and technical competencies to match high-probability career trajectories."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-rose-400" />,
      title: "Personalized Roadmap Builder",
      desc: "Auto-generates node-based learning roadmaps tailored to your study commitment, confidence level, and tech goals."
    },
    {
      icon: <Code className="h-6 w-6 text-rose-400" />,
      title: "Interactive AI Learning",
      desc: "Guided step-by-step learning loop: Explain → Teach → Practice → Evaluate → Feedback → Next Objective."
    },
    {
      icon: <Briefcase className="h-6 w-6 text-rose-400" />,
      title: "Placement Readiness Simulator",
      desc: "Simulate interview prep, track resume milestones, and identify knowledge gaps relative to target job roles."
    }
  ];

  const steps = [
    { num: "01", title: "Complete Profile Onboarding", desc: "Detail your academic background, preferred languages, CS subjects, and daily study targets." },
    { num: "02", title: "AI Analysis & Roadmap", desc: "Our AI model analyzes your skills, evaluates career fit, and builds your custom milestone roadmap." },
    { num: "03", title: "Interactive AI Learning", desc: "Engage in guided practice, answer AI evaluation questions, and unlock next modules." },
    { num: "04", title: "Track Growth Progress", desc: "Monitor your weekly growth timeline, placement readiness score, and continuous skill improvements." }
  ];

  const stats = [
    { label: "Career Path Vectors", val: "14,800+" },
    { label: "Skills Unlocked", val: "92,000+" },
    { label: "AI Mentor Accuracy", val: "99.4%" },
    { label: "Placement Readiness Rate", val: "94.2%" }
  ];

  const faqs = [
    { q: "How does AI Mentor generate my personalized roadmap?", a: "AI Mentor evaluates your academic standing, current programming languages, core CS subjects, strengths, and daily study availability to generate a structured, multi-tier learning roadmap." },
    { q: "Can I resume my onboarding progress if I leave?", a: "Yes. Our multi-stage onboarding system auto-saves your progress at each stage, ensuring your entries persist seamlessly." },
    { q: "Does AI Mentor work with custom tech stacks?", a: "Absolutly. Whether your goal is Full-Stack Development, Data Science, Systems Engineering, or Machine Learning, AI Mentor tailors recommendations to your exact stack." }
  ];

  return (
    <div className="flex flex-col gap-32 py-10 md:py-16">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-8 mt-4 md:mt-12">
        <div className="absolute top-[-100px] left-[50%] -translate-x-[50%] h-[350px] w-[350px] md:w-[750px] bg-gradient-to-r from-rose-600/20 via-rose-500/10 to-rose-700/20 rounded-full blur-[130px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-xs text-rose-400 font-bold uppercase tracking-widest shadow-glow"
        >
          <Sparkles className="h-4 w-4 text-rose-400" />
          YOUR AI MENTOR FOR THE JOURNEY AHEAD
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-5xl"
        >
          THE PERSONALIZED <br />
          CAREER & LEARNING <br />
          <span className="text-gradient-crimson">OPERATING SYSTEM</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm md:text-lg text-slate-300 max-w-3xl leading-relaxed font-medium"
        >
          Tell AI Mentor where you are → AI Mentor understands you → AI Mentor tells you where to go → AI Mentor builds your roadmap → AI Mentor teaches you → AI Mentor tracks your progress.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto"
        >
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
            onClick={() => navigate('/onboarding')}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-crimson-glow text-base px-8 py-3.5"
          >
            Build My Roadmap
          </Button>
          <Button variant="glass" size="lg" onClick={() => navigate('/login')}>
            Explore AI Mentor
          </Button>
        </motion.div>

        {/* Visual Orb & Interactive Node Pathway graphic */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full max-w-4xl mt-8 p-6 md:p-8 rounded-2xl border border-[#27272A] bg-[#111111]/90 shadow-glass relative overflow-hidden flex flex-col gap-6"
        >
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">AI PATHWAY ENGINE</span>
            </div>
            <span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">LIVE SIMULATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-[#27272A] bg-[#171717]/60 flex flex-col gap-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STUDENT PROFILE</span>
              <h4 className="text-sm font-bold text-white">Computer Science • Year 3</h4>
              <p className="text-xs text-slate-400">Python, SQL, Data Structures</p>
            </div>
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 flex flex-col gap-2 text-left shadow-glow">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5" /> AI MENTOR DECISION
              </span>
              <h4 className="text-sm font-bold text-white">Full-Stack AI Engineer</h4>
              <p className="text-xs text-slate-300">Match 94% • 12-Week Roadmap</p>
            </div>
            <div className="p-4 rounded-xl border border-[#27272A] bg-[#171717]/60 flex flex-col gap-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FIRST MILESTONE</span>
              <h4 className="text-sm font-bold text-white">Advanced DSA & APIs</h4>
              <p className="text-xs text-slate-400">2 Hours Daily Target</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl border border-[#27272A] bg-[#111111] text-center relative overflow-hidden shadow-glass">
          <div className="absolute top-0 right-0 h-full w-[40%] bg-glow-crimson opacity-30 blur-[40px] pointer-events-none" />
          {stats.map((st, i) => (
            <div key={i} className="flex flex-col gap-1 border-r last:border-0 border-[#27272A]">
              <span className="text-2xl md:text-5xl font-black text-white font-mono tracking-tight">{st.val}</span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WHAT PROBLEM WE SOLVE */}
      <section className="max-w-7xl mx-auto px-6 w-full text-center flex flex-col items-center gap-16">
        <div className="max-w-3xl flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">The Problem We Solve</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">University Curriculums Don't Prepare You For Careers</h3>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
            Generic dashboards and static university syllabi leave students trapped in tutorial hell without a clear roadmap to job readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Card hoverEffect className="flex flex-col gap-4 text-left border-[#27272A] bg-[#111111]">
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">01</div>
            <h4 className="font-bold text-base text-white">Outdated Curriculums</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Academic subjects focus on theory rather than production-grade engineering skills needed by real tech companies.
            </p>
          </Card>
          <Card hoverEffect className="flex flex-col gap-4 text-left border-[#27272A] bg-[#111111]">
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">02</div>
            <h4 className="font-bold text-base text-white">No Personalization</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Every student has different strengths, weaknesses, and study time limits, yet standard courses treat everyone identically.
            </p>
          </Card>
          <Card hoverEffect className="flex flex-col gap-4 text-left border-[#27272A] bg-[#111111]">
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">03</div>
            <h4 className="font-bold text-base text-white">Placement Readiness Gap</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Students lack mock interview evaluation, project feedback, and step-by-step guidance to convert skills into job offers.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. HOW AI MENTOR WORKS */}
      <section id="features" className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center gap-16 scroll-mt-20">
        <div className="max-w-3xl text-center flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">Intelligent System</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">AI Pathfinder Core Features</h3>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
            Four specialized engines working together to power your complete learning journey.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          {features.map((feat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card hoverEffect className="h-full flex flex-col justify-between items-start gap-6 bg-[#111111] border-[#27272A]">
                <div className="p-3 bg-[#171717] border border-rose-500/30 rounded-xl text-rose-400 shadow-glow">
                  {feat.icon}
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <h4 className="font-bold text-base text-white">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. JOURNEY PIPELINE */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center gap-20 scroll-mt-20">
        <div className="max-w-3xl text-center flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">The Pipeline</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">How AI Mentor Guides You</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative w-full">
          <div className="hidden md:block absolute top-10 left-8 right-8 h-[1px] bg-gradient-to-r from-rose-500/10 via-rose-500/40 to-rose-500/10 z-0" />
          
          {steps.map((st, i) => (
            <div key={i} className="flex flex-col items-start gap-4 text-left z-10 relative">
              <span className="text-4xl font-black text-rose-500/40 border-b border-[#27272A] pb-2.5 w-full font-mono">{st.num}</span>
              <h4 className="font-bold text-sm text-white">{st.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-6 w-full flex flex-col items-center gap-16 scroll-mt-20">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">FAQ</h2>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h3>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border border-[#27272A] bg-[#111111] rounded-xl p-5 cursor-pointer select-none transition-all hover:bg-[#171717] shadow-glass"
              onClick={() => toggleFaq(i)}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200">{faq.q}</span>
                {activeFaq === i ? <Minus className="h-4.5 w-4.5 text-rose-400" /> : <Plus className="h-4.5 w-4.5 text-slate-400" />}
              </div>
              {activeFaq === i && (
                <div className="text-xs text-slate-400 leading-relaxed mt-3 border-t border-[#27272A] pt-3 font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
export default LandingPage;
