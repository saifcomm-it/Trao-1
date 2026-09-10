import { api } from '@/lib/api';
import {
  UIInterviewPrepKit,
  UIQuestion,
  QuestionCategory,
  InterviewPrepKit
} from '@/lib/types';

export class KitBuilderService {
  private static LOCAL_STORAGE_KEY = 'trao_saved_kits';

  public static async fetchKit(id: string): Promise<UIInterviewPrepKit | null> {
    try {
      const serverKit = await api.getKit(id);
      if (serverKit) {
        if (typeof window !== 'undefined') {
          try {
            const savedStr = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            let list: UIInterviewPrepKit[] = savedStr ? JSON.parse(savedStr) : [];
            list = list.filter((k) => k.id !== serverKit.id && (k as any)._id !== serverKit.id);
            list.unshift(serverKit);
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(list));
          } catch {}
        }
        return serverKit;
      }
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404 || err?.message?.toLowerCase().includes('not found')) {
        this.removeKitFromCache(id);
        return null;
      }
    }

    if (typeof window !== 'undefined') {
      const savedStr = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (savedStr) {
        try {
          const list: UIInterviewPrepKit[] = JSON.parse(savedStr);
          const found = list.find((k) => k.id === id || (k as any)._id === id);
          if (found) return found;
        } catch {
          return null;
        }
      }
    }

    return null;
  }

  public static removeKitFromCache(id: string): void {
    if (typeof window !== 'undefined') {
      try {
        const savedStr = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (savedStr) {
          const list: UIInterviewPrepKit[] = JSON.parse(savedStr);
          const filtered = list.filter((k) => k.id !== id && (k as any)._id !== id);
          localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(filtered));
        }
        const lastId = localStorage.getItem('trao_last_kit_id');
        if (lastId === id) {
          localStorage.removeItem('trao_last_kit_id');
        }
      } catch {}
    }
  }

  public static async persistKit(updatedKit: UIInterviewPrepKit): Promise<void> {
    if (typeof window !== 'undefined') {
      const savedStr = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      let list: UIInterviewPrepKit[] = savedStr ? JSON.parse(savedStr) : [];
      list = list.filter((k) => k.id !== updatedKit.id);
      list.unshift(updatedKit);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(list));
    }


    try {
      await api.saveKit(updatedKit);
    } catch (err) {
      console.warn('[KitBuilderService] Database persist warning:', err);
    }
  }

  public static async regenerateCompanyBrief(kit: UIInterviewPrepKit): Promise<UIInterviewPrepKit> {
    const res = await api.regenerateSection(kit.id || '', 'company_brief');
    if (res?.company_brief) {
      const updated = { ...kit, company_brief: res.company_brief };
      this.persistKit(updated);
      return updated;
    }
    return kit;
  }

  public static async regenerateCategory(
    kit: UIInterviewPrepKit,
    category: QuestionCategory
  ): Promise<UIInterviewPrepKit> {
    const manualAndPinned = kit.questions.filter(
      (q) => q.category === category && (q.origin === 'manual' || q.origin === 'edited' || q.isPinned)
    );

    const res = await api.regenerateSection(kit.id || '', 'category', category, manualAndPinned);
    if (res?.questions) {
      const regeneratedNew = res.questions.filter((q) => q.category === category && !q.isPinned);
      const untouchedOther = kit.questions.filter((q) => q.category !== category);

      const updated = {
        ...kit,
        questions: [...untouchedOther, ...manualAndPinned, ...regeneratedNew]
      };
      this.persistKit(updated);
      return updated;
    }
    return kit;
  }

  public static async regenerateAllQuestions(kit: UIInterviewPrepKit): Promise<UIInterviewPrepKit> {
    const manualAndPinned = kit.questions.filter(
      (q) => q.origin === 'manual' || q.origin === 'edited' || q.isPinned
    );
    const res = await api.regenerateSection(kit.id || '', 'all_questions', undefined, manualAndPinned);
    if (res?.questions) {
      this.persistKit(res);
      return res;
    }
    return kit;
  }

  public static async regenerateFullKit(kit: UIInterviewPrepKit): Promise<UIInterviewPrepKit> {
    const res = await api.regenerateSection(kit.id || '', 'full_kit');
    if (res) {
      this.persistKit(res);
      return res;
    }
    return kit;
  }

  public static async recalculateSchedule(kit: UIInterviewPrepKit): Promise<UIInterviewPrepKit> {
    const res = await api.regenerateSection(kit.id || '', 'schedule');
    if (res?.schedule) {
      const updated = { ...kit, schedule: res.schedule };
      this.persistKit(updated);
      return updated;
    }
    return kit;
  }

  public static exportAppendixAJson(kit: UIInterviewPrepKit): void {
    const cleanKit: InterviewPrepKit = {
      source: kit.source,
      company_brief: {
        summary: kit.company_brief.summary,
        what_they_do: kit.company_brief.what_they_do,
        sources: kit.company_brief.sources
      },
      role: kit.role,
      questions: kit.questions.map((q) => ({
        id: q.id,
        requirement_ids: q.requirement_ids,
        category: q.category,
        prompt: q.prompt,
        answer_outline: q.answer_outline,
        difficulty: q.difficulty
      })),
      flashcards: kit.flashcards.map((f) => ({
        id: f.id,
        front: f.front,
        back: f.back,
        requirement_ids: f.requirement_ids
      })),
      schedule: kit.schedule,
      coverage: kit.coverage
    };

    const blob = new Blob([JSON.stringify(cleanKit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileCompany = (kit.source?.company || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'company';
    const fileRole = (kit.role?.title || 'role').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'role';
    a.download = `${fileCompany}-${fileRole}-prep-kit.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public static async evaluateMockAnswer(params: {
    questionPrompt: string;
    answerOutline: string;
    userAnswer: string;
    questionId?: string;
  }) {
    return api.evaluateAnswer(params);
  }

  public static async fetchMockHistory(questionId: string) {
    return api.getMockQuestionHistory(questionId);
  }
}
