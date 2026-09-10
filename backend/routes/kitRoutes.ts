import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { runPrepKitPipeline } from '../helpers/pipeline/orchestrator';
import { PrepKit } from '../models/kitModel';
import { Brief } from '../models/briefModel';
import { Role } from '../models/roleModel';
import { Question } from '../models/questionModel';
import { Schedule } from '../models/scheduleModel';
import { Flashcard } from '../models/flashcardModel';
import { MockSession } from '../models/mockModel';
import { User } from '../models/userModel';
import { optionalAuthenticate } from './userRoutes';
import { generateCompanyBrief } from '../helpers/pipeline/generate-brief';
import { generateCategorizedQuestions } from '../helpers/pipeline/generate-questions';
import { researchCompany } from '../helpers/crawler/researcher';
import { allocateSchedule } from '../helpers/pipeline/schedule-allocator';
import { executeCoverageLoop } from '../helpers/pipeline/second-pass';
import { generateFlashcards } from '../helpers/pipeline/generate-flashcards';
import { extractRequirements, sanitizeRoleText } from '../helpers/pipeline/extract-requirements';
import { QuestionCategory } from '../models/types';
import { llm } from '../helpers/pipeline/llm-client';

export const kitRoutes = Router();

kitRoutes.use(optionalAuthenticate);

function sanitizeKitPayload(kit: any) {
  if (!kit) return kit;
  const obj = kit.toObject ? kit.toObject() : { ...kit };
  if (obj._id) {
    obj.id = obj._id.toString();
  } else if (!obj.id && kit._id) {
    obj.id = kit._id.toString();
  }
  if (obj.role) {
    obj.role.title = sanitizeRoleText(obj.role.title, obj.role.title || '');
    obj.role.seniority = sanitizeRoleText(obj.role.seniority, obj.role.seniority || '');
  }
  if (obj.source) {
    obj.source.role = sanitizeRoleText(obj.source.role, obj.source.role || '');
    obj.source.company = sanitizeRoleText(obj.source.company, obj.source.company || '');
  }
  return obj;
}


export async function pushKitToUserArray(userId: string, kit: any) {
  if (!userId || userId === 'anonymous' || !mongoose.Types.ObjectId.isValid(userId)) {
    return;
  }
  try {
    const cleanKit = {
      id: kit.id || kit._id?.toString(),
      company_name: kit.source?.company || kit.company_name || '',
      role_title: kit.source?.role || kit.role?.title || kit.role_title || '',
      source: kit.source,
      company_brief: kit.company_brief,
      role: kit.role,
      questions: kit.questions || [],
      schedule: kit.schedule,
      flashcards: kit.flashcards || [],
      coverage: kit.coverage,
      createdAt: kit.createdAt || new Date(),
      updatedAt: new Date()
    };

    const user = await User.findById(userId);
    if (!user) return;

    user.kits = user.kits || [];
    const idx = user.kits.findIndex((k: any) => k.id === cleanKit.id);
    if (idx >= 0) {
      user.kits[idx] = { ...user.kits[idx], ...cleanKit, updatedAt: new Date() };
    } else {
      user.kits.push(cleanKit as any);
    }
    await user.save();
  } catch (err) {
    console.warn('[UserKitArray] Warning saving kit to user.kits array:', err);
  }
}


export async function updateKitInUserArray(userId: string, kitId: string, updates: (kit: any) => void) {
  if (!userId || userId === 'anonymous' || !mongoose.Types.ObjectId.isValid(userId)) {
    return;
  }
  try {
    const user = await User.findById(userId);
    if (!user || !Array.isArray(user.kits)) return;

    const kit = user.kits.find((k: any) => k.id === kitId);
    if (kit) {
      updates(kit);
      kit.updatedAt = new Date();
      user.markModified('kits');
      await user.save();
    }
  } catch (err) {
    console.warn('[UserKitArray] Warning updating kit in user.kits array:', err);
  }
}


export async function removeKitFromUserArray(userId: string, kitId: string) {
  if (!userId || userId === 'anonymous' || !mongoose.Types.ObjectId.isValid(userId)) {
    return;
  }
  try {
    const pullCondition = mongoose.Types.ObjectId.isValid(kitId)
      ? { $or: [{ id: kitId }, { _id: kitId }] }
      : { id: kitId };

    await User.findByIdAndUpdate(userId, {
      $pull: { kits: pullCondition as any }
    });
  } catch (err) {
    console.warn('[UserKitArray] Warning removing kit from user.kits array:', err);
  }
}


export async function persistKitToModularCollections(kit: any, kitId: string, userId?: string) {
  try {
    const promises: Promise<any>[] = [];


    if (kit.company_brief && kit.source) {
      promises.push(
        Brief.findOneAndUpdate(
          { kitId },
          {
            kitId,
            company: kit.source.company,
            company_url: kit.source.company_url,
            location: kit.source.location || 'Not Specified',
            summary: kit.company_brief.summary,
            what_they_do: kit.company_brief.what_they_do,
            sources: kit.company_brief.sources || [],
            isEdited: kit.company_brief.isEdited || false,
            researched_at: kit.source.researched_at,
            pages_used: kit.source.pages_used || []
          },
          { upsert: true, new: true }
        )
      );
    }


    if (kit.role) {
      promises.push(
        Role.findOneAndUpdate(
          { kitId },
          {
            kitId,
            title: kit.role.title,
            seniority: kit.role.seniority,
            responsibilities: kit.role.responsibilities || [],
            requirements: kit.role.requirements || []
          },
          { upsert: true, new: true }
        )
      );
    }


    if (Array.isArray(kit.questions)) {
      for (let i = 0; i < kit.questions.length; i++) {
        const q = kit.questions[i];
        promises.push(
          Question.findOneAndUpdate(
            { kitId, id: q.id },
            {
              kitId,
              id: q.id,
              requirement_ids: q.requirement_ids || [],
              category: q.category,
              prompt: q.prompt,
              answer_outline: q.answer_outline,
              difficulty: q.difficulty,
              origin: q.origin || 'generated',
              isPinned: q.isPinned || false,
              order: i
            },
            { upsert: true, new: true }
          )
        );
      }
    }


    if (kit.schedule) {
      promises.push(
        Schedule.findOneAndUpdate(
          { kitId },
          {
            kitId,
            days_available: kit.schedule.days_available,
            days: kit.schedule.days || []
          },
          { upsert: true, new: true }
        )
      );
    }


    if (Array.isArray(kit.flashcards)) {
      for (const f of kit.flashcards) {
        promises.push(
          Flashcard.findOneAndUpdate(
            { kitId, id: f.id },
            {
              kitId,
              userId: userId || 'anonymous',
              id: f.id,
              front: f.front,
              back: f.back,
              requirement_ids: f.requirement_ids || [],
              confidence: f.confidence || 'unreviewed',
              userAnswer: f.userAnswer || '',
              lastPracticedAt: f.lastPracticedAt,
              origin: f.origin || 'generated',
              isPinned: f.isPinned || false
            },
            { upsert: true, new: true }
          )
        );
      }
    }

    await Promise.all(promises);
  } catch (err) {
    console.warn('[ModularPersist] Warning while persisting to tab collections:', err);
  }
}


export async function assembleKitFromModularCollections(kitId: string, parentKitDoc?: any) {
  let kit = parentKitDoc;
  if (!kit) {
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      kit = await PrepKit.findById(kitId);
    }
    if (!kit) {
      kit = await PrepKit.findOne({ id: kitId });
    }
  }

  if (!kit) return null;
  const raw = sanitizeKitPayload(kit);

  try {
    const [briefDoc, roleDoc, questionsDocs, scheduleDoc, flashcardsDocs] = await Promise.all([
      Brief.findOne({ kitId }),
      Role.findOne({ kitId }),
      Question.find({ kitId }).sort({ order: 1 }),
      Schedule.findOne({ kitId }),
      Flashcard.find({ kitId })
    ]);

    if (briefDoc) {
      raw.company_brief = {
        summary: briefDoc.summary,
        what_they_do: briefDoc.what_they_do,
        sources: briefDoc.sources,
        isEdited: briefDoc.isEdited
      };
      if (briefDoc.company) raw.source.company = briefDoc.company;
      if (briefDoc.company_url) raw.source.company_url = briefDoc.company_url;
      if (briefDoc.location) raw.source.location = briefDoc.location;
    }

    if (roleDoc) {
      raw.role = {
        title: roleDoc.title,
        seniority: roleDoc.seniority,
        responsibilities: roleDoc.responsibilities,
        requirements: roleDoc.requirements
      };
    }

    if (questionsDocs && questionsDocs.length > 0) {
      raw.questions = questionsDocs.map((q: any) => ({
        id: q.id,
        requirement_ids: q.requirement_ids,
        category: q.category,
        prompt: q.prompt,
        answer_outline: q.answer_outline,
        difficulty: q.difficulty,
        origin: q.origin,
        isPinned: q.isPinned
      }));
    }

    if (scheduleDoc) {
      raw.schedule = {
        days_available: scheduleDoc.days_available,
        days: scheduleDoc.days.map((d: any) => ({
          day: d.day,
          focus: d.focus,
          question_ids: d.question_ids,
          minutes: d.minutes,
          isCompleted: d.isCompleted || false
        }))
      };
    }

    if (flashcardsDocs && flashcardsDocs.length > 0) {
      raw.flashcards = flashcardsDocs.map((f: any) => ({
        id: f.id,
        front: f.front,
        back: f.back,
        requirement_ids: f.requirement_ids,
        confidence: f.confidence,
        userAnswer: f.userAnswer,
        lastPracticedAt: f.lastPracticedAt,
        origin: f.origin,
        isPinned: f.isPinned
      }));
    }
  } catch (err) {
    console.warn('[ModularKitAssemble] Warning loading modular documents, using parent kit values:', err);
  }

  return raw;
}


kitRoutes.post('/generate', async (req: Request, res: Response) => {
  const { jd, company_url, days } = req.body;

  if (!jd || typeof jd !== 'string' || !jd.trim()) {
    return res.status(400).json({ message: 'A job description string is required.' });
  }
  if (!company_url || typeof company_url !== 'string') {
    return res.status(400).json({ message: 'A valid company website URL is required.' });
  }

  const requestedDays = Math.max(1, Math.min(60, parseInt(days, 10) || 5));
  const userId = (req as any).user?.id || 'anonymous';
  let userSeniority = (req as any).user?.seniority || req.body.seniority || '';
  if (!userSeniority && userId && userId !== 'anonymous') {
    try {
      const userDoc = await User.findById(userId);
      if (userDoc?.seniority) userSeniority = userDoc.seniority;
    } catch {}
  }


  const acceptsStream = req.headers.accept?.includes('text/event-stream');

  if (acceptsStream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (type: 'progress' | 'complete' | 'error', data: any) => {
      res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
    };

    try {
      const kit = await runPrepKitPipeline(
        {
          id: `case-${Date.now()}`,
          jd,
          company_url,
          days: requestedDays,
          user_seniority: userSeniority
        },
        (step, totalSteps, phase, message) => {
          sendEvent('progress', { step, totalSteps, phase, message });
        }
      );

      // Persist to parent MongoDB document + all dedicated tab collections + user kits array
      let savedId = 'kit-' + Date.now();
      try {
        const doc = await PrepKit.create({ ...kit, userId });
        savedId = doc._id.toString();
        await persistKitToModularCollections(kit, savedId, userId);
        await pushKitToUserArray(userId, { ...kit, id: savedId });
      } catch (dbErr) {
        console.warn('MongoDB save warning:', dbErr);
      }

      sendEvent('complete', { ...kit, id: savedId });
      res.end();
    } catch (err: any) {
      sendEvent('error', { message: err.message || 'Generation failed' });
      res.end();
    }
  } else {
    // Direct JSON response
    try {
      const kit = await runPrepKitPipeline({
        id: `case-${Date.now()}`,
        jd,
        company_url,
        days: requestedDays,
        user_seniority: userSeniority
      });

      let savedId = 'kit-' + Date.now();
      try {
        const doc = await PrepKit.create({ ...kit, userId });
        savedId = doc._id.toString();
        await persistKitToModularCollections(kit, savedId, userId);
        await pushKitToUserArray(userId, { ...kit, id: savedId });
      } catch (dbErr) {
        console.warn('MongoDB save warning:', dbErr);
      }

      res.status(201).json({ ...kit, id: savedId });
    } catch (err: any) {
      res.status(500).json({
        message: err.message || 'Generation failed',
        code: err.code || 'GENERATION_ERROR'
      });
    }
  }
});

// Get all kits for current user (reads directly from user.kits array)
kitRoutes.get('/', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const userId = (req as any).user?.id;
    if (userId && userId !== 'anonymous' && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user && Array.isArray(user.kits) && user.kits.length > 0) {
        return res.json([...user.kits].reverse().map(sanitizeKitPayload));
      }
    }
    const query = userId && userId !== 'anonymous' ? { userId } : {};
    const kits = await PrepKit.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(kits.map(sanitizeKitPayload));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get single kit assembled from dedicated tab models or user's kits array
kitRoutes.get('/:id', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const kitId = req.params.id;
    const userId = (req as any).user?.id;

    let fullKit = await assembleKitFromModularCollections(kitId);

    // If not assembled from modular collections, check user's kits array
    if (!fullKit && userId && userId !== 'anonymous' && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user && Array.isArray(user.kits)) {
        const found = user.kits.find((k: any) => k.id === kitId);
        if (found) fullKit = sanitizeKitPayload(found);
      }
    }

    if (!fullKit) {
      return res.status(404).json({ message: 'Kit not found' });
    }
    res.json(fullKit);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update full kit (Kit Builder sync)
kitRoutes.put('/:id', async (req: Request, res: Response) => {
  try {
    const kitId = req.params.id;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      updated = await PrepKit.findByIdAndUpdate(kitId, updateData, { new: true, upsert: true });
    } else {
      updated = await PrepKit.findOneAndUpdate({ id: kitId }, updateData, { new: true, upsert: true });
    }

    let userId = (req as any).user?.id || updated?.userId;
    // Also sync to modular collections
    await persistKitToModularCollections(updateData, kitId, userId);

    // Also sync to user's kits array under first-created user ID
    if (userId) {
      await updateKitInUserArray(userId, kitId, (k) => Object.assign(k, updateData));
    }

    const fullKit = await assembleKitFromModularCollections(kitId, updated);
    res.json(fullKit || sanitizeKitPayload(updated));
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Tab 1: Brief Update (dedicated persistence)
kitRoutes.put('/:id/brief', async (req: Request, res: Response) => {
  try {
    const kitId = req.params.id;
    const { summary, what_they_do } = req.body;

    const briefDoc = await Brief.findOneAndUpdate(
      { kitId },
      { summary, what_they_do, isEdited: true },
      { new: true, upsert: true }
    );

    let userId = (req as any).user?.id;
    // Sync parent document
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      const parent = await PrepKit.findByIdAndUpdate(kitId, {
        'company_brief.summary': summary,
        'company_brief.what_they_do': what_they_do,
        'company_brief.isEdited': true
      }, { new: true });
      if (!userId && parent?.userId) userId = parent.userId;
    }

    // Sync user.kits array under original user ID
    if (userId) {
      await updateKitInUserArray(userId, kitId, (k) => {
        k.company_brief = k.company_brief || {};
        k.company_brief.summary = summary;
        k.company_brief.what_they_do = what_they_do;
        k.company_brief.isEdited = true;
      });
    }

    res.json({ success: true, company_brief: briefDoc });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Tab 3: Question Bank CRUD (dedicated persistence per question)
kitRoutes.post('/:id/questions', async (req: Request, res: Response) => {
  try {
    const kitId = req.params.id;
    const questionData = req.body;
    const qId = questionData.id || `q-custom-${Date.now()}`;

    const newQuestion = await Question.create({
      kitId,
      id: qId,
      requirement_ids: questionData.requirement_ids || [],
      category: questionData.category || 'technical',
      prompt: questionData.prompt,
      answer_outline: questionData.answer_outline,
      difficulty: questionData.difficulty || 2,
      origin: questionData.origin || 'manual',
      isPinned: questionData.isPinned || false,
      order: questionData.order || 999
    });

    let userId = (req as any).user?.id;
    // Sync parent
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      const parent = await PrepKit.findByIdAndUpdate(kitId, {
        $push: { questions: newQuestion.toObject() }
      }, { new: true });
      if (!userId && parent?.userId) userId = parent.userId;
    }

    // Sync user.kits array under original user ID
    if (userId) {
      await updateKitInUserArray(userId, kitId, (k) => {
        k.questions = k.questions || [];
        k.questions.push(newQuestion.toObject ? newQuestion.toObject() : newQuestion);
      });
    }

    res.status(201).json(newQuestion);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

kitRoutes.put('/:id/questions/:questionId', async (req: Request, res: Response) => {
  try {
    const { id: kitId, questionId } = req.params;
    const updates = { ...req.body };
    delete updates._id;
    delete updates.kitId;

    const updated = await Question.findOneAndUpdate(
      { kitId, id: questionId },
      { ...updates, origin: updates.origin || 'edited' },
      { new: true, upsert: true }
    );

    let userId = (req as any).user?.id;
    // Sync parent
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      const parent = await PrepKit.findById(kitId);
      if (parent) {
        parent.questions = parent.questions.map((q: any) =>
          q.id === questionId ? { ...q.toObject(), ...updates, origin: 'edited' } : q
        );
        await parent.save();
        if (!userId && parent.userId) userId = parent.userId;
      }
    }

    // Sync user.kits array under original user ID
    if (userId) {
      await updateKitInUserArray(userId, kitId, (k) => {
        if (Array.isArray(k.questions)) {
          k.questions = k.questions.map((q: any) =>
            q.id === questionId ? { ...q, ...updates, origin: 'edited' } : q
          );
        }
      });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

kitRoutes.delete('/:id/questions/:questionId', async (req: Request, res: Response) => {
  try {
    const { id: kitId, questionId } = req.params;
    await Question.findOneAndDelete({ kitId, id: questionId });

    let userId = (req as any).user?.id;
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      const parent = await PrepKit.findByIdAndUpdate(kitId, {
        $pull: { questions: { id: questionId } }
      }, { new: true });
      if (!userId && parent?.userId) userId = parent.userId;
    }

    // Sync user.kits array under original user ID
    if (userId) {
      await updateKitInUserArray(userId, kitId, (k) => {
        if (Array.isArray(k.questions)) {
          k.questions = k.questions.filter((q: any) => q.id !== questionId);
        }
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Tab 4: Schedule Update & Day Completion (dedicated persistence)
kitRoutes.put('/:id/schedule', async (req: Request, res: Response) => {
  try {
    const kitId = req.params.id;
    const { days, days_available } = req.body;

    const updatedSchedule = await Schedule.findOneAndUpdate(
      { kitId },
      { days, days_available },
      { new: true, upsert: true }
    );

    let userId = (req as any).user?.id;
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      const parent = await PrepKit.findByIdAndUpdate(kitId, {
        'schedule.days': days,
        'schedule.days_available': days_available
      }, { new: true });
      if (!userId && parent?.userId) userId = parent.userId;
    }

    // Sync user.kits array under original user ID
    if (userId) {
      await updateKitInUserArray(userId, kitId, (k) => {
        k.schedule = { ...k.schedule, days, days_available };
      });
    }

    res.json({ success: true, schedule: updatedSchedule });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Tab 5: Flashcard Practice Progress Save (persists user answers, confidence, timestamps to Flashcard collection)
kitRoutes.post('/:id/practice-progress', async (req: Request, res: Response) => {
  try {
    const kitId = req.params.id;
    const { flashcards } = req.body;
    if (!flashcards || !Array.isArray(flashcards)) {
      return res.status(400).json({ message: 'Flashcards array is required' });
    }

    // Persist individually in Flashcard collection
    for (const f of flashcards) {
      await Flashcard.findOneAndUpdate(
        { kitId, id: f.id },
        {
          confidence: f.confidence || 'unreviewed',
          userAnswer: f.userAnswer || '',
          lastPracticedAt: f.lastPracticedAt || new Date().toISOString()
        },
        { upsert: true }
      );
    }

    // Sync parent document
    let kit = null;
    let userId = (req as any).user?.id;
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      kit = await PrepKit.findById(kitId);
    }
    if (!kit) {
      kit = await PrepKit.findOne({ id: kitId });
    }
    if (kit) {
      kit.flashcards = flashcards;
      await kit.save();
      if (!userId && kit.userId) userId = kit.userId;
    }

    // Sync user.kits array under original user ID
    if (userId) {
      await updateKitInUserArray(userId, kitId, (k) => {
        k.flashcards = flashcards;
      });
    }

    res.json({ success: true, flashcards });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Add custom flashcard
kitRoutes.post('/:id/flashcards', async (req: Request, res: Response) => {
  try {
    const kitId = req.params.id;
    const cardData = req.body;
    const cardId = cardData.id || `f-custom-${Date.now()}`;

    const newCard = await Flashcard.create({
      kitId,
      id: cardId,
      front: cardData.front,
      back: cardData.back,
      requirement_ids: cardData.requirement_ids || [],
      confidence: 'unreviewed',
      origin: 'manual'
    });

    let userId = (req as any).user?.id;
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      const parent = await PrepKit.findByIdAndUpdate(kitId, {
        $push: { flashcards: newCard.toObject() }
      }, { new: true });
      if (!userId && parent?.userId) userId = parent.userId;
    }

    // Sync user.kits array under original user ID
    if (userId) {
      await updateKitInUserArray(userId, kitId, (k) => {
        k.flashcards = k.flashcards || [];
        k.flashcards.push(newCard.toObject ? newCard.toObject() : newCard);
      });
    }

    res.status(201).json(newCard);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Delete flashcard
kitRoutes.delete('/:id/flashcards/:cardId', async (req: Request, res: Response) => {
  try {
    const { id: kitId, cardId } = req.params;
    await Flashcard.findOneAndDelete({ kitId, id: cardId });

    let userId = (req as any).user?.id;
    if (mongoose.Types.ObjectId.isValid(kitId)) {
      const parent = await PrepKit.findByIdAndUpdate(kitId, {
        $pull: { flashcards: { id: cardId } }
      }, { new: true });
      if (!userId && parent?.userId) userId = parent.userId;
    }

    // Sync user.kits array under original user ID
    if (userId) {
      await updateKitInUserArray(userId, kitId, (k) => {
        if (Array.isArray(k.flashcards)) {
          k.flashcards = k.flashcards.filter((f: any) => f.id !== cardId);
        }
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Delete kit and clean up all associated tab collection documents + user.kits array completely
kitRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const kitId = req.params.id;
    let userId = (req as any).user?.id;

    const idQuery = mongoose.Types.ObjectId.isValid(kitId)
      ? { $or: [{ _id: kitId }, { id: kitId }] }
      : { id: kitId };

    if (!userId) {
      const parent = await PrepKit.findOne(idQuery).select('userId');
      if (parent?.userId) userId = parent.userId;
    }

    const pullCondition = mongoose.Types.ObjectId.isValid(kitId)
      ? { $or: [{ id: kitId }, { _id: kitId }] }
      : { id: kitId };

    await Promise.all([
      PrepKit.deleteMany(idQuery),
      Brief.deleteMany({ kitId }),
      Role.deleteMany({ kitId }),
      Question.deleteMany({ kitId }),
      Schedule.deleteMany({ kitId }),
      Flashcard.deleteMany({ kitId }),
      MockSession.deleteMany({ kitId }),
      User.updateMany(
        {},
        { $pull: { kits: pullCondition as any } }
      )
    ]);

    if (userId) {
      await removeKitFromUserArray(userId, kitId);
    }

    res.json({ success: true, kitId });
  } catch (err: any) {
    console.error('[KitRoutes] Error deleting kit and clearing all caches:', err);
    res.status(500).json({ message: err.message });
  }
});

// Helper for AI-generated question answer outline
async function handleGenerateAnswerOutline(
  prompt: string,
  category?: string,
  role?: string,
  company?: string,
  requirements?: any[],
  difficulty?: number
) {
  const systemPrompt = `You are an elite Principal Technical Interviewer and Senior Engineering Leader.
A candidate or interviewer has provided an interview question for an interview preparation kit.
Your task is to dynamically generate an authoritative, high-signal, punchy model answer and evaluation rubric.

CRITICAL FORMATTING RULES:
1. The "answer_outline" MUST be written strictly as a focused, cohesive 5-sentence paragraph (approximately 5 lines of high-density text).
2. Do NOT use bullet points, headers, multi-paragraph essays, or greeting fluff. Output exactly one continuous, well-structured paragraph of approximately 5 sentences covering:
   - Sentence 1: Direct, authoritative answer and core architectural/technical definition.
   - Sentence 2: Primary technical mechanism, algorithm, lifecycle, or pattern used in production.
   - Sentence 3: Key engineering trade-offs, concurrency/data consistency, or edge cases to consider.
   - Sentence 4: Critical failure modes, anti-patterns, and pitfalls candidates must avoid.
   - Sentence 5: Benchmark evaluation criteria demonstrating senior/lead-level mastery.
3. Ground the explanation in real-world production engineering for the specified role and category.
4. Absolutely ZERO hardcoded boilerplate or generic placeholders. Provide deep, authentic domain knowledge.

Respond strictly with valid JSON:
{
  "answer_outline": "A concise, 5-sentence technical paragraph directly answering the question with key mechanisms, trade-offs, edge cases, and evaluation benchmarks.",
  "benchmarks": ["Key Concept", "Primary Mechanism", "Trade-Off & Resilience"],
  "suggested_difficulty": 1 | 2 | 3
}`;

  const reqsText = Array.isArray(requirements) && requirements.length > 0
    ? requirements.map((r: any) => `- ${typeof r === 'string' ? r : (r.text || r.id)}`).join('\n')
    : 'None specified';

  const userPrompt = `Interview Question Prompt:
"${prompt.trim()}"

Category: ${category || 'technical'}
Target Role: ${role || 'Target Role'}
Target Company: ${company || 'Target Company'}
Mapped Role Requirements:
${reqsText}
Difficulty Level: ${difficulty || 2}

Generate the concise 5-sentence technical answer paragraph now.`;

  const result = await llm.completeJson<{
    answer_outline: string;
    benchmarks?: string[];
    suggested_difficulty?: number;
  }>(userPrompt, {
    systemPrompt,
    temperature: 0.25,
    timeout: 60000
  });

  return {
    answer_outline: result.answer_outline,
    benchmarks: result.benchmarks || [],
    suggested_difficulty: result.suggested_difficulty || difficulty || 2
  };
}

// POST /api/kits/generate-answer-outline
kitRoutes.post('/generate-answer-outline', async (req: Request, res: Response) => {
  try {
    const { prompt, category, role, company, requirements, difficulty } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'Question prompt is required.' });
    }

    const result = await handleGenerateAnswerOutline(prompt, category, role, company, requirements, difficulty);
    return res.json(result);
  } catch (err: any) {
    console.error('[KitRoutes] Failed to generate answer outline:', err?.message || err);
    return res.status(503).json({
      message: err?.message || 'AI generation failed. Please try again.',
      code: 'AI_UNAVAILABLE'
    });
  }
});

// POST /api/kits/:id/generate-answer-outline (with kit context fallback)
kitRoutes.post('/:id/generate-answer-outline', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { prompt, category, difficulty } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'Question prompt is required.' });
    }

    let role = req.body.role;
    let company = req.body.company;
    let requirements = req.body.requirements;

    if (!role || !company || !requirements) {
      try {
        const kit = await PrepKit.findById(id);
        if (kit) {
          if (!role) role = kit.role?.title;
          if (!company) company = kit.source?.company;
          if (!requirements) requirements = kit.role?.requirements;
        }
      } catch {}
    }

    const result = await handleGenerateAnswerOutline(prompt, category, role, company, requirements, difficulty);
    return res.json(result);
  } catch (err: any) {
    console.error('[KitRoutes] Failed to generate answer outline:', err?.message || err);
    return res.status(503).json({
      message: err?.message || 'AI generation failed. Please try again.',
      code: 'AI_UNAVAILABLE'
    });
  }
});

// Single-Section Regeneration (Section 6)
kitRoutes.post('/:id/regenerate-section', async (req: Request, res: Response) => {
  try {
    const { section, category, existingManualQuestions } = req.body;
    const kit = await PrepKit.findById(req.params.id);

    if (!kit) {
      return res.status(404).json({ message: 'Kit not found' });
    }

    if (section === 'company_brief') {
      const research = await researchCompany(kit.source.company_url);
      const newBrief = await generateCompanyBrief(research);
      kit.company_brief = {
        summary: newBrief.summary,
        what_they_do: newBrief.what_they_do,
        sources: newBrief.sources,
        isEdited: false
      };
      await kit.save();

      // Update dedicated Brief collection
      await Brief.findOneAndUpdate(
        { kitId: req.params.id },
        {
          kitId: req.params.id,
          summary: newBrief.summary,
          what_they_do: newBrief.what_they_do,
          sources: newBrief.sources,
          isEdited: false
        },
        { upsert: true }
      );

      const assembled = await assembleKitFromModularCollections(req.params.id, kit);
      return res.json(assembled || sanitizeKitPayload(kit));
    }

    let userSeniority = (req as any).user?.seniority || kit.role?.seniority || 'Junior';
    if ((!userSeniority || userSeniority === 'Not Specified' || userSeniority === '') && kit.userId) {
      try {
        const userDoc = await User.findById(kit.userId);
        if (userDoc?.seniority) userSeniority = userDoc.seniority;
      } catch {}
    }

    if (section === 'category' && category) {
      const research = await researchCompany(kit.source.company_url);
      const generated = await generateCategorizedQuestions(kit.role, research, kit.questions.length + 1, kit.schedule?.days_available || 5, userSeniority);
      const newCategoryQuestions = generated.filter((q) => q.category === category);

      // Preserve existing manual, edited, or pinned questions!
      const preserved = (existingManualQuestions || []).filter((q: any) => q.category === category);
      const otherCategories = kit.questions.filter((q: any) => q.category !== category);

      kit.questions = [...otherCategories, ...preserved, ...newCategoryQuestions];
      await kit.save();

      // Update dedicated Question collection
      await Question.deleteMany({ kitId: req.params.id, category, isPinned: false, origin: 'generated' });
      for (let i = 0; i < newCategoryQuestions.length; i++) {
        const q = newCategoryQuestions[i];
        await Question.findOneAndUpdate(
          { kitId: req.params.id, id: q.id },
          {
            kitId: req.params.id,
            id: q.id,
            requirement_ids: q.requirement_ids || [],
            category: q.category,
            prompt: q.prompt,
            answer_outline: q.answer_outline,
            difficulty: q.difficulty,
            origin: 'generated',
            isPinned: false,
            order: i
          },
          { upsert: true }
        );
      }

      const assembled = await assembleKitFromModularCollections(req.params.id, kit);
      return res.json(assembled || sanitizeKitPayload(kit));
    }

    if (section === 'schedule') {
      kit.schedule = allocateSchedule(kit.questions, kit.role.requirements, kit.schedule.days_available);
      await kit.save();

      await Schedule.findOneAndUpdate(
        { kitId: req.params.id },
        {
          kitId: req.params.id,
          days_available: kit.schedule.days_available,
          days: kit.schedule.days
        },
        { upsert: true }
      );

      const assembled = await assembleKitFromModularCollections(req.params.id, kit);
      return res.json(assembled || sanitizeKitPayload(kit));
    }

    if (section === 'all_questions') {
      const research = await researchCompany(kit.source.company_url);

      // If role requirements are too few (< 3), extract richer requirements from JD or title
      if (!kit.role.requirements || kit.role.requirements.length < 3) {
        const jdSeed = `${kit.role.title}\n${kit.source.company}\n${(kit.role.requirements || []).map((r: any) => r.text).join('\n')}`;
        try {
          const reExtracted = await extractRequirements(jdSeed, research.companyName);
          if (reExtracted.requirements && reExtracted.requirements.length >= 3) {
            kit.role.requirements = reExtracted.requirements;
            if (reExtracted.responsibilities && reExtracted.responsibilities.length > 0) {
              kit.role.responsibilities = reExtracted.responsibilities;
            }
          }
        } catch {}
      }

      kit.role.title = sanitizeRoleText(kit.role.title, 'Role');
      kit.source.role = kit.role.title;

      const generated = await generateCategorizedQuestions(kit.role, research, 1, kit.schedule?.days_available || 5, userSeniority);
      const coverageLoop = await executeCoverageLoop(
        kit.role.requirements,
        generated,
        research.companyName,
        kit.role.title,
        2,
        userSeniority
      );

      // Preserve existing manual or pinned questions if present
      const manualOrPinned = (existingManualQuestions || kit.questions || []).filter(
        (q: any) => q.origin === 'manual' || q.origin === 'edited' || q.isPinned
      );

      kit.questions = [...manualOrPinned, ...coverageLoop.questions];
      kit.coverage = coverageLoop.coverage;
      kit.schedule = allocateSchedule(kit.questions, kit.role.requirements, kit.schedule.days_available);
      await kit.save();

      // Sync to Question and Schedule collections
      await Question.deleteMany({ kitId: req.params.id, isPinned: false, origin: 'generated' });
      for (let i = 0; i < coverageLoop.questions.length; i++) {
        const q = coverageLoop.questions[i];
        await Question.findOneAndUpdate(
          { kitId: req.params.id, id: q.id },
          {
            kitId: req.params.id,
            id: q.id,
            requirement_ids: q.requirement_ids || [],
            category: q.category,
            prompt: q.prompt,
            answer_outline: q.answer_outline,
            difficulty: q.difficulty,
            origin: 'generated',
            isPinned: false,
            order: i
          },
          { upsert: true }
        );
      }

      await Schedule.findOneAndUpdate(
        { kitId: req.params.id },
        {
          kitId: req.params.id,
          days_available: kit.schedule.days_available,
          days: kit.schedule.days
        },
        { upsert: true }
      );

      const assembled = await assembleKitFromModularCollections(req.params.id, kit);
      return res.json(assembled || sanitizeKitPayload(kit));
    }

    if (section === 'full_kit') {
      const research = await researchCompany(kit.source.company_url);
      const newBrief = await generateCompanyBrief(research);
      kit.company_brief = {
        summary: newBrief.summary,
        what_they_do: newBrief.what_they_do,
        sources: newBrief.sources,
        isEdited: false
      };

      if (!kit.role.requirements || kit.role.requirements.length < 3) {
        const jdSeed = `${kit.role.title}\n${kit.source.company}\n${(kit.role.requirements || []).map((r: any) => r.text).join('\n')}`;
        try {
          const reExtracted = await extractRequirements(jdSeed, research.companyName);
          if (reExtracted.requirements && reExtracted.requirements.length >= 3) {
            kit.role.requirements = reExtracted.requirements;
            if (reExtracted.responsibilities && reExtracted.responsibilities.length > 0) {
              kit.role.responsibilities = reExtracted.responsibilities;
            }
          }
        } catch {}
      }

      kit.role.title = sanitizeRoleText(kit.role.title, 'Role');
      kit.source.role = kit.role.title;

      const generated = await generateCategorizedQuestions(kit.role, research, 1, kit.schedule?.days_available || 5, userSeniority);
      const coverageLoop = await executeCoverageLoop(
        kit.role.requirements,
        generated,
        research.companyName,
        kit.role.title,
        2,
        userSeniority
      );

      const newFlashcards = await generateFlashcards(kit.role, research.companyName);

      kit.questions = coverageLoop.questions;
      kit.flashcards = newFlashcards;
      kit.coverage = coverageLoop.coverage;
      kit.schedule = allocateSchedule(kit.questions, kit.role.requirements, kit.schedule.days_available);
      await kit.save();

      // Persist across all modular tab collections
      await persistKitToModularCollections(kit, req.params.id, kit.userId);

      const assembled = await assembleKitFromModularCollections(req.params.id, kit);
      return res.json(assembled || sanitizeKitPayload(kit));
    }

    res.status(400).json({ message: 'Invalid section specified' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export const kitsRouter = kitRoutes;
export default kitRoutes;
