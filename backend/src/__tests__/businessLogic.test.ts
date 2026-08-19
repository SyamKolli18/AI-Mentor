import { describe, it, expect } from 'vitest';
import { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken } from '../utils/jwt';
import { AIService } from '../utils/aiService';

describe('Authentication JWT Utilities', () => {
  const payload = { userId: 'user-123-abc', email: 'student@college.edu' };

  it('should generate and verify a valid access token', () => {
    const token = generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should generate and verify a valid refresh token', () => {
    const refreshToken = generateRefreshToken(payload);
    expect(refreshToken).toBeDefined();
    expect(typeof refreshToken).toBe('string');

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });
});

describe('AI Service Profile Analysis & Scoring Logic', () => {
  const mockUser: any = {
    name: 'Alex Rivera',
    email: 'alex@college.edu',
    onboarding: {
      academic: { degree: 'B.Tech', branch: 'Computer Science', cgpa: 8.5 },
      skills: {
        languages: ['JavaScript', 'Python', 'TypeScript'],
        subjects: ['Data Structures', 'Algorithms', 'DBMS'],
        otherSkills: ['React', 'Git']
      },
      careerGoals: {
        preferredCareer: 'Frontend Developer',
        confidenceLevel: 'high',
        strengths: ['JavaScript', 'React'],
        weaknesses: ['Docker']
      },
      preferences: {
        learningStyle: 'kinesthetic',
        dailyStudyTime: 4,
        communicationSkills: 'excellent'
      }
    }
  };

  it('should compute quantitative scores correctly from onboarding data', async () => {
    const profile = await AIService.analyzeProfile(mockUser);

    expect(profile.scores).toBeDefined();
    expect(profile.scores.programmingScore).toBeGreaterThan(60);
    expect(profile.scores.problemSolvingScore).toBeGreaterThan(60);
    expect(profile.scores.communicationScore).toBe(92);
    expect(profile.scores.careerReadinessScore).toBeGreaterThan(50);
  });

  it('should generate qualitative recommendations and timeline estimates', async () => {
    const profile = await AIService.analyzeProfile(mockUser);

    expect(profile.insights).toBeDefined();
    expect(profile.insights.length).toBeGreaterThan(0);
    expect(profile.timelineEstimate.monthsRequired).toBeGreaterThan(0);
    expect(profile.timelineEstimate.weeklyEffortHours).toBe(20);
  });
});

describe('Career Recommendation Engine', () => {
  const mockUser: any = {
    name: 'Sam Student',
    onboarding: {
      careerGoals: { preferredCareer: 'Frontend Developer' },
      preferences: { dailyStudyTime: 3 }
    }
  };

  const mockProfile: any = {
    scores: {
      programming: 80,
      problemSolving: 75,
      communication: 85,
      mathematics: 70,
      consistency: 80
    }
  };

  it('should recommend matching top career paths with match percentages and skill gaps', async () => {
    const recs = await AIService.getCareerRecommendations(mockUser, mockProfile);

    expect(recs.length).toBe(3);
    expect(recs[0].careerName).toBe('Frontend Developer');
    expect(recs[0].matchPercentage).toBeGreaterThan(60);
    expect(recs[0].currentSkillGap).toBeDefined();
    expect(recs[0].whyMatches).toContain('React/JS');
  });
});

describe('Adaptive Roadmap Generation', () => {
  const mockUser: any = {
    name: 'Taylor Code',
    onboarding: {
      skills: { languages: ['JavaScript'], otherSkills: ['React'] },
      careerGoals: { weaknesses: ['JavaScript'] },
      preferences: { dailyStudyTime: 2 }
    }
  };

  it('should generate roadmap modules with topics, prerequisites, and quizzes', async () => {
    const modules = await AIService.generateRoadmap(mockUser, 'Frontend Developer');

    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0].title).toBeDefined();
    expect(modules[0].topics).toBeDefined();
    expect(modules[0].checkpointQuiz).toBeDefined();
  });
});

describe('AI Evaluation & Adaptive Mentor Engine', () => {
  const mockUser: any = { name: 'Jordan Test', onboarding: {} };

  it('should evaluate student answers with score and feedback breakdown', async () => {
    const evalResult = await AIService.evaluateStudentAnswer(
      mockUser,
      'Explain JavaScript promises',
      'A Promise in JavaScript represents an asynchronous operation that will resolve with a value or reject with an error.'
    );

    expect(evalResult.score).toBeGreaterThan(60);
    expect(evalResult.correctUnderstanding.length).toBeGreaterThan(0);
    expect(evalResult.feedbackText).toBeDefined();
  });

  it('should return Strong topic when score ratio is 80% or higher', async () => {
    const decision = await AIService.determineAdaptiveNextAction(mockUser, 'Async JavaScript', 4, 5);

    expect(decision.status).toBe('Strong topic');
    expect(decision.nextAction).toBe('Continue');
  });

  it('should return Weak topic and remediation steps when score ratio is below 50%', async () => {
    const decision = await AIService.determineAdaptiveNextAction(mockUser, 'Recursion', 1, 5);

    expect(decision.status).toBe('Weak topic');
    expect(decision.nextAction).toBe('Revise');
    expect(decision.easierExamples?.length).toBeGreaterThan(0);
  });
});
