import { Response, NextFunction } from 'express';
import { MockInterview, IInterviewQuestion } from '../models/MockInterview';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Dynamic mock interview questions pool depending on type
const getQuestionsPool = (type: string, career: string): IInterviewQuestion[] => {
  const t = type.toLowerCase();
  const c = career.toLowerCase();
  const pool: IInterviewQuestion[] = [];

  if (t.includes('tech') || t.includes('coding')) {
    if (c.includes('front') || c.includes('react') || c.includes('web')) {
      pool.push({
        question: 'Explain the difference between Virtual DOM and Shadow DOM, and how React 19 handles rendering optimization.',
        sampleAnswer: 'Virtual DOM is a client-side programming concept representing UI elements as JS objects synced with the real DOM via reconciliation. Shadow DOM is a web standard providing CSS style boundaries for web components. React 19 optimizes rendering using the React Compiler to automatically memoize components, eliminating the need for manual useMemo/useCallback hooks.'
      });
      pool.push({
        question: 'What is the Event Loop in JavaScript? Explain the queue priorities for macro-tasks and micro-tasks.',
        sampleAnswer: 'The Event Loop coordinates the execution of code, events, and sub-tasks. Micro-tasks (Promises, queueMicrotask) have higher priority than macro-tasks (setTimeout, setInterval, I/O) and are executed fully before the next rendering tick.'
      });
      pool.push({
        question: 'How do you handle state updates loops bugs when using React hooks like useEffect?',
        sampleAnswer: 'Updates loops are caused by updating a state variable that is included in the hook dependancy array. To avoid loops, specify strict comparison bounds, filter updates, or use functional state updates (setVal(v => v + 1)) to remove the state variable from dependencies.'
      });
    } else {
      pool.push({
        question: 'Explain index configurations in databases (MongoDB or SQL). How do index bounds affect read and write performance?',
        sampleAnswer: 'Indexes speed up read queries by creating structured search trees (B-Trees or hashes) on columns/fields. However, they slow down write operations (insert, update, delete) because the index tree must be updated in sync with data writes.'
      });
      pool.push({
        question: 'How do worker threads differ from the main asynchronous event-loop thread in Node.js?',
        sampleAnswer: 'Node.js async operations delegate work to OS threads or libuv threadpools, but still execute callback results in a single thread. Worker threads run separate execution loops on separate system threads, allowing CPU-bound workloads to process in parallel without blocking main client servers.'
      });
    }
  } else if (t.includes('system') || t.includes('design')) {
    pool.push({
      question: 'How would you design a rate limiter middleware for a high-traffic microservice API? What data store would you use and why?',
      sampleAnswer: 'I would use Redis with a sliding-window counter algorithm. Redis allows atomic increments with key expiries, ensuring sub-millisecond latencies. The middleware filters incoming IPs, increments counter keys, and rejects requests exceeding the thresholds.'
    });
    pool.push({
      question: 'Describe standard caching strategies (e.g. Write-Through, Write-Behind, Cache-Aside). How do you resolve cache validation bugs?',
      sampleAnswer: 'Cache-Aside queries cache first, updating it from DB if missing. Write-Through writes to cache and DB simultaneously. Validation bugs are resolved using strict TTL (Time to Live) values, cache eviction configurations (LRU), or publishing invalidation events on DB updates.'
    });
  } else if (t.includes('behavioral') || t.includes('hr')) {
    pool.push({
      question: 'Tell me about a time you encountered a merge collision or conflicting technical view on a project team. How did you resolve it?',
      sampleAnswer: 'I scheduled a brief call to walk through both files. We compared the logic branches, aligned on database structures, manually merged the overlapping lines, and verified correct output through joint unit test runs.'
    });
    pool.push({
      question: 'Describe a situation where a feature target failed to meet production deployment timeline targets. What were your steps?',
      sampleAnswer: 'I prioritized communication, flagged the blocker immediately, scoped down stretch goals into subsequent releases, and focused on releasing the core MVP on schedule.'
    });
  } else {
    pool.push({
      question: 'What are your career aspirations for the next 3-5 years? How does this role align with your skill mapping?',
      sampleAnswer: 'I aim to grow from building modular features into designing distributed microservice systems. This role aligns with my stack (React, Node, Mongoose) and provides cloud environment exposure.'
    });
  }

  // Backup question to guarantee at least 3 questions
  pool.push({
    question: 'How do you handle testing and error verification within local developer sandboxes?',
    sampleAnswer: 'I write unit tests (Jest/Vitest) asserting logic parameters, use environment variables to configure sandboxed mock clients, and perform integration tests on testing databases.'
  });

  return pool;
};

export const generateInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { interviewType, difficulty } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!interviewType) {
      throw new AppError('Interview type is required', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Terminate existing active interviews for clean state
    await MockInterview.updateMany({ userId: new mongoose.Types.ObjectId(userId), status: 'active' }, { status: 'completed' });

    const career = user.onboarding?.careerGoals?.preferredCareer || 'Software Engineer';
    const selectedQuestions = getQuestionsPool(interviewType, career);

    const interview = new MockInterview({
      userId: new mongoose.Types.ObjectId(userId),
      interviewType,
      difficulty: difficulty || 'Intermediate',
      status: 'active',
      currentQuestionIndex: 0,
      questions: selectedQuestions
    });

    await interview.save();

    res.status(201).json({
      status: 'success',
      interview
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const interview = await MockInterview.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
    if (!interview) {
      throw new AppError('Mock interview session not found', 404);
    }

    res.status(200).json({
      status: 'success',
      interview
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { userResponse } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const interview = await MockInterview.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
    if (!interview) {
      throw new AppError('Mock interview session not found', 404);
    }

    if (interview.status === 'completed') {
      throw new AppError('This interview is already completed', 400);
    }

    const currentIdx = interview.currentQuestionIndex;
    if (currentIdx >= interview.questions.length) {
      throw new AppError('All questions already answered. Please complete the interview.', 400);
    }

    const currentQuestion = interview.questions[currentIdx];
    currentQuestion.userResponse = userResponse || 'No response provided.';

    // Local heuristic evaluation: compute basic scores based on response length and keyword overlap
    const responseWords = (currentQuestion.userResponse || '').toLowerCase().split(/\s+/).filter(Boolean);
    const sampleWords = currentQuestion.sampleAnswer.toLowerCase().split(/\s+/).filter(Boolean);

    // Calculate score (simple matching index)
    const matchingKeywords = sampleWords.filter(w => w.length > 4 && responseWords.includes(w));
    let score = 40; // baseline
    if (responseWords.length > 5) score += 15;
    if (responseWords.length > 15) score += 15;
    score += Math.min(30, matchingKeywords.length * 10);

    currentQuestion.score = Math.min(99, score);
    currentQuestion.feedback = score >= 75 
      ? '✅ Strong response. You demonstrated accurate conceptual mapping and appropriate technical terminology.' 
      : '⚠️ Adequate. Re-align terms to clarify implementation methods and explore details.';

    // Increment index
    interview.currentQuestionIndex = currentIdx + 1;
    await interview.save();

    res.status(200).json({
      status: 'success',
      currentQuestionIndex: interview.currentQuestionIndex,
      interview
    });
  } catch (error) {
    next(error);
  }
};

export const completeInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const interview = await MockInterview.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
    if (!interview) {
      throw new AppError('Mock interview session not found', 404);
    }

    // Compute averages
    let totalScore = 0;
    let answeredQuestionsCount = 0;

    interview.questions.forEach(q => {
      if (q.score !== undefined) {
        totalScore += q.score;
        answeredQuestionsCount++;
      }
    });

    const averageTechnicalScore = answeredQuestionsCount > 0 ? Math.round(totalScore / answeredQuestionsCount) : 60;
    const communicationScore = averageTechnicalScore > 75 ? 85 : 70;
    const confidenceScore = averageTechnicalScore > 70 ? 80 : 65;
    const problemSolving = averageTechnicalScore;
    const overallRating = Math.round((averageTechnicalScore + communicationScore + confidenceScore + problemSolving) / 4);

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const topicsToRevise: string[] = [];
    const recommendedResources: string[] = [];
    const improvementRoadmap: string[] = [];

    if (overallRating >= 75) {
      strengths.push('Clear articulation of complex system designs and framework loops.');
      strengths.push('Logical structuring of performance scalability topics.');
      weaknesses.push('Provide more quantitative parameters on cache reduction metrics.');
      topicsToRevise.push('Database indexing index trees write performance details.');
      recommendedResources.push('High Scalability Architecture blogs.');
    } else {
      strengths.push('Demonstrates foundational awareness of terminology.');
      weaknesses.push('Struggles to articulate runtime complexity queues priorities.');
      weaknesses.push('Typing validations structure explanations are vague.');
      topicsToRevise.push('JavaScript Event loop microtask priorities.');
      topicsToRevise.push('NoSQL index configurations and composite keys.');
      recommendedResources.push('Eloquent JavaScript: Event Handling and Async chapters.');
      recommendedResources.push('MDN Web Docs: Client-side structures validations.');
    }

    improvementRoadmap.push('Week 1: Dedicate 30 mins to reviewing the recommended resources.');
    improvementRoadmap.push('Week 2: Solve 2 coding questions mapping async functions execution.');

    interview.feedback = {
      communicationScore,
      technicalScore: averageTechnicalScore,
      confidenceScore,
      problemSolving,
      overallRating,
      strengths,
      weaknesses,
      topicsToRevise,
      recommendedResources,
      improvementRoadmap
    };

    interview.status = 'completed';
    await interview.save();

    res.status(200).json({
      status: 'success',
      message: 'Interview session completed successfully.',
      interview
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const history = await MockInterview.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};
