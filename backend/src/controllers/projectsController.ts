import { Response, NextFunction } from 'express';
import { ProjectRecommendation } from '../models/ProjectRecommendation';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Generates robust mock recommendations depending on career targets
const generateMockProjects = (userId: string, career: string): any[] => {
  const c = career.toLowerCase();
  const projects: any[] = [];

  if (c.includes('front') || c.includes('react') || c.includes('web')) {
    projects.push({
      userId: new mongoose.Types.ObjectId(userId),
      projectName: 'Premium Glassmorphic Kanban Board',
      description: 'A fully interactive, high-performance project management dashboard utilizing Framer Motion, Zustand state orchestration, and local caching.',
      difficulty: 'Intermediate',
      estimatedDuration: '2 weeks',
      requiredTechnologies: ['React 19', 'TypeScript', 'Zustand', 'Framer Motion', 'Tailwind CSS', 'Vite'],
      learningOutcomes: [
        'Master drag-and-drop state updates without UI lagging.',
        'Optimize re-renders using Zustand selective selectors.',
        'Create rich micro-animations and physics-based transitions.'
      ],
      portfolioValue: 'Demonstrates professional competence in advanced client-side architecture, fluid user interfaces, and modular layout composition.',
      recruiterValue: 'Shows high design aesthetic awareness and mastery of modern state managers without relying on bulky framework overhead.',
      resumeValue: 'Built custom Framer Motion gesture cards supporting custom state caching, reducing client redraw delays by 40%.',
      githubBestPractices: [
        'Maintain a clean branching architecture (feature/kanban-drag, fix/modal-rerenders).',
        'Leverage husky pre-commit hooks to automate formatting and ESLint validations.',
        'Detail configuration steps and user stories inside a professional README.md.'
      ],
      folderStructure: `src/
├── components/
│   ├── ui/          # Atomic reusable items (buttons, inputs)
│   ├── kanban/      # Board, Columns, and Card modules
├── context/         # Theme and state providers
├── hooks/           # Custom drag listeners
├── store/           # Zustand global state slices
└── App.tsx`,
      databaseDesign: 'No direct server database required (localStorage cached), structures map columns as string arrays containing board-card items.',
      apiSuggestions: [
        'GET /api/boards - Retrieve structural column items',
        'POST /api/boards/reorder - Update drag-drop indices'
      ],
      stretchGoals: [
        'Add live multi-user sync using WebSockets.',
        'Support keyboard shortcuts (Vim bindings) for card creation.'
      ],
      deploymentGuide: 'Compile static bundle using npm run build. Host on Vercel or Netlify. Link with automated branch preview deployments.'
    });

    projects.push({
      userId: new mongoose.Types.ObjectId(userId),
      projectName: 'Virtual SaaS Billing Dashboard',
      description: 'Sleek dark-themed Stripe-style customer invoicing and payment hub featuring multi-currency charts, usage trackers, and sandbox logs.',
      difficulty: 'Advanced',
      estimatedDuration: '3 weeks',
      requiredTechnologies: ['Next.js App Router', 'Recharts', 'Tailwind CSS', 'Zod', 'React Hook Form'],
      learningOutcomes: [
        'Design compound component sub-systems with clean typescript interfaces.',
        'Integrate Recharts graphs showing dynamic date range aggregation datasets.',
        'Implement resilient schema validation on multiple nested billing configurations.'
      ],
      portfolioValue: 'Illustrates competence in SaaS analytics layouts, financial data representations, and compound UI design models.',
      recruiterValue: 'Evaluates ability to build complex, responsive business dashboards showing data accuracy and validation flows.',
      resumeValue: 'Constructed responsive charts aggregating monthly transactional billing events across multi-currency configurations.',
      githubBestPractices: [
        'Set up automated GitHub actions checking type safety on PR merges.',
        'Leverage CSS variable mappings to support unified dashboard theme changes.'
      ],
      folderStructure: `src/
├── app/             # Next.js app router structure
│   ├── billing/     # Billing sub-modules
│   ├── components/  # Page-specific analytics cards
├── components/ui/   # Reusable UI systems (Card, Chart, Alert)
├── lib/             # Calculations and schema parsers
└── types/           # Type declarations`,
      databaseDesign: 'Mongoose models mapping: SubscriptionSchema (planName, status, price, currentPeriodEnd) and InvoiceSchema (amount, currency, status, dueDate).',
      apiSuggestions: [
        'GET /api/billing/stats - Retrieve aggregated chart variables',
        'POST /api/billing/subscribe - Initiate simulated payment verification'
      ],
      stretchGoals: [
        'Export usage analytics as printable PDF report structures.',
        'Incorporate mock SMS alert notifications upon billing threshold warnings.'
      ],
      deploymentGuide: 'Host Next.js application on Vercel Serverless environment. Set up environment variables matching standard CORS and API URLs.'
    });
  } else if (c.includes('back') || c.includes('node') || c.includes('database')) {
    projects.push({
      userId: new mongoose.Types.ObjectId(userId),
      projectName: 'Distributed Async Task Queue Processor',
      description: 'A robust message broker and job queue system executing asynchronous workloads with retries, status hooks, and delay logs.',
      difficulty: 'Advanced',
      estimatedDuration: '3 weeks',
      requiredTechnologies: ['Node.js', 'Express', 'Redis', 'BullMQ', 'TypeScript', 'Docker'],
      learningOutcomes: [
        'Understand worker thread processing behaviors for heavy CPU tasks.',
        'Establish Redis connections managing FIFO/LIFO queue events.',
        'Write custom error handlers logging failure codes and handling exponential backoffs.'
      ],
      portfolioValue: 'Proves knowledge in backend asynchronous patterns, event-driven designs, scaling architectures, and worker pipelines.',
      recruiterValue: 'Confirms capacity to handle microservice tasks, event subscriptions, and backend performance bottlenecks.',
      resumeValue: 'Built a BullMQ-backed distributed processor managing 10k+ concurrent job events with automatic exponential backoffs.',
      githubBestPractices: [
        'Dockerize local developer setup containing Redis container configurations.',
        'Write automated mock worker tasks verifying task completions in pipeline builds.'
      ],
      folderStructure: `src/
├── config/          # Redis connection files
├── queue/           # BullMQ queue creators
├── workers/         # Job execution workers
├── controllers/     # Task controllers
├── routes/          # Express route mounts
└── server.ts`,
      databaseDesign: 'Redis schema mapping status keys (job:id -> hash containing progress, attempts, results) and MongoDB logging collection for long-term audit reports.',
      apiSuggestions: [
        'POST /api/tasks/enqueue - Push a job onto the processor queue',
        'GET /api/tasks/status/:jobId - Track real-time progress and retry logs'
      ],
      stretchGoals: [
        'Develop an admin console rendering active queues metrics.',
        'Support email dispatch alerts automatically if workers fail continuously.'
      ],
      deploymentGuide: 'Dockerize the application bundle. Host the cluster nodes on AWS ECS or render services linked with a cloud Redis client.'
    });
  } else {
    // AI / ML / General backup
    projects.push({
      userId: new mongoose.Types.ObjectId(userId),
      projectName: 'RAG LLM Document Co-Pilot',
      description: 'A retrieval-augmented generation search hub processing file indexes, vector mappings, and returning context-aware answers.',
      difficulty: 'Expert',
      estimatedDuration: '4 weeks',
      requiredTechnologies: ['Python', 'FastAPI', 'LangChain', 'Pinecone', 'OpenAI API', 'React'],
      learningOutcomes: [
        'Chunk and embed PDF documents using vector mapping frameworks.',
        'Interact with external vector databases using coordinate search metrics.',
        'Write custom prompt prompts reducing LLM hallucinations.'
      ],
      portfolioValue: 'Demonstrates expert knowledge in modern AI engineering models, document ingestion pipes, and vector embeddings.',
      recruiterValue: 'Confirms ability to adapt state-of-the-art Generative AI techniques to actual corporate document repositories.',
      resumeValue: 'Architected a RAG search engine using LangChain and Pinecone vector stores, improving semantic retrieval relevance.',
      githubBestPractices: [
        'Separate system prompt files from logic scripts to facilitate model overrides.',
        'Leverage environment variable secrets to guard API key parameters.'
      ],
      folderStructure: `backend/
├── app/
│   ├── core/        # Vector connectors
│   ├── services/    # LangChain prompt setup
│   └── main.py
frontend/
└── src/             # Standard dashboard chat interfaces`,
      databaseDesign: 'Pinecone namespace containing document embeddings alongside metadata fields (fileName, creationTime, pageIndex).',
      apiSuggestions: [
        'POST /api/query - Send user question and query matching vectors',
        'POST /api/upload - Ingest new PDF document and index chunks'
      ],
      stretchGoals: [
        'Support voice audio questions using Whisper models.',
        'Visualize document vector groupings inside 3D web environments.'
      ],
      deploymentGuide: 'Host fastapi backend on AWS App Runner. Deploy Pinecone index instances on serverless structures. Deploy frontend to Vercel.'
    });
  }

  // Backup simple project to make sure every track gets at least 2 recommendations
  projects.push({
    userId: new mongoose.Types.ObjectId(userId),
    projectName: 'RESTful API Security Gateway',
    description: 'An API proxy intercepting requests, enforcing rate limits, inspecting CORS configurations, and parsing JWT payload keys.',
    difficulty: 'Beginner',
    estimatedDuration: '1 week',
    requiredTechnologies: ['Node.js', 'Express', 'JWT', 'Morgan', 'Cors'],
    learningOutcomes: [
      'Understand Express middleware routing pipelines.',
      'Configure secure HTTP headers and rate limiting rules.',
      'Authenticate client requests dynamically using JWT signature validation.'
    ],
    portfolioValue: 'Demonstrates basic backend logic, safety filters, security checks, and structure handling capabilities.',
    recruiterValue: 'Confirms foundational knowledge of network request headers, API structures, and authentication patterns.',
    resumeValue: 'Built custom Express security middleware managing incoming requests, filtering malicious Mongo payloads.',
    githubBestPractices: [
      'Document all endpoints and JSON payload parameters inside README.',
      'Incorporate integration tests checking token rejection scenarios.'
    ],
    folderStructure: `src/
├── middleware/      # Auth, rate-limiter, headers keys
├── routes/          # Proxy routing configs
└── app.ts`,
    databaseDesign: 'Standalone middleware proxy. No database required.',
    apiSuggestions: [
      'POST /api/auth/token - Fetch verification signature',
      'GET /api/proxy/resource - Verify safe forwarding'
    ],
    stretchGoals: [
      'Add visual dashboards recording live access logs.',
      'Support dynamic whitelist matching for custom IP parameters.'
    ],
    deploymentGuide: 'Host proxy configurations on a light hosting service (Render, Fly.io, or Heroku).'
  });

  return projects;
};

export const getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Retrieve recommendations from DB
    let recs = await ProjectRecommendation.find({ userId: new mongoose.Types.ObjectId(userId) });

    if (recs.length === 0) {
      // Generate initial list depending on onboarding career preference
      const targetCareer = user.onboarding?.careerGoals?.preferredCareer || 'Fullstack Developer';
      const mockProjects = generateMockProjects(userId, targetCareer);
      recs = (await ProjectRecommendation.insertMany(mockProjects)) as any;
    }

    res.status(200).json({
      status: 'success',
      results: recs.length,
      recommendations: recs
    });
  } catch (error) {
    next(error);
  }
};

export const saveProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const project = await ProjectRecommendation.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
    if (!project) {
      throw new AppError('Project recommendation not found', 404);
    }

    // Toggle saved status
    project.status = project.status === 'recommended' ? 'saved' : 'recommended';
    await project.save();

    res.status(200).json({
      status: 'success',
      message: `Project successfully ${project.status === 'saved' ? 'saved' : 'removed from saved'}.`,
      project
    });
  } catch (error) {
    next(error);
  }
};

export const bookmarkProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const project = await ProjectRecommendation.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
    if (!project) {
      throw new AppError('Project recommendation not found', 404);
    }

    project.bookmarked = !project.bookmarked;
    await project.save();

    res.status(200).json({
      status: 'success',
      message: `Project successfully ${project.bookmarked ? 'bookmarked' : 'unbookmarked'}.`,
      project
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { completionPercentage, reflections } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const project = await ProjectRecommendation.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
    if (!project) {
      throw new AppError('Project recommendation not found', 404);
    }

    if (typeof completionPercentage === 'number') {
      project.completionPercentage = Math.max(0, Math.min(100, completionPercentage));
      if (project.completionPercentage === 100) {
        project.status = 'completed';
      } else if (project.status === 'completed') {
        project.status = 'saved'; // downgrade if percentage is reduced below 100
      }
    }

    if (reflections !== undefined) {
      project.reflections = reflections;
    }

    await project.save();

    res.status(200).json({
      status: 'success',
      message: 'Project progress updated successfully.',
      project
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProjectDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { repoUrl, screenshotUrl } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const project = await ProjectRecommendation.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
    if (!project) {
      throw new AppError('Project recommendation not found', 404);
    }

    if (repoUrl !== undefined) {
      project.repoUrl = repoUrl;
    }

    if (screenshotUrl) {
      project.screenshots.push(screenshotUrl);
    }

    await project.save();

    res.status(200).json({
      status: 'success',
      message: 'Project uploads saved successfully.',
      project
    });
  } catch (error) {
    next(error);
  }
};
