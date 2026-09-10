import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queries';
import { purgeKitFromTanStackQuery } from './query-client';


export function purgeKitFromAllCaches(kitId: string, queryClient?: QueryClient) {
  if (!kitId) return;


  if (typeof window !== 'undefined') {
    try {
      const savedStr = localStorage.getItem('trao_saved_kits');
      if (savedStr) {
        try {
          const list = JSON.parse(savedStr);
          if (Array.isArray(list)) {
            const filtered = list.filter((k: any) => {
              const id = k.id || k._id;
              return id !== kitId;
            });
            localStorage.setItem('trao_saved_kits', JSON.stringify(filtered));
          }
        } catch {}
      }


      const lastId = localStorage.getItem('trao_last_kit_id');
      if (lastId === kitId) {
        localStorage.removeItem('trao_last_kit_id');
      }


      const userStr = localStorage.getItem('trao_user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj && Array.isArray(userObj.kits)) {
            userObj.kits = userObj.kits.filter((k: any) => {
              const id = k.id || k._id;
              return id !== kitId;
            });
            localStorage.setItem('trao_user', JSON.stringify(userObj));
          }
        } catch {}
      }


      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes(kitId) || key.startsWith(`kit_${kitId}`) || key.startsWith(`mock_${kitId}`))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Clean sessionStorage as well
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes(kitId) || key.startsWith(`kit_${kitId}`))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach((k) => sessionStorage.removeItem(k));

      // Dispatch global deletion event
      window.dispatchEvent(new CustomEvent('trao_kit_deleted', { detail: kitId }));
    } catch (err) {
      console.warn('[CacheCleanup] Local storage purge warning:', err);
    }
  }

  // 2. Purge TanStack Query in-memory cache completely
  purgeKitFromTanStackQuery(kitId, queryClient);
}
