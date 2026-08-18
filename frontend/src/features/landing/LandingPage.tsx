import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Compass, BookOpen, Briefcase, 
  CheckCircle, Plus, Minus, Code, GraduationCap 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Accordion state for FAQs
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  } as any;

  const features = [
    {
      icon: <Compass className="h-6 w-6 text-violet-400" />,
      title: "Career Path Predictor",
      desc: "Analyze your interests, academic profile, and technical competencies to find high-probability placement paths."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-indigo-400" />,
      title: "Personalized Syllabus Maps",
      desc: "Auto-generate node-based learning roadmaps tailored to your study time, confidence levels, and tech goals."
    },
    {
      icon: <Code className="h-6 w-6 text-purple-400" />,
      title: "Curated Project Matching",
      desc: "Get personalized project ideas matching your stack, complete with source structures, guidelines, and API recommendations."
    },
    {
      icon: <Briefcase className="h-6 w-6 text-pink-400" />,
      title: "Placement Readiness Simulator",
      desc: "Simulate interview prep, track resume milestones, and identify knowledge gaps relative to target job roles."
    }
  ];

  const steps = [
    { num: "01", title: "Complete Profile Onboarding", desc: "Detail your background, preferred languages, academic records, and laptop constraints." },
    { num: "02", title: "Generate Custom Roadmap", desc: "Our AI model compiles a custom roadmap tailored to your specific background and targets." },
    { num: "03", title: "Track Progress & Milestones", desc: "Complete syllabus chapters, submit projects, link GitHub, and track growth progress dynamically." },
    { num: "04", title: "Placement Simulation", desc: "Get feedback on mock interviews, placement prep levels, and suggestions for improvement." }
  ];

  const stats = [
    { label: "Predictive Paths Mapped", val: "12,450+" },
    { label: "Target Skills Unlocked", val: "84,000+" },
    { label: "AI Recommendations Served", val: "99.8%" },
    { label: "Mock Interviews Simulated", val: "4,200+" }
  ];

  const testimonials = [
    {
      name: "Rohan Sharma",
      role: "Software Dev Engineer, Microsoft",
      quote: "AI Mentor gave me a structured roadmap to prepare for placements. Instead of drowning in arbitrary tutorial loops, I completed specific projects that got me hired.",
      avatar: "R"
    },
    {
      name: "Ananya Iyer",
      role: "Systems Designer, Stripe",
      quote: "The career path predictions were incredibly accurate. It tailored recommendations according to my daily study schedule and hardware constraints.",
      avatar: "A"
    }
  ];

  const faqs = [
    { q: "How does AI Mentor predict my career path?", a: "AI Mentor uses a structured profile matching engine that reviews your academic records, interests, programming strengths, and confidence level to highlight paths like Frontend, Backend, Data Science, or DevOps." },
    { q: "Can I save my onboarding progress and return later?", a: "Yes. Our multi-step onboarding wizard automatically saves your progress step-by-step to the database, allowing you to resume exactly where you left off." },
    { q: "Is the curriculum mapping updated dynamically?", a: "Absolutely. As you tick off skills and complete projects, the recommendations engine adjusts resources and daily study times to keep your targets on track." }
  ];

  return (
    <div className="flex flex-col gap-32 py-10 md:py-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-8 mt-6 md:mt-16">
        <div className="absolute top-[-120px] left-[50%] -translate-x-[50%] h-[350px] w-[350px] md:w-[700px] bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-slate-900/50 text-[10px] text-slate-300 font-bold uppercase tracking-widest mb-1 shadow-glass-inset"
        >
          <GraduationCap className="h-4 w-4 text-accent" />
          The Student Career Co-Pilot
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-5xl"
        >
          Your Personalized Career & <br />
          <span className="text-gradient-purple">Learning Operating System</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm md:text-lg text-slate-400 max-w-3xl leading-relaxed font-medium"
        >
          Map your skills, establish custom syllabus paths, execute real projects, and build absolute readiness for technical placement rounds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto"
        >
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
            onClick={() => navigate('/signup')}
            className="shadow-premium"
          >
            Launch AI Mentor Free
          </Button>
          <Button variant="glass" size="lg" onClick={() => navigate('/login')}>
            Sign In to Dashboard
          </Button>
        </motion.div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 md:p-10 rounded-2xl border border-white/5 bg-slate-950/20 backdrop-blur-md text-center relative overflow-hidden shadow-glass">
          <div className="absolute top-0 right-0 h-full w-[40%] bg-glow-gradient opacity-30 blur-[40px] pointer-events-none" />
          {stats.map((st, i) => (
            <div key={i} className="flex flex-col gap-1.5 border-r last:border-0 border-white/5">
              <span className="text-2xl md:text-5xl font-black text-white tracking-tight">{st.val}</span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section className="max-w-7xl mx-auto px-6 w-full text-center flex flex-col items-center gap-16">
        <div className="max-w-3xl flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-accent tracking-widest uppercase">The Dilemma</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Why University Curriculums Fall Short</h3>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
            Standard syllabus targets grades over real engineering competence. Students lack clarity on role expectations, coding structure, and placement guidelines, leading to tutorial exhaustion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Card hoverEffect className="flex flex-col gap-4 text-left border-white/5 bg-slate-950/20">
            <h4 className="font-bold text-base text-white">Static Curriculums</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Standard university modules focus on theoretical syllabus points rather than the dynamic technical requirements of modern production environments.
            </p>
          </Card>
          <Card hoverEffect className="flex flex-col gap-4 text-left border-white/5 bg-slate-950/20">
            <h4 className="font-bold text-base text-white">Project Guesswork</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Building generic calculator/todo apps doesn't impress hiring committees. Students struggle to build production-quality architectures with proper tests.
            </p>
          </Card>
          <Card hoverEffect className="flex flex-col gap-4 text-left border-white/5 bg-slate-950/20">
            <h4 className="font-bold text-base text-white">Job Readiness Deficit</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Applying without simulating technical coding screens, communication reviews, or layout optimizations limits student landing rates significantly.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center gap-16 scroll-mt-20">
        <div className="max-w-3xl text-center flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-accent tracking-widest uppercase">Core Engines</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">AI-Powered Personalized Pathfinders</h3>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
            A comprehensive pipeline that dynamically maps, educates, structures, and reviews your technical journey.
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
              <Card hoverEffect className="h-full flex flex-col justify-between items-start gap-6 bg-slate-950/25 border-white/5">
                <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-accent shadow-premium">
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

      {/* 5. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center gap-20 scroll-mt-20">
        <div className="max-w-3xl text-center flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-accent tracking-widest uppercase">The Pipeline</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">How AI Mentor Guides You</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative w-full">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-10 left-8 right-8 h-[1px] bg-gradient-to-r from-violet-500/5 via-violet-500/25 to-violet-500/5 z-0" />
          
          {steps.map((st, i) => (
            <div key={i} className="flex flex-col items-start gap-4 text-left z-10 relative">
              <span className="text-4xl font-black text-slate-800 border-b border-white/5 pb-2.5 w-full font-mono">{st.num}</span>
              <h4 className="font-bold text-sm text-white">{st.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center gap-16">
        <div className="max-w-3xl text-center flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-accent tracking-widest uppercase">Student Success</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Alumni Placements Reports</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {testimonials.map((test, i) => (
            <Card key={i} className="flex flex-col gap-6 text-left bg-slate-950/20 border-white/5 shadow-glass">
              <p className="text-sm text-slate-300 italic leading-relaxed font-medium">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-premium-gradient flex items-center justify-center font-bold text-white shadow-premium">
                  {test.avatar}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">{test.name}</h5>
                  <p className="text-[10px] text-slate-400 font-semibold">{test.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. PRICING SECTION (Future Ready) */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center gap-16 scroll-mt-20">
        <div className="max-w-3xl text-center flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-accent tracking-widest uppercase">Flexible Plans</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Launch Your Journey Today</h3>
          <p className="text-slate-400 text-[10px] tracking-wider font-bold uppercase bg-slate-900 border border-white/5 px-3.5 py-1.5 rounded-full inline-block mx-auto mt-2 shadow-glass-inset">
            🚀 Future Ready Plans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Free Tier */}
          <Card className="flex flex-col justify-between items-start gap-8 bg-slate-950/20 border-white/5 relative p-8">
            <div className="flex flex-col gap-2 w-full text-left">
              <h4 className="font-bold text-lg text-white">Standard Mentor</h4>
              <p className="text-xs text-slate-400 font-medium">Perfect for exploring pathfinding goals.</p>
              <div className="text-4xl font-black text-white mt-4">$0 <span className="text-xs text-slate-500 font-normal">/ forever</span></div>
            </div>
            <ul className="flex flex-col gap-3.5 text-xs text-slate-300 w-full text-left">
              <li className="flex items-center gap-2.5 font-medium"><CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> Basic Career Pathfinder</li>
              <li className="flex items-center gap-2.5 font-medium"><CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> Multi-Step Profile Wizard</li>
              <li className="flex items-center gap-2.5 font-medium"><CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> Standard Syllabus Roadmap</li>
            </ul>
            <Button variant="glass" className="w-full" onClick={() => navigate('/signup')}>
              Sign Up Free
            </Button>
          </Card>

          {/* Premium Tier */}
          <Card className="flex flex-col justify-between items-start gap-8 bg-slate-950/20 border-accent/20 relative p-8 shadow-premium">
            <div className="absolute top-0 right-0 h-full w-[45%] bg-glow-gradient opacity-20 blur-[30px] pointer-events-none" />
            <div className="flex flex-col gap-2 w-full text-left relative z-10">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg text-white">Premium Architect</h4>
                <span className="text-[9px] bg-primary/20 text-violet-400 border border-primary/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Popular</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Total guidance from roadmap to offer letter.</p>
              <div className="text-4xl font-black text-white mt-4">$15 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
            </div>
            <ul className="flex flex-col gap-3.5 text-xs text-slate-300 w-full text-left relative z-10">
              <li className="flex items-center gap-2.5 font-medium"><CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> Dynamic adaptive syllabus trackers</li>
              <li className="flex items-center gap-2.5 font-medium"><CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> Deep repository code evaluations</li>
              <li className="flex items-center gap-2.5 font-medium"><CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> Real-time placement mock queries</li>
              <li className="flex items-center gap-2.5 font-medium"><CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> Cloud upload integrations & resume review</li>
            </ul>
            <Button variant="primary" className="w-full relative z-10" onClick={() => navigate('/signup')}>
              Unlock Pro Now
            </Button>
          </Card>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-6 w-full flex flex-col items-center gap-16 scroll-mt-20">
        <div className="text-center flex flex-col gap-3">
          <h2 className="text-[10px] font-bold text-accent tracking-widest uppercase">FAQ</h2>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h3>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border border-white/5 bg-slate-950/20 rounded-xl p-5 cursor-pointer select-none transition-all hover:bg-slate-900/40 shadow-glass"
              onClick={() => toggleFaq(i)}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200">{faq.q}</span>
                {activeFaq === i ? <Minus className="h-4.5 w-4.5 text-accent" /> : <Plus className="h-4.5 w-4.5 text-slate-400" />}
              </div>
              {activeFaq === i && (
                <div className="text-xs text-slate-400 leading-relaxed mt-3 border-t border-white/5 pt-3 animate-in fade-in slide-in-from-top-1 duration-200 font-medium">
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
