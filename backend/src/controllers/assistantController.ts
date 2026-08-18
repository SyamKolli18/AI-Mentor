import { Response, NextFunction } from 'express';
import { AIChatSession } from '../models/AIChatSession';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const handleChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { content, sessionId } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!content) {
      throw new AppError('Message content is required', 400);
    }

    let session: any;

    if (sessionId) {
      session = await AIChatSession.findById(sessionId);
      if (!session || session.userId.toString() !== userId) {
        throw new AppError('Chat session not found', 404);
      }
    } else {
      // Create new session
      const title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
      session = new AIChatSession({
        userId: new mongoose.Types.ObjectId(userId),
        title,
        messages: [],
        favorites: []
      });
    }

    // Push user message
    session.messages.push({
      role: 'user',
      content,
      timestamp: new Date()
    });

    // Run heuristics AI Assistant
    const assistantReply = generateAIHeuristicReply(content);

    // Push assistant reply
    session.messages.push({
      role: 'assistant',
      content: assistantReply,
      timestamp: new Date()
    });

    await session.save();

    res.status(200).json({
      status: 'success',
      session,
      reply: assistantReply
    });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const sessions = await AIChatSession.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      sessions
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSaveSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    const session = await AIChatSession.findById(id);
    if (!session || session.userId.toString() !== userId) {
      throw new AppError('Chat session not found', 404);
    }

    session.isSaved = !session.isSaved;
    await session.save();

    res.status(200).json({
      status: 'success',
      message: session.isSaved ? 'Session bookmarked successfully.' : 'Session removed from bookmarks.',
      session
    });
  } catch (error) {
    next(error);
  }
};

export const saveFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { messageId, content } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized access', 401);
    }

    if (!messageId || !content) {
      throw new AppError('Message ID and content are required', 400);
    }

    const session = await AIChatSession.findById(id);
    if (!session || session.userId.toString() !== userId) {
      throw new AppError('Chat session not found', 404);
    }

    session.favorites.push({ messageId, content });
    await session.save();

    res.status(200).json({
      status: 'success',
      message: 'Added response to favorites list.',
      session
    });
  } catch (error) {
    next(error);
  }
};

// Generates response configurations
const generateAIHeuristicReply = (query: string): string => {
  const q = query.toLowerCase();

  if (q.includes('dsa') || q.includes('algorithm') || q.includes('data structure')) {
    return `### AI Mentor: Data Structures & Algorithms Explanation

Here is a quick breakdown of **Binary Search** optimization:

Binary Search operates in **$O(\\log n)$** time complexity by dividing the search range in half on each step. It requires a **sorted array** to function.

\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1; // Target not found
}
\`\`\`

**Suggested Practice:** Solve 3 binary search queries on arrays before attempting trees graph traversal.`;
  }

  if (q.includes('debug') || q.includes('optimize') || q.includes('fix code')) {
    return `### AI Mentor: Code Debugging & Performance Optimization

I reviewed your loop logic. Here is the optimized alternative using **HashMap caching** to drop the search from $O(N^2)$ to $O(N)$ runtime.

**Before (Nested Loops - $O(N^2)$):**
\`\`\`javascript
// Slow search
for (let i = 0; i < array.length; i++) {
  for (let j = i + 1; j < array.length; j++) {
    if (array[i] + array[j] === target) return [i, j];
  }
}
\`\`\`

**Optimized (HashMap Caching - $O(N)$):**
\`\`\`typescript
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  
  return [];
}
\`\`\`
*Key improvements: Single traversal, low memory profile.*`;
  }

  if (q.includes('flashcard') || q.includes('card')) {
    return `### AI Mentor: Flashcard Study Set

**Flashcard 1: Virtual DOM vs Real DOM**
- *Answer*: Virtual DOM is an in-memory lightweight representation of the real HTML DOM. Frameworks like React batch updates on the Virtual DOM first, performing minimal repaints using a diffing algorithm (Reconciliation) to optimize performance.

**Flashcard 2: ACID Properties in Databases**
- *Answer*: Atomicity (all or nothing), Consistency (preserves database rules), Isolation (concurrent transactions execute independently), Durability (updates survive system crashes).`;
  }

  if (q.includes('quiz') || q.includes('generate quiz')) {
    return `### AI Mentor: Checkpoint Quiz Generation

Here are 3 fast questions to check your current concept retention:

1. **Which sorting algorithm has a guaranteed worst-case time complexity of $O(n \\log n)$?**
   - *Answer*: Merge Sort (Quick Sort drops to $O(n^2)$ if pivots are selected poorly).
2. **What does the \`HTTP 403 Forbidden\` status code indicate?**
   - *Answer*: The server understood the request, but the client does not possess the correct role authorization credentials.
3. **What is the difference between \`==\` and \`===\` operators in JavaScript?**
   - *Answer*: \`==\` performs loose equality checks with type coercion, whereas \`===\` checks values and types strictly.`;
  }

  return `### Hello! I am your AI Learning Assistant.

I am here to guide you through your roadmap, answer engineering queries, explain complex concepts, and audit code arrays.

Here are a few things you can ask me:
1. **"Explain DSA binary trees"**
2. **"Optimize nested loops in Javascript"**
3. **"Generate study flashcards for DBMS"**
4. **"Generate quiz for systems architecture"**

Feel free to write your query here!`;
};
