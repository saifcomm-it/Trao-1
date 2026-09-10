import { UIFlashcard, UIInterviewPrepKit } from '@/lib/types';
import { api } from '@/lib/api';

export class PracticeService {
  private static LOCAL_STORAGE_KEY = 'trao_saved_kits';


  public static sortFlashcardsForPractice(cards: UIFlashcard[]): UIFlashcard[] {
    const getWeight = (c: UIFlashcard): number => {
      switch (c.confidence) {
        case 'low':
          return 100;
        case 'unreviewed':
        case undefined:
          return 75;
        case 'medium':
          return 50;
        case 'high':
          return 10;
        default:
          return 50;
      }
    };

    return [...cards].sort((a, b) => {
      const weightDiff = getWeight(b) - getWeight(a);
      if (weightDiff !== 0) return weightDiff;

      const timeA = a.lastPracticedAt ? new Date(a.lastPracticedAt).getTime() : 0;
      const timeB = b.lastPracticedAt ? new Date(b.lastPracticedAt).getTime() : 0;
      return timeA - timeB;
    });
  }

  public static async fetchKitForPractice(kitId: string): Promise<UIInterviewPrepKit | null> {
    try {
      const serverKit = await api.getKit(kitId);
      if (serverKit) return serverKit;
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404 || err?.message?.toLowerCase().includes('not found')) {
        return null;
      }
    }

    if (typeof window !== 'undefined') {
      const savedStr = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (savedStr) {
        try {
          const list: UIInterviewPrepKit[] = JSON.parse(savedStr);
          return list.find((k) => k.id === kitId || (k as any)._id === kitId) || null;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  public static async saveFlashcardProgress(kit: UIInterviewPrepKit, updatedCards: UIFlashcard[]): Promise<void> {
    const updatedKit: UIInterviewPrepKit = {
      ...kit,
      flashcards: updatedCards
    };

    if (typeof window !== 'undefined') {
      const savedStr = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      let list: UIInterviewPrepKit[] = savedStr ? JSON.parse(savedStr) : [];
      list = list.filter((k) => k.id !== kit.id);
      list.unshift(updatedKit);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(list));
    }

    try {
      if (kit.id) {
        await api.savePracticeProgress(kit.id, updatedCards);
      } else {
        await api.saveKit(updatedKit);
      }
    } catch {
      api.saveKit(updatedKit).catch(() => {});
    }
  }
}
