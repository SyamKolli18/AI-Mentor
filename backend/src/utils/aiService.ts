import mongoose from 'mongoose';
import { IUser, IAIProfile, ICareerRecommendation } from '../models/User';
import { IRoadmapModule } from '../models/Roadmap';
import { LearningResource } from '../models/LearningResource';
import { env } from '../config/env';
import { GeminiService } from './geminiService';

export interface IAIExplainTeach {
  conceptName: string;
  simpleExplanation: string;
  realWorldAnalogy: string;
  codeExample?: string;
  whyItMatters: string;
  keyTakeaways: string[];
}

export interface IAIPracticeQuestions {
  mcqs: Array<{ question: string; options: string[]; answerIndex: number; explanation: string }>;
  conceptQuestions: Array<{ question: string; sampleAnswer: string }>;
  codingQuestions: Array<{ prompt: string; starterCode: string; solution: string }>;
}

export interface IAIEvaluationResult {
  score: number;
  correctUnderstanding: string[];
  misconceptions: string[];
  missingConcepts: string[];
  mistakes: string[];
  feedbackText: string;
}

export interface IAdaptiveDecision {
  status: 'Strong topic' | 'Weak topic' | 'Needs revision' | 'Ready for next module' | 'Needs prerequisite';
  nextAction: 'Continue' | 'Revise' | 'Practice more' | 'Learn prerequisite' | 'Retry assessment';
  recommendationReason: string;
  easierExamples?: string[];
  suggestedPrerequisites?: string[];
}

// Prompt Templates (Phase 4-6)
export const PROMPT_TEMPLATES = {
  PROFILE_ANALYSIS: `
    You are an expert AI Career Mentor. Analyze the following student profile:
    Name: {{name}}
    Degree: {{degree}} in {{branch}}
    College: {{college}}
    GPA: {{cgpa}}/10
    Skills: {{languages}}, Core Subjects: {{subjects}}, Other: {{otherSkills}}
    Strengths: {{strengths}}, Weaknesses: {{weaknesses}}
    Learning Style: {{learningStyle}}, Daily Study Allocation: {{dailyStudyTime}} hours

    Provide a professional assessment of their skills, career readiness score (0-100), technical readiness, and qualitative insights.
  `,

  CAREER_RECOMMENDATIONS: `
    Based on the analyzed student profile, recommend the top 3 career paths.
    For each path, provide:
    - Career Name
    - Match Percentage (0-100)
    - Why it matches
    - Required Skills & Skill Gaps
    - Expected Salary Range
    - Difficulty Level
  `,

  ROADMAP_GENERATION: `
    Generate a personalized roadmap for:
    Target Career: {{targetCareer}}
    Learning Style: {{learningStyle}}
    Daily Study Time: {{dailyStudyTime}} hours
    Current Skills: {{languages}}
    Weaknesses: {{weaknesses}}

    Provide a 3-stage module sequence. Return a JSON matching standard RoadmapModule structures.
  `
};

export class AIService {
  
  /**
   * Evaluates student profile to output scores and qualitative insights
   */
  public static async analyzeProfile(user: IUser): Promise<IAIProfile> {
    console.log(`🤖 [AI SERVICE] Analyzing profile for student: ${user.name}`);
    
    const o = user.onboarding;
    
    // Compute scores based on profile parameters
    let programming = 50;
    let problemSolving = 55;
    let communication = 60;
    let mathematics = 65;
    let consistency = 70;
    let learningSpeed = 60;

    // Adjust programming based on languages selected
    if (o.skills?.languages) {
      programming += o.skills.languages.length * 8;
      if (programming > 95) programming = 95;
    }
    
    // Adjust problem solving based on core subjects (Data Structures/Algorithms)
    if (o.skills?.subjects) {
      const hasDSA = o.skills.subjects.some(s => s.includes('Data Structure') || s.includes('Algorithm'));
      if (hasDSA) problemSolving += 25;
      problemSolving += o.skills.subjects.length * 4;
      if (problemSolving > 98) problemSolving = 98;
    }

    // Adjust communication based on selection
    if (o.preferences?.communicationSkills === 'excellent') communication = 92;
    else if (o.preferences?.communicationSkills === 'good') communication = 78;
    else if (o.preferences?.communicationSkills === 'average') communication = 60;
    else communication = 45;

    // Adjust consistency based on daily study time
    if (o.preferences?.dailyStudyTime && o.preferences.dailyStudyTime >= 6) consistency = 95;
    else if (o.preferences?.dailyStudyTime && o.preferences.dailyStudyTime >= 4) consistency = 85;
    else if (o.preferences?.dailyStudyTime && o.preferences.dailyStudyTime >= 2) consistency = 70;
    else consistency = 50;

    // Learning speed and confidence
    const confidenceMap = { high: 88, medium: 70, low: 45 };
    const confidence = confidenceMap[o.careerGoals?.confidenceLevel || 'medium'];
    learningSpeed = o.preferences?.learningStyle === 'kinesthetic' ? 82 : 70;

    // CS Fundamentals and Dev Readiness calculations
    const csFundamentals = Math.min(40 + (o.skills?.subjects?.length || 0) * 10, 95);
    const devReadiness = Math.min(30 + (o.experience?.projects?.length || 0) * 20, 95);
    const technicalReadiness = Math.round((programming + problemSolving + csFundamentals) / 3);
    const careerReadinessScore = Math.round((technicalReadiness + communication + devReadiness) / 3);

    // Timeline calculations
    const dailyStudyHours = o.preferences?.dailyStudyTime || 2;
    const weeklyEffortHours = dailyStudyHours * 5;
    const monthsRequired = Math.max(3, Math.min(12, Math.ceil(15 / dailyStudyHours)));
    const estimatedCompletionDate = new Date(Date.now() + monthsRequired * 30 * 24 * 60 * 60 * 1000);

    // Qualitative Insights & Observations (Part 1)
    const insights: string[] = [];
    const observations: string[] = [];
    const studyRecommendations: string[] = [];
    const improvementSuggestions: string[] = [];

    // Observations & warnings detection
    const languagesLower = (o.skills?.languages || []).map(l => l.toLowerCase());
    const otherSkillsLower = (o.skills?.otherSkills || []).map(s => s.toLowerCase());
    const hasReact = otherSkillsLower.some(s => s.includes('react') || s.includes('next'));
    const hasJS = languagesLower.some(l => l.includes('javascript') || l.includes('typescript') || l.includes('js') || l.includes('ts'));
    
    if (hasReact && !hasJS) {
      observations.push("⚠️ Prerequisite Alert: You understand React/Next but lack core JavaScript fundamentals. Focus on closures, DOM, and promises.");
      studyRecommendations.push("Master JavaScript ES6 syntax before diving deeper into React state hooks.");
    }

    const hasDocker = otherSkillsLower.some(s => s.includes('docker') || s.includes('kubernetes') || s.includes('cloud') || s.includes('aws'));
    const hasGit = otherSkillsLower.some(s => s.includes('git') || s.includes('github') || s.includes('gitlab'));

    if (hasDocker && !hasGit) {
      observations.push("⚠️ Sequence Warning: You should improve Git versioning workflows before learning Docker containers.");
      studyRecommendations.push("Set up a local Git repository and practice branching merges before writing Dockerfiles.");
    }

    const hasNode = otherSkillsLower.some(s => s.includes('node') || s.includes('express'));
    if (hasNode && !hasJS) {
      observations.push("⚠️ Prerequisite Alert: NodeJS should be postponed until JavaScript asynchronous mastery is complete.");
      studyRecommendations.push("Learn Event Loops and Callback models in native JS before writing Express middleware.");
    }

    // Default observations if none triggered
    if (observations.length === 0) {
      observations.push("✅ Prerequisite check: Your selected skills align logically. Core requirements are satisfied.");
      studyRecommendations.push("Maintain a continuous coding log of your project builds on GitHub.");
    }

    // Insights & suggestions
    if (o.preferences?.learningStyle === 'kinesthetic') {
      insights.push("💡 You learn faster through active project execution and hands-on coding than reading documentation.");
      studyRecommendations.push("Focus on building mini-projects at the end of each syllabus topic.");
    } else {
      insights.push("📚 You have strong reading habits; you absorb concepts best via documentation and detailed guides.");
      studyRecommendations.push("Utilize official reference documentations and developer cheat-sheets.");
    }

    if (communication < 65) {
      insights.push("🗣️ Enhancing communication clarity is recommended to excel in technical placement rounds and group tasks.");
      improvementSuggestions.push("Practice mock pitch sessions or communication review quizzes.");
    } else {
      insights.push("🌟 Your communication confidence is high, making you a strong fit for technical presentations and collaboration.");
      improvementSuggestions.push("Mentor peers in technical study groups to build leadership skills.");
    }

    if (programming >= 80 && problemSolving >= 80) {
      insights.push("🧠 You show exceptional core analytical abilities and solid logic foundations. Suitable for complex structures.");
    } else {
      improvementSuggestions.push("Solve 2-3 algorithmic problems daily on coding practice sites.");
    }

    const laptop = o.preferences?.laptopSpecs?.toLowerCase() || '';
    if (laptop.includes('4gb') || laptop.includes('intel core i3') || laptop.includes('budget')) {
      insights.push("⚠️ Hardware constraints detected: Target cloud-based development spaces (GitHub Codespaces, Google Colab) for heavy computing.");
    }

    return {
      scores: {
        programming,
        problemSolving,
        communication,
        mathematics,
        creativity: Math.floor((programming + communication) / 2) + 5,
        consistency,
        learningSpeed,
        confidence,
        
        careerReadinessScore,
        technicalReadiness,
        programmingScore: programming,
        problemSolvingScore: problemSolving,
        communicationScore: communication,
        learningConsistency: consistency,
        mathematicsReadiness: mathematics,
        csFundamentals,
        devReadiness,
        aiConfidenceScore: confidence
      },
      insights,
      observations,
      timelineEstimate: {
        monthsRequired,
        weeklyEffortHours,
        dailyStudyHours,
        estimatedCompletionDate
      },
      studyRecommendations,
      improvementSuggestions,
      analyzedAt: new Date()
    };
  }

  /**
   * Recommends matching career paths based on profile analysis
   */
  public static async getCareerRecommendations(user: IUser, aiProfile: IAIProfile): Promise<ICareerRecommendation[]> {
    console.log(`🤖 [AI SERVICE] Generating career recommendations for student: ${user.name}`);
    const o = user.onboarding;
    const target = (o.careerGoals?.preferredCareer || '').toLowerCase();
    
    // Configurable average salary ranges depending on parameters
    const salaries = {
      frontend: { min: 70000, max: 130000, currency: 'USD' },
      backend: { min: 80000, max: 145000, currency: 'USD' },
      ai: { min: 105000, max: 190000, currency: 'USD' },
      devops: { min: 90000, max: 155000, currency: 'USD' },
      cyber: { min: 85000, max: 145000, currency: 'USD' },
      uiux: { min: 65000, max: 115000, currency: 'USD' }
    };

    const recs: ICareerRecommendation[] = [];

    // Recommendation 1: Match directly with Preferred Career target
    if (target.includes('front') || target.includes('react') || target.includes('web')) {
      recs.push({
        pathId: 'frontend',
        careerName: 'Frontend Developer',
        matchPercentage: Math.min(aiProfile.scores.programming + 5, 96),
        whyMatches: `Your stack matches React/JS preferences. You enjoy styling and display layouts, fitting web development perfectly.`,
        requiredSkills: ['HTML5/CSS3', 'JavaScript', 'TypeScript', 'React 19', 'Tailwind CSS', 'Vite', 'State Management (Redux/Zustand)', 'Rest APIs'],
        currentSkillGap: ['TypeScript', 'State Management (Redux/Zustand)', 'Performance Optimization'],
        estimatedLearningTime: this.calcLearningTime(o.preferences?.dailyStudyTime || 2, 4),
        averageIndustryDemand: 'High',
        suggestedStartingPoint: 'Build interactive static pages with JS, then learn components lifecycle in React.',
        expectedSalaryRange: salaries.frontend,
        futureGrowth: 'High',
        difficultyLevel: 'Beginner'
      });
    }

    if (target.includes('back') || target.includes('node') || target.includes('database') || recs.length === 0) {
      recs.push({
        pathId: 'backend',
        careerName: 'Backend Developer',
        matchPercentage: Math.min(aiProfile.scores.problemSolving + 8, 95),
        whyMatches: `You exhibit strong logical reasoning and interest in core subjects like DBMS. Backend tracks emphasize data structure flows and API setups.`,
        requiredSkills: ['Node.js/Express', 'Python', 'Databases (MongoDB/PostgreSQL)', 'SQL', 'REST/GraphQL APIs', 'Docker', 'System Design'],
        currentSkillGap: ['Docker', 'NoSQL Datastores', 'Express routing design patterns'],
        estimatedLearningTime: this.calcLearningTime(o.preferences?.dailyStudyTime || 2, 5),
        averageIndustryDemand: 'High',
        suggestedStartingPoint: 'Build basic HTTP servers in Node/Python, connect Mongoose models, and write CRUD APIs.',
        expectedSalaryRange: salaries.backend,
        futureGrowth: 'High',
        difficultyLevel: 'Intermediate'
      });
    }

    if (target.includes('ai') || target.includes('machine') || target.includes('ml') || target.includes('data') || recs.length < 2) {
      recs.push({
        pathId: 'ai',
        careerName: 'AI & ML Engineer',
        matchPercentage: Math.min(aiProfile.scores.mathematics + 5, 92),
        whyMatches: `Aligned with interests in intelligence, Python libraries, and analytical algorithms. Suitable for implementing neural weights and models training.`,
        requiredSkills: ['Python', 'Linear Algebra & Calculus', 'Pandas & NumPy', 'Scikit-Learn', 'Deep Learning (PyTorch/TensorFlow)', 'LLM integration (LangChain)'],
        currentSkillGap: ['Scikit-Learn models evaluation', 'Vector databases', 'PyTorch network modeling'],
        estimatedLearningTime: this.calcLearningTime(o.preferences?.dailyStudyTime || 2, 8),
        averageIndustryDemand: 'High',
        suggestedStartingPoint: 'Master data analysis libraries in Jupyter notebooks, learn model metrics, and build simple regression targets.',
        expectedSalaryRange: salaries.ai,
        futureGrowth: 'Exponential',
        difficultyLevel: 'Advanced'
      });
    }

    // Backup tracks to fill up to 3 recommendations
    if (recs.length < 3) {
      recs.push({
        pathId: 'devops',
        careerName: 'DevOps & Cloud Engineer',
        matchPercentage: Math.min(aiProfile.scores.consistency - 5, 80),
        whyMatches: `Your background in Core Operating Systems fits automation tasks. Essential for scaling microservices.`,
        requiredSkills: ['Linux CLI', 'Docker', 'Kubernetes', 'CI/CD Pipelines (GitHub Actions)', 'AWS/GCP Cloud', 'IaC (Terraform)'],
        currentSkillGap: ['Kubernetes Orchestration', 'Terraform scripting', 'Linux admin configs'],
        estimatedLearningTime: this.calcLearningTime(o.preferences?.dailyStudyTime || 2, 6),
        averageIndustryDemand: 'High',
        suggestedStartingPoint: 'Master terminal commands, containerize a simple Node backend using Docker, and host on AWS Free Tier.',
        expectedSalaryRange: salaries.devops,
        futureGrowth: 'Stable',
        difficultyLevel: 'Advanced'
      });
    }

    return recs.slice(0, 3);
  }

  /**
   * Generates step-by-step personalized learning roadmaps with adaptive skips/inserts logic
   */
  public static async generateRoadmap(user: IUser, targetCareer: string): Promise<IRoadmapModule[]> {
    console.log(`🤖 [AI SERVICE] Generating adaptive roadmap modules for: ${targetCareer}`);
    const o = user.onboarding;
    const path = targetCareer.toLowerCase();

    // Check user profiles for skills (Part 2)
    const languages = (o.skills?.languages || []).map(l => l.toLowerCase());
    const otherSkills = (o.skills?.otherSkills || []).map(s => s.toLowerCase());
    
    const knowsReact = otherSkills.some(s => s.includes('react') || s.includes('next'));
    const knowsJS = languages.some(l => l.includes('javascript') || l.includes('typescript') || l.includes('js') || l.includes('ts'));
    const knowsPython = languages.some(l => l.includes('python') || l.includes('py'));
    const knowsNode = otherSkills.some(s => s.includes('node') || s.includes('express') || s.includes('nest'));

    // Check weaknesses
    const weaknesses = (o.careerGoals?.weaknesses || []).map(w => w.toLowerCase());
    const weakJS = weaknesses.some(w => w.includes('javascript') || w.includes('js') || w.includes('programming') || w.includes('logic')) || !knowsJS;
    const weakPython = weaknesses.some(w => w.includes('python') || w.includes('py') || w.includes('programming')) || !knowsPython;

    // Custom learning duration strings based on daily target
    const dailyStudyTime = o.preferences?.dailyStudyTime || 2;
    const duration1 = this.calcLearningTime(dailyStudyTime, 2);
    const duration2 = this.calcLearningTime(dailyStudyTime, 3);
    const duration3 = this.calcLearningTime(dailyStudyTime, 4);

    const generatedModules: IRoadmapModule[] = [];

    // --- FRONTEND TRACK ---
    if (path.includes('front') || path.includes('web')) {
      let orderIndex = 1;

      // INSERT (Weak Javascript)
      if (weakJS) {
        const jsResources = await this.getResourcesForCategory('JavaScript', ['javascript', 'js', 'es6', 'async']);
        generatedModules.push({
          id: 'mod-js-foundation',
          title: '🔧 JavaScript Core Fundamentals (Inserted)',
          description: 'Prerequisite Module: Inserted due to weak programming confidence or missing JS in languages. Cover variables, DOM scopes, and async promises.',
          order: orderIndex++,
          status: 'unlocked',
          estimatedCompletionTime: duration1,
          difficulty: 'Beginner',
          prerequisites: [],
          learningOutcome: 'Ability to write functional ES6 scripts, handle events, and fetch asynchronous APIs.',
          completionPercentage: 0,
          unlockCondition: 'Immediate registration access',
          notes: 'Mastering async/await variables is key to avoiding state updates loop bugs in React hooks.',
          aiTips: '🤖 Focus heavily on learning how the event loop queues macro and micro tasks.',
          miniProjects: [
            { title: 'Interactive Tip Calculator', description: 'Write script lines that dynamically compute invoice splits and update DOM styles.' }
          ],
          majorProject: {
            title: 'Dynamic Git Repos Tracker Dashboard',
            description: 'Write an asynchronous dashboard that queries GitHub APIs for public profiles and lists matching repositories.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'What is the correct way to declare an asynchronous function in ES6?', options: ['async function foo() {}', 'function async foo() {}', 'let foo = async() => {}', 'Both A and C'], answerIndex: 3 },
              { question: 'Which keyword defines block-scoped variables in modern JavaScript?', options: ['var', 'let', 'const', 'Both B and C'], answerIndex: 3 }
            ]
          },
          topics: [
            {
              title: 'Variables, Closures & Async Promises',
              lessons: [
                { title: 'Variables scopes (let, const)', duration: '20m', isCompleted: false },
                { title: 'Closures and scope chains', duration: '30m', isCompleted: false },
                { title: 'Promises and Async/Await', duration: '40m', isCompleted: false }
              ],
              resources: jsResources
            }
          ]
        });
      }

      // SKIP Basics if they know both React and JS
      if (knowsReact && knowsJS) {
        // Skip "Foundations of Web Design" & "JavaScript Basics" and start directly from advanced react
        const nextResources = await this.getResourcesForCategory('React & Next.js', ['react', 'next', 'nextjs']);
        const systemResources = await this.getResourcesForCategory('Cloud & Docker', ['docker', 'kubernetes', 'system']);

        generatedModules.push({
          id: 'mod-adv-react',
          title: '🚀 Advanced React & Next.js Server Components (Start Point)',
          description: 'Adaptive Start Point: Skipped basics since you already know React/JS. Learn Next server rendering cycles and performance optimizations.',
          order: orderIndex++,
          status: 'unlocked',
          estimatedCompletionTime: duration2,
          difficulty: 'Intermediate',
          prerequisites: [],
          learningOutcome: 'Understand React rendering optimizations and Next.js server components architecture.',
          completionPercentage: 0,
          unlockCondition: 'Profile evaluation match',
          notes: 'Next server components process data fetching on the server, reducing bundle sizes.',
          aiTips: '🤖 Minimize client-side hooks inside server components to speed up site loading.',
          miniProjects: [
            { title: 'Server Rendered blog feed', description: 'Build a server-side route that caches database entries and displays a fast blog layout.' }
          ],
          majorProject: {
            title: 'Dynamic NextJS E-Commerce Portal',
            description: 'Implement server loading routes, custom middleware cart caches, and dynamic search filter listings.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which component type fetches data on the server by default in Next.js App Router?', options: ['Client Component', 'Server Component', 'Static Component', 'Dynamic Component'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'NextJS Server Side rendering',
              lessons: [
                { title: 'Server vs Client components', duration: '30m', isCompleted: false },
                { title: 'Next.js layouts and routing patterns', duration: '40m', isCompleted: false }
              ],
              resources: nextResources
            }
          ]
        });

        generatedModules.push({
          id: 'mod-global-state',
          title: '🔄 State Orchestrator & Production Deployment',
          description: 'Deep dive into global stores using Zustand and containerizing apps for cloud launch.',
          order: orderIndex++,
          status: 'locked',
          estimatedCompletionTime: duration3,
          difficulty: 'Advanced',
          prerequisites: ['mod-adv-react'],
          learningOutcome: 'Deploy secure production applications inside Docker containers linked with CI pipelines.',
          completionPercentage: 0,
          unlockCondition: 'Complete Advanced React modules',
          notes: 'Zustand provides a lightweight hook-based state management that works outside React renders.',
          aiTips: '🤖 Dockerize frontend bundles to guarantee uniform environments from local staging to AWS hosting.',
          miniProjects: [
            { title: 'Zustand Task Manager Board', description: 'Create a Kanban Board syncing state across columns.' }
          ],
          majorProject: {
            title: 'Cloud Scaled Frontend Portal',
            description: 'Dockerize a React static output, link with Github actions build scripts, and host on AWS.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'What does Zustand use to handle global state updates?', options: ['Context Provider', 'Redux actions', 'Hook selectors', 'DOM bindings'], answerIndex: 2 }
            ]
          },
          topics: [
            {
              title: 'Zustand & Docker Container configs',
              lessons: [
                { title: 'Zustand store integrations', duration: '30m', isCompleted: false },
                { title: 'Writing Dockerfiles for static builds', duration: '35m', isCompleted: false }
              ],
              resources: systemResources
            }
          ]
        });
      } else {
        // Standard Frontend track
        const htmlResources = await this.getResourcesForCategory('HTML & CSS', ['html', 'css', 'grid']);
        const jsResources = await this.getResourcesForCategory('JavaScript', ['javascript', 'js', 'dom']);
        const reactResources = await this.getResourcesForCategory('React & Next.js', ['react', 'zustand']);

        generatedModules.push({
          id: 'mod-web-foundations',
          title: '🎨 Foundations of Web Design',
          description: 'Standard Module: Master semantic structures, responsive CSS grid grids, and layout rules.',
          order: orderIndex++,
          status: 'unlocked',
          estimatedCompletionTime: duration1,
          difficulty: 'Beginner',
          prerequisites: [],
          learningOutcome: 'Write semantic layouts styled with modern CSS variables.',
          completionPercentage: 0,
          unlockCondition: 'Onboarding complete',
          notes: 'Avoid absolute pixel heights to keep grids responsive on mobile devices.',
          aiTips: '🤖 Use CSS Flexbox for simple lists rows and CSS Grid for complex grid frameworks.',
          miniProjects: [
            { title: 'Flexbox Navigation Panel', description: 'Assemble a responsive header bar adjusting items to screen boundaries.' }
          ],
          majorProject: {
            title: 'SaaS Product Home Landing Page',
            description: 'Assemble a dark-themed product webpage showing statistics grids and accordion panels.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which CSS property defines flex row wraps?', options: ['flex-direction', 'flex-wrap', 'align-items', 'justify-content'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'HTML & CSS responsive frameworks',
              lessons: [
                { title: 'CSS Grid layouts selectors', duration: '30m', isCompleted: false },
                { title: 'CSS Flexbox spacing models', duration: '25m', isCompleted: false }
              ],
              resources: htmlResources
            }
          ]
        });

        generatedModules.push({
          id: 'mod-js-basics',
          title: '⚡ JavaScript & DOM Lifecycles',
          description: 'Explore asynchronous callback execution, event mapping, and JSON parsing.',
          order: orderIndex++,
          status: 'locked',
          estimatedCompletionTime: duration2,
          difficulty: 'Intermediate',
          prerequisites: ['mod-web-foundations'],
          learningOutcome: 'Handle user inputs, query asynchronous endpoints, and write responsive DOM scripts.',
          completionPercentage: 0,
          unlockCondition: 'Complete Foundations of Web Design',
          notes: 'Always validate JSON parsed data inside try/catch wrappers to handle network errors.',
          aiTips: '🤖 Using fetch triggers promises; use async/await tags to keep scripts readable.',
          miniProjects: [
            { title: 'Weather Forecast widget API', description: 'Fetch weather data from mock APIs and render cards.' }
          ],
          majorProject: {
            title: 'Personal Task Kanban App',
            description: 'Create a local task app supporting drag/drop tasks using DOM events.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'What state is a promise in after resolving successfully?', options: ['pending', 'fulfilled', 'rejected', 'settled'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'DOM nodes & Asynchronous fetch APIs',
              lessons: [
                { title: 'Promises syntax parameters', duration: '30m', isCompleted: false },
                { title: 'Asynchronous event listeners', duration: '40m', isCompleted: false }
              ],
              resources: jsResources
            }
          ]
        });

        generatedModules.push({
          id: 'mod-react-basics',
          title: '⚛️ Modern Component Architectures (React)',
          description: 'Learn React functional component layouts, state hook coordinates, and Zustand.',
          order: orderIndex++,
          status: 'locked',
          estimatedCompletionTime: duration3,
          difficulty: 'Advanced',
          prerequisites: ['mod-js-basics'],
          learningOutcome: 'Build complex client interfaces backed by global Zustand states.',
          completionPercentage: 0,
          unlockCondition: 'Complete JS basics',
          notes: 'Minimize inline hook declarations. Separate states from layout display renders.',
          aiTips: '🤖 Use custom hooks to isolate API data fetch codes from your render blocks.',
          miniProjects: [
            { title: 'Interactive Counter list', description: 'Define react states mapping list increments.' }
          ],
          majorProject: {
            title: 'SaaS Client Billing Dashboard',
            description: 'Construct a dashboard displaying billing metrics charts and state locks.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which React hook handles side effects like data fetching?', options: ['useState', 'useEffect', 'useContext', 'useMemo'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'React functional lifecycle & States',
              lessons: [
                { title: 'React state hook updates (useState)', duration: '40m', isCompleted: false },
                { title: 'Global Zustand stores setups', duration: '35m', isCompleted: false }
              ],
              resources: reactResources
            }
          ]
        });
      }
    }
    // --- AI / MACHINE LEARNING TRACK ---
    else if (path.includes('ai') || path.includes('machine') || path.includes('ml')) {
      let orderIndex = 1;

      // INSERT (Weak Python/Programming)
      if (weakPython) {
        const pythonResources = await this.getResourcesForCategory('Python & Math', ['python', 'programming', 'basics']);
        generatedModules.push({
          id: 'mod-py-foundation',
          title: '🐍 Python core Programming (Inserted)',
          description: 'Prerequisite Module: Inserted due to weak programming confidence. Study Python objects, list comprehensions, and basic data loops.',
          order: orderIndex++,
          status: 'unlocked',
          estimatedCompletionTime: duration1,
          difficulty: 'Beginner',
          prerequisites: [],
          learningOutcome: 'Write clear Python scripts, process data loops, and structure objects.',
          completionPercentage: 0,
          unlockCondition: 'Immediate registration access',
          notes: 'Python is the core language for ML engineering. Prioritize script syntax.',
          aiTips: '🤖 Learn list comprehensions to make data filtering fast.',
          miniProjects: [
            { title: 'Academic Grade Aggregator', description: 'Write scripts to average marks dictionaries.' }
          ],
          majorProject: {
            title: 'Local Log File Parser Utility',
            description: 'Write a Python utility to parse system server logs, sorting lines by error category.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which keyword defines function scopes in Python?', options: ['function', 'def', 'let', 'void'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'Python structures & Loops logic',
              lessons: [
                { title: 'Variables and standard operators', duration: '25m', isCompleted: false },
                { title: 'List and dictionary comprehensions', duration: '30m', isCompleted: false }
              ],
              resources: pythonResources
            }
          ]
        });
      }

      // SKIP Python basics if they know Python
      if (knowsPython && !weakPython) {
        const mlResources = await this.getResourcesForCategory('Machine Learning', ['python', 'ml', 'pandas']);
        const deepResources = await this.getResourcesForCategory('Python & Math', ['pytorch', 'neural', 'deep']);

        generatedModules.push({
          id: 'mod-ml-models',
          title: '🤖 Supervised Machine Learning Models (Start Point)',
          description: 'Adaptive Start Point: Skipped Python basics since you already know it. Build regression algorithms and validate models.',
          order: orderIndex++,
          status: 'unlocked',
          estimatedCompletionTime: duration2,
          difficulty: 'Intermediate',
          prerequisites: [],
          learningOutcome: 'Train classifiers using Scikit-Learn libraries and validate accuracy.',
          completionPercentage: 0,
          unlockCondition: 'Profile matching prediction',
          notes: 'Always split datasets into train and test sets to detect overfitting.',
          aiTips: '🤖 Use Random Forests as a benchmark model for tabular classification problems.',
          miniProjects: [
            { title: 'Housing Prices Classifier', description: 'Train a regression model predicting home costs.' }
          ],
          majorProject: {
            title: 'Student Placement Prediction Engine',
            description: 'Evaluate university onboarding logs using Scikit-Learn classifiers and output placement probabilities.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'What metric divides true positives by all predicted positives?', options: ['Recall', 'Accuracy', 'Precision', 'F1-Score'], answerIndex: 2 }
            ]
          },
          topics: [
            {
              title: 'Scikit-Learn Classifiers training',
              lessons: [
                { title: 'Splitting datasets parameters', duration: '30m', isCompleted: false },
                { title: 'Precision, Recall metrics evaluations', duration: '35m', isCompleted: false }
              ],
              resources: mlResources
            }
          ]
        });

        generatedModules.push({
          id: 'mod-deep-neural',
          title: '🧠 Deep Learning & LLM prompt pipelines',
          description: 'Configure neural layers in PyTorch, compile backpropagation loops, and query customized LLMs.',
          order: orderIndex++,
          status: 'locked',
          estimatedCompletionTime: duration3,
          difficulty: 'Advanced',
          prerequisites: ['mod-ml-models'],
          learningOutcome: 'Write neural modeling networks in PyTorch and connect LLM pipelines.',
          completionPercentage: 0,
          unlockCondition: 'Complete ML models',
          notes: 'Neural weights adjust via gradients during model training loops.',
          aiTips: '🤖 Vector databases cache prompt indices to speed up RAG setups.',
          miniProjects: [
            { title: 'PyTorch Image Classifier', description: 'Build simple networks sorting handwritten digit shapes.' }
          ],
          majorProject: {
            title: 'AI Syllabus Recommendation Agent',
            description: 'Configure an LLM query agent that parses custom student inputs to write custom learning paths.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which PyTorch class handles gradient tracking?', options: ['Tensor', 'Module', 'Optimizer', 'DataLoader'], answerIndex: 0 }
            ]
          },
          topics: [
            {
              title: 'PyTorch Neural Networks & RAG',
              lessons: [
                { title: 'Neural backpropagation logic', duration: '45m', isCompleted: false },
                { title: 'Connecting vector databases in LangChain', duration: '50m', isCompleted: false }
              ],
              resources: deepResources
            }
          ]
        });
      } else {
        // Standard AI/ML Track
        const pythonResources = await this.getResourcesForCategory('Python & Math', ['python', 'pandas']);
        const mlResources = await this.getResourcesForCategory('Machine Learning', ['ml', 'sklearn']);

        generatedModules.push({
          id: 'mod-py-data',
          title: '📊 Python for Data pipelines',
          description: 'Standard Module: Master NumPy vector coordinates, Pandas dataframe operations, and data plots.',
          order: orderIndex++,
          status: 'unlocked',
          estimatedCompletionTime: duration1,
          difficulty: 'Beginner',
          prerequisites: [],
          learningOutcome: 'Import CSV records, clean data tables, and plot statistic figures.',
          completionPercentage: 0,
          unlockCondition: 'Onboarding complete',
          notes: 'Pandas indexes allow fast row searches and joins.',
          aiTips: '🤖 Avoid explicit loops when using Pandas. Vectorized operations are much faster.',
          miniProjects: [
            { title: 'CSV Data Cleaner script', description: 'Filter blank entries in data columns.' }
          ],
          majorProject: {
            title: 'University GPA Analytics parser',
            description: 'Calculate average scores across branch catalogs and plot correlation parameters.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which library handles fast matrix operations in Python?', options: ['Pandas', 'NumPy', 'Matplotlib', 'Scikit-Learn'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'Pandas Dataframes & NumPy arrays',
              lessons: [
                { title: 'Pandas column operations', duration: '35m', isCompleted: false },
                { title: 'Data plot figures using Matplotlib', duration: '30m', isCompleted: false }
              ],
              resources: pythonResources
            }
          ]
        });

        generatedModules.push({
          id: 'mod-ml-basics',
          title: '🤖 Supervised Machine Learning Models',
          description: 'Train classification models, compute regressions, and optimize model hyper-parameters.',
          order: orderIndex++,
          status: 'locked',
          estimatedCompletionTime: duration2,
          difficulty: 'Intermediate',
          prerequisites: ['mod-py-data'],
          learningOutcome: 'Configure and evaluate Scikit-Learn predictors.',
          completionPercentage: 0,
          unlockCondition: 'Complete Python for Data pipelines',
          notes: 'Model validation prevents false positive metrics.',
          aiTips: '🤖 Grid search optimizes parameter selection without manual trial errors.',
          miniProjects: [
            { title: 'Housing Prices Classifier', description: 'Train a basic regression algorithm.' }
          ],
          majorProject: {
            title: 'Student Placement Predictor Model',
            description: 'Evaluate student onboarding records using random forest predictors.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which Scikit-Learn class trains random forest classifiers?', options: ['DecisionTreeClassifier', 'RandomForestClassifier', 'LinearRegression', 'KMeans'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'Scikit-Learn classification algorithms',
              lessons: [
                { title: 'Training supervised algorithms', duration: '40m', isCompleted: false },
                { title: 'Model validation logs', duration: '30m', isCompleted: false }
              ],
              resources: mlResources
            }
          ]
        });
      }
    }
    // --- BACKEND DEVELOPER TRACK ---
    else {
      let orderIndex = 1;

      // INSERT (Weak Programming)
      if (weakJS) {
        const jsResources = await this.getResourcesForCategory('JavaScript', ['javascript', 'js', 'basics']);
        generatedModules.push({
          id: 'mod-backend-js',
          title: '🔧 JavaScript Core Fundamentals (Inserted)',
          description: 'Prerequisite Module: Inserted due to weak programming confidence. Master language structures and asynchronous parameters.',
          order: orderIndex++,
          status: 'unlocked',
          estimatedCompletionTime: duration1,
          difficulty: 'Beginner',
          prerequisites: [],
          learningOutcome: 'Write clean asynchronous operations and logic callbacks.',
          completionPercentage: 0,
          unlockCondition: 'Immediate registration access',
          notes: 'Backend servers require robust async handling to process simultaneous requests.',
          aiTips: '🤖 Practice try/catch error handling in promises.',
          miniProjects: [
            { title: 'Console Task Aggregator', description: 'Write basic loops logging study tasks.' }
          ],
          majorProject: {
            title: 'Asynchronous JSON File Saver Utility',
            description: 'Write utilities to read local database-like JSON files, updating indexes asynchronously.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'What does a JavaScript Promise return when it fails?', options: ['Resolve', 'Reject', 'Pending', 'Settled'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'Async promises & Callback scopes',
              lessons: [
                { title: 'Event loops processing principles', duration: '30m', isCompleted: false },
                { title: 'Callbacks structures parameters', duration: '25m', isCompleted: false }
              ],
              resources: jsResources
            }
          ]
        });
      }

      // SKIP Basics if they know Node
      if (knowsNode && knowsJS) {
        const dbResources = await this.getResourcesForCategory('Node.js & Express', ['mongodb', 'databases', 'sql']);
        const systemResources = await this.getResourcesForCategory('Cloud & Docker', ['docker', 'deployment', 'aws']);

        generatedModules.push({
          id: 'mod-databases',
          title: '🗄️ Database Schemas & Aggregations (Start Point)',
          description: 'Adaptive Start Point: Skipped basic server setups since you already know Node. Build relationships and map aggregations.',
          order: orderIndex++,
          status: 'unlocked',
          estimatedCompletionTime: duration2,
          difficulty: 'Intermediate',
          prerequisites: [],
          learningOutcome: 'Map advanced database models and compile aggregated records.',
          completionPercentage: 0,
          unlockCondition: 'Profile matching prediction',
          notes: 'Aggregation pipelines filter entries efficiently at the database level.',
          aiTips: '🤖 Use database index keys on frequently queried fields to speed up lookups.',
          miniProjects: [
            { title: 'MongoDB Aggregate Pipeline', description: 'Average student marks using aggregation pipelines.' }
          ],
          majorProject: {
            title: 'Multi-Step Onboarding Persistence DB Cache',
            description: 'Configure Mongoose subdocuments saving wizard progress step-by-step.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which index type prevents duplicate field values in MongoDB?', options: ['Index', 'Unique Index', 'Sparse Index', 'Compound Index'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'Mongoose schema layouts & DB aggregates',
              lessons: [
                { title: 'Subdocuments mapping parameters', duration: '40m', isCompleted: false },
                { title: 'Aggregation pipeline stages', duration: '45m', isCompleted: false }
              ],
              resources: dbResources
            }
          ]
        });

        generatedModules.push({
          id: 'mod-deployments',
          title: '🐳 Docker Deployments & CI/CD Pipelines',
          description: 'Dockerize database networks and configure testing pipelines.',
          order: orderIndex++,
          status: 'locked',
          estimatedCompletionTime: duration3,
          difficulty: 'Advanced',
          prerequisites: ['mod-databases'],
          learningOutcome: 'Dockerize applications and deploy them to cloud platforms.',
          completionPercentage: 0,
          unlockCondition: 'Complete DB aggregation modules',
          notes: 'Containers bundle configurations, eliminating server differences.',
          aiTips: '🤖 Set up testing triggers in your actions to catch bugs before hosting updates.',
          miniProjects: [
            { title: 'Express Dockerfile setup', description: 'Write container files running APIs.' }
          ],
          majorProject: {
            title: 'Containerized CI/CD Service Launch',
            description: 'Bundle your API and database using Docker Compose and automate unit tests via Github Actions.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which Docker Compose property links container networks?', options: ['ports', 'depends_on', 'environment', 'volumes'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'Docker containers & GitHub actions setups',
              lessons: [
                { title: 'Writing Docker Compose definitions', duration: '40m', isCompleted: false },
                { title: 'GitHub Actions workflow configurations', duration: '35m', isCompleted: false }
              ],
              resources: systemResources
            }
          ]
        });
      } else {
        // Standard Backend Track
        const nodeResources = await this.getResourcesForCategory('Node.js & Express', ['node', 'express', 'rest']);
        const dbResources = await this.getResourcesForCategory('Node.js & Express', ['mongodb', 'database', 'mongoose']);

        generatedModules.push({
          id: 'mod-express-servers',
          title: '🚀 API Server Architectures (Express)',
          description: 'Standard Module: Build backend routers, validate payloads with Zod, and structure CORS headers.',
          order: orderIndex++,
          status: 'unlocked',
          estimatedCompletionTime: duration1,
          difficulty: 'Beginner',
          prerequisites: [],
          learningOutcome: 'Write secure REST APIs with Express and Zod validation.',
          completionPercentage: 0,
          unlockCondition: 'Onboarding complete',
          notes: 'Always place error handling middlewares after route declarations.',
          aiTips: '🤖 Use Zod schemas to validate request payloads before processing database queries.',
          miniProjects: [
            { title: 'User Signup API router', description: 'Write post routes verifying email formats.' }
          ],
          majorProject: {
            title: 'Academic Grade Server REST API',
            description: 'Write an Express server that validates credentials and performs CRUD operations on student records.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which HTTP method is best suited to create a new resource?', options: ['GET', 'POST', 'PUT', 'DELETE'], answerIndex: 1 }
            ]
          },
          topics: [
            {
              title: 'Express server routing & Validations',
              lessons: [
                { title: 'Express middleware functions', duration: '30m', isCompleted: false },
                { title: 'Payload validations with Zod', duration: '35m', isCompleted: false }
              ],
              resources: nodeResources
            }
          ]
        });

        generatedModules.push({
          id: 'mod-mongoose-db',
          title: '🗄️ Mongoose Schemas & DB Indexes',
          description: 'Establish relationships, compile pipelines, and run transactions.',
          order: orderIndex++,
          status: 'locked',
          estimatedCompletionTime: duration2,
          difficulty: 'Intermediate',
          prerequisites: ['mod-express-servers'],
          learningOutcome: 'Connect backend routers to Mongoose database layers.',
          completionPercentage: 0,
          unlockCondition: 'Complete Express servers',
          notes: 'Indexes speed up lookups but slow down writes. Index selective query fields.',
          aiTips: '🤖 Use Mongoose pre-save hooks to hash user passwords automatically.',
          miniProjects: [
            { title: 'User DB Schema index', description: 'Add unique flags to user email schemas.' }
          ],
          majorProject: {
            title: 'Task Persistence Backend Layer',
            description: 'Connect your Express routers to a MongoDB layer using Mongoose models.'
          },
          checkpointQuiz: {
            questions: [
              { question: 'Which mongoose function defines pre-save actions?', options: ['schema.pre()', 'schema.post()', 'schema.index()', 'schema.plugin()'], answerIndex: 0 }
            ]
          },
          topics: [
            {
              title: 'Mongoose models & Schema relationships',
              lessons: [
                { title: 'Designing schema models', duration: '40m', isCompleted: false },
                { title: 'Compiling aggregate queries', duration: '45m', isCompleted: false }
              ],
              resources: dbResources
            }
          ]
        });
      }
    }

    return generatedModules;
  }

  /**
   * Helper to query MongoDB and compile 10 resource categories for a topic
   */
  private static getDefaultResources(categoryName: string, tags: string[]): any[] {
    const types: Array<'documentation' | 'playlist' | 'course' | 'practice' | 'project' | 'challenge' | 'quiz' | 'book' | 'cheat-sheet' | 'interview-notes'> = [
      'documentation', 'playlist', 'course', 'practice', 'project', 'challenge', 'quiz', 'book', 'cheat-sheet', 'interview-notes'
    ];

    return types.map(type => ({
      title: `AI Curated ${type.replace('-', ' ')} for ${categoryName}`,
      description: `A highly recommended ${type.replace('-', ' ')} resource to master ${tags.join(', ')} topics.`,
      difficulty: 'Intermediate',
      estimatedTime: 45,
      externalUrl: this.getMockUrl(type, tags[0] || 'general'),
      category: categoryName,
      resourceType: type,
      tags: tags
    }));
  }

  private static async getResourcesForCategory(categoryName: string, tags: string[]): Promise<any[]> {
    try {
      if (mongoose.connection.readyState !== 1) {
        return this.getDefaultResources(categoryName, tags);
      }

      const dbRes = await LearningResource.find({
        $or: [
          { category: categoryName },
          { tags: { $in: tags } }
        ]
      }).lean();

      const types: Array<'documentation' | 'playlist' | 'course' | 'practice' | 'project' | 'challenge' | 'quiz' | 'book' | 'cheat-sheet' | 'interview-notes'> = [
        'documentation', 'playlist', 'course', 'practice', 'project', 'challenge', 'quiz', 'book', 'cheat-sheet', 'interview-notes'
      ];

      const finalResources: any[] = [];

      for (const type of types) {
        const match = dbRes.find(r => r.resourceType === type);
        if (match) {
          finalResources.push({
            title: match.title,
            description: match.description,
            difficulty: match.difficulty,
            estimatedTime: match.estimatedTime,
            externalUrl: match.externalUrl,
            category: match.category,
            resourceType: match.resourceType,
            tags: match.tags
          });
        } else {
          finalResources.push({
            title: `AI Curated ${type.replace('-', ' ')} for ${categoryName}`,
            description: `A highly recommended ${type.replace('-', ' ')} resource to master ${tags.join(', ')} topics.`,
            difficulty: 'Intermediate',
            estimatedTime: 45,
            externalUrl: this.getMockUrl(type, tags[0] || 'general'),
            category: categoryName,
            resourceType: type,
            tags: tags
          });
        }
      }

      return finalResources;
    } catch (err) {
      return [];
    }
  }

  /**
   * Phase E: Explain & Teach topic tailored to student profile and module context
   */
  public static async explainAndTeachTopic(user: IUser, topicTitle: string, moduleTitle: string): Promise<IAIExplainTeach> {
    console.log(`🤖 [AI SERVICE] Generating Explain & Teach for topic: ${topicTitle}`);
    
    if (GeminiService.isLLMConnected()) {
      const prompt = `
        Student Name: ${user.name}
        Academic: ${user.onboarding?.academic?.degree || 'College'} student in ${user.onboarding?.academic?.branch || 'CS'}
        Learning Style: ${user.onboarding?.preferences?.learningStyle || 'visual'}
        Current Module: ${moduleTitle}
        Target Topic: ${topicTitle}

        Provide a structured tutorial JSON matching keys: conceptName, simpleExplanation, realWorldAnalogy, codeExample, whyItMatters, keyTakeaways.
      `;
      const llmResult = await GeminiService.generateJSON<IAIExplainTeach>(prompt, 'You are an elite computer science mentor teaching college students.');
      if (llmResult && llmResult.simpleExplanation) {
        return llmResult;
      }
    }

    // Fallback response engine
    return {
      conceptName: topicTitle,
      simpleExplanation: `${topicTitle} is a foundational building block in modern computing. It allows developers to solve complex problems by breaking them down into manageable, reusable logic units.`,
      realWorldAnalogy: `Think of ${topicTitle} like a assembly pipeline in a factory: raw inputs flow into specialized stations (functions/methods), process step-by-step, and output a finished product.`,
      codeExample: topicTitle.toLowerCase().includes('async') || topicTitle.toLowerCase().includes('promise')
        ? `// Async execution example\nasync function fetchLearnerData(id) {\n  try {\n    const res = await fetch(\`/api/student/\${id}\`);\n    return await res.json();\n  } catch (err) {\n    console.error('Fetch error:', err);\n  }\n}`
        : topicTitle.toLowerCase().includes('react') || topicTitle.toLowerCase().includes('state')
        ? `// React Component State\nimport { useState } from 'react';\n\nexport function TopicCard({ name }) {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>Learned {name}: {count}</button>;\n}`
        : `// Core Algorithm Pattern\nfunction processTopicData(items) {\n  return items.filter(item => item.isValid).map(item => item.value * 2);\n}`,
      whyItMatters: `Mastering ${topicTitle} is essential for writing production-ready code, passing technical interviews, and building scalable systems.`,
      keyTakeaways: [
        `Understand the core syntax and edge cases of ${topicTitle}.`,
        `Practice writing clean, self-documenting code functions.`,
        `Recognize performance implications in real-world applications.`
      ]
    };
  }

  /**
   * Phase E: Generate MCQs, Concept questions, and Coding exercises for practice
   */
  public static async generatePracticeQuestions(user: IUser, topicTitle: string): Promise<IAIPracticeQuestions> {
    console.log(`🤖 [AI SERVICE] Generating Practice Questions for: ${topicTitle}`);

    if (GeminiService.isLLMConnected()) {
      const prompt = `
        Target Topic: ${topicTitle}
        Student Degree: ${user.onboarding?.academic?.degree || 'College'}

        Generate JSON matching keys: mcqs (array of {question, options, answerIndex, explanation}), conceptQuestions (array of {question, sampleAnswer}), codingQuestions (array of {prompt, starterCode, solution}).
      `;
      const llmResult = await GeminiService.generateJSON<IAIPracticeQuestions>(prompt, 'You are an expert technical interviewer and educator.');
      if (llmResult && llmResult.mcqs && llmResult.mcqs.length > 0) {
        return llmResult;
      }
    }

    // Fallback Practice Engine
    return {
      mcqs: [
        {
          question: `What is the primary purpose of ${topicTitle}?`,
          options: [
            `To organize code and manage execution flow efficiently`,
            `To slow down database queries`,
            `To replace HTML styling rules`,
            `None of the above`
          ],
          answerIndex: 0,
          explanation: `${topicTitle} provides structured paradigms to streamline logic execution and state management.`
        },
        {
          question: `Which of the following is a common best practice when implementing ${topicTitle}?`,
          options: [
            `Ignoring error exceptions and null bounds`,
            `Handling asynchronous bounds and validating inputs`,
            `Hardcoding static magic numbers everywhere`,
            `Disabling type checks`
          ],
          answerIndex: 1,
          explanation: `Always validate inputs and handle edge exceptions to prevent application crashes.`
        }
      ],
      conceptQuestions: [
        {
          question: `Explain how ${topicTitle} operates under the hood and why developers choose it over legacy patterns.`,
          sampleAnswer: `${topicTitle} abstracts low-level mechanics into clean function interfaces, reducing boilerplate code and improving code maintainability.`
        }
      ],
      codingQuestions: [
        {
          prompt: `Write a clean JavaScript function demonstrating ${topicTitle}.`,
          starterCode: `function executeChallenge(data) {\n  // Write your implementation for ${topicTitle} here\n  return null;\n}`,
          solution: `function executeChallenge(data) {\n  if (!data) return [];\n  return data.filter(x => Boolean(x));\n}`
        }
      ]
    };
  }

  /**
   * Phase E: Evaluate student answer and identify misconceptions, missing concepts, mistakes, and feedback
   */
  public static async evaluateStudentAnswer(user: IUser, question: string, studentAnswer: string): Promise<IAIEvaluationResult> {
    console.log(`🤖 [AI SERVICE] Evaluating Student Answer for: ${question}`);

    if (GeminiService.isLLMConnected()) {
      const prompt = `
        Question: ${question}
        Student Answer: ${studentAnswer}

        Evaluate accuracy and return JSON matching keys: score (0-100), correctUnderstanding (array of strings), misconceptions (array of strings), missingConcepts (array of strings), mistakes (array of strings), feedbackText (string).
      `;
      const llmResult = await GeminiService.generateJSON<IAIEvaluationResult>(prompt, 'You are an empathetic, constructive technical teacher.');
      if (llmResult && typeof llmResult.score === 'number') {
        return llmResult;
      }
    }

    // Fallback Evaluation Engine
    const isDetailed = studentAnswer.length > 25;
    const score = isDetailed ? 85 : 55;

    return {
      score,
      correctUnderstanding: [
        `Identified the core objective of the question.`,
        `Recognized primary parameters needed for execution.`
      ],
      misconceptions: isDetailed ? [] : [
        `Answer is brief; ensure you explain boundary checks and exception scenarios.`
      ],
      missingConcepts: isDetailed ? [] : [
        `Consider mentioning error handling and time complexity trade-offs.`
      ],
      mistakes: [],
      feedbackText: isDetailed
        ? `Great work! Your answer demonstrates a strong grasp of the fundamentals and core execution steps.`
        : `Good effort! Your response touches on the key concept, but expanding with specific examples and boundary conditions will help solidify your score.`
    };
  }

  /**
   * Phase G: Adaptive Mentor Engine decision making loop
   */
  public static async determineAdaptiveNextAction(
    user: IUser,
    topicTitle: string,
    quizScore?: number,
    totalQuestions?: number
  ): Promise<IAdaptiveDecision> {
    console.log(`🤖 [ADAPTIVE MENTOR ENGINE] Evaluating progress for topic: ${topicTitle}, score: ${quizScore}/${totalQuestions}`);

    const ratio = totalQuestions && totalQuestions > 0 ? (quizScore || 0) / totalQuestions : 0.8;

    if (GeminiService.isLLMConnected()) {
      const prompt = `
        Student Name: ${user.name}
        Topic: ${topicTitle}
        Score Ratio: ${ratio * 100}%
        Weaknesses: ${user.onboarding?.careerGoals?.weaknesses?.join(', ') || 'None'}

        Determine adaptive learning status and next action. Return JSON matching keys: status ('Strong topic'|'Weak topic'|'Needs revision'|'Ready for next module'|'Needs prerequisite'), nextAction ('Continue'|'Revise'|'Practice more'|'Learn prerequisite'|'Retry assessment'), recommendationReason, easierExamples (array), suggestedPrerequisites (array).
      `;
      const llmResult = await GeminiService.generateJSON<IAdaptiveDecision>(prompt, 'You are an adaptive learning AI mentor.');
      if (llmResult && llmResult.status) {
        return llmResult;
      }
    }

    // Fallback Adaptive Logic
    if (ratio >= 0.8) {
      return {
        status: 'Strong topic',
        nextAction: 'Continue',
        recommendationReason: `Excellent performance! You answered ${(ratio * 100).toFixed(0)}% correctly. You are ready to move on to the next module.`,
        easierExamples: []
      };
    } else if (ratio >= 0.5) {
      return {
        status: 'Needs revision',
        nextAction: 'Practice more',
        recommendationReason: `Solid attempt with ${(ratio * 100).toFixed(0)}% score. Solving a few extra practice exercises will solidify your understanding.`,
        easierExamples: [
          `Try solving single-step coding challenges before tackling nested async loops.`
        ]
      };
    } else {
      return {
        status: 'Weak topic',
        nextAction: 'Revise',
        recommendationReason: `You scored ${(ratio * 100).toFixed(0)}%. Weakness detected in ${topicTitle}. Let's review the core concepts and easier analogies before retrying the assessment.`,
        easierExamples: [
          `Review basic variable closures and event loops before retrying async promises.`,
          `Study step-by-step code traces with console outputs.`
        ],
        suggestedPrerequisites: [
          `Core JavaScript Scope & Functions`
        ]
      };
    }
  }

  private static getMockUrl(type: string, tag: string): string {
    const urls: Record<string, string> = {
      documentation: `https://developer.mozilla.org/en-US/search?q=${tag}`,
      playlist: `https://youtube.com/results?search_query=${tag}+tutorials`,
      course: `https://www.coursera.org/search?query=${tag}`,
      practice: `https://leetcode.com/problemset/all/?search=${tag}`,
      project: `https://github.com/trending/${tag}`,
      challenge: `https://hackerrank.com/domains/${tag}`,
      quiz: `https://quizlet.com/search?q=${tag}`,
      book: `https://www.google.com/search?tbm=bks&q=${tag}+programming`,
      'cheat-sheet': `https://devhints.io/${tag}`,
      'interview-notes': `https://github.com/jwasham/coding-interview-university`
    };
    return urls[type] || `https://www.google.com/search?q=${tag}`;
  }

  /**
   * Helper to format duration based on study target and multiplier
   */
  private static calcLearningTime(dailyHours: number, weight: number): string {
    const totalWeeks = Math.ceil((weight * 12) / dailyHours);
    if (totalWeeks <= 4) {
      return `${totalWeeks} weeks`;
    } else {
      const months = Math.ceil(totalWeeks / 4);
      return `${months} months`;
    }
  }
}
