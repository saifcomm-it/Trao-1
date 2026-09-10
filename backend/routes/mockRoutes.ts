import { Router, Request, Response } from 'express';
import { llm } from '../helpers/pipeline/llm-client';
import { MockSession } from '../models/mockModel';
import { optionalAuthenticate } from './userRoutes';

export const mockRoutes = Router();

mockRoutes.use(optionalAuthenticate);


mockRoutes.post('/evaluate', async (req: Request, res: Response) => {
  const { questionPrompt, answerOutline, userAnswer, questionId } = req.body;

  if (!questionPrompt || !userAnswer) {
    return res.status(400).json({ message: 'questionPrompt and userAnswer are required.' });
  }

  const userId = (req as any).user?.id || 'anonymous';

  const systemPrompt = `You are a Principal Technical Interviewer evaluating a candidate's practice response.
Score their answer from 0 to 100 benchmarked against the expected answer outline.

RULES:
1. Be fair but rigorous. Score based on technical accuracy, depth, structure, and relevance.
2. Provide 2-4 specific strengths the candidate demonstrated.
3. Provide 2-4 specific gaps or areas for improvement.
4. Give a 2-3 sentence constructive coaching feedback paragraph.
5. Do NOT use generic placeholder text. Every point must reference the candidate's actual answer content.

Respond ONLY with valid JSON:
{
  "score": number (0-100),
  "strengths": string[],
  "gaps": string[],
  "feedback": string
}`;

  const userContent = `Interview Question:
"${questionPrompt}"

Expected Key Outline / Scoring Rubric:
"${answerOutline || 'Demonstrate deep conceptual mastery, practical trade-offs, and clear communication.'}"

Candidate's Answer:
"${userAnswer}"`;

  try {
    const evaluation = await llm.completeJson<{
      score: number;
      strengths: string[];
      gaps: string[];
      feedback: string;
    }>(userContent, {
      systemPrompt,
      temperature: 0.2
    });

    // Persist to MockSession in MongoDB
    try {
      await MockSession.create({
        userId,
        questionId: questionId || undefined,
        questionPrompt,
        answerOutline: answerOutline || '',
        userAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        gaps: evaluation.gaps,
        improvements: evaluation.gaps
      });
    } catch (dbErr) {
      console.warn('[MockRoutes] Failed to save mock session to DB:', dbErr);
    }

    res.json(evaluation);
  } catch (err: any) {
    console.error('[MockRoutes] AI evaluation failed:', err?.message || err);
    res.status(503).json({
      message: 'AI evaluation service is temporarily unavailable. Please try again in a moment.',
      code: 'AI_UNAVAILABLE'
    });
  }
});

// GET /history — Fetch all mock sessions for the current user
mockRoutes.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId || userId === 'anonymous') {
      return res.json([]);
    }

    const sessions = await MockSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch mock history' });
  }
});

// GET /history/:questionId — Fetch previous mock attempts for a specific question
mockRoutes.get('/history/:questionId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { questionId } = req.params;

    if (!userId || userId === 'anonymous') {
      return res.json([]);
    }

    const sessions = await MockSession.find({ userId, questionId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch question history' });
  }
});

export const mockRouter = mockRoutes;
export default mockRoutes;
