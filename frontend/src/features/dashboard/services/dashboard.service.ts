import { api } from '@/lib/api';
import { UIInterviewPrepKit } from '@/lib/types';
import { purgeKitFromAllCaches } from '@/lib/cache-cleanup';

export class DashboardService {
  private static LOCAL_STORAGE_KEY = 'trao_saved_kits';

  public static async fetchUserKits(): Promise<UIInterviewPrepKit[]> {
    try {
      const serverKits = await api.getKits();
      if (Array.isArray(serverKits)) {
        if (typeof window !== 'undefined') {
          if (serverKits.length === 0) {
            localStorage.removeItem(this.LOCAL_STORAGE_KEY);
          } else {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(serverKits));
          }
        }
        return serverKits.map((k: any) => ({
          ...k,
          id: k.id || k._id || ''
        })) as UIInterviewPrepKit[];
      }
    } catch {
    }

    if (typeof window !== 'undefined') {
      const savedStr = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (savedStr) {
        try {
          const parsed = JSON.parse(savedStr);
          return (parsed || []).map((k: any) => ({
            ...k,
            id: k.id || k._id || ''
          }));
        } catch {
          return [];
        }
      }
    }

    return [];
  }

  public static async deleteKit(id: string, currentKits: UIInterviewPrepKit[]): Promise<UIInterviewPrepKit[]> {
    purgeKitFromAllCaches(id);

    try {
      await api.deleteKit(id);
    } catch {
    }

    const updated = currentKits.filter((k) => (k.id || k._id || '') !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  }
}
