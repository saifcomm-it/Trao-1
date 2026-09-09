import { 
  InterviewPrepKit, 
  UIInterviewPrepKit, 
  QuestionCategory, 
  GenerationProgress,
  UIQuestion
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('trao_auth_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('trao_auth_token', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('trao_auth_token');
    localStorage.removeItem('trao_user');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText };
      }
      throw new ApiError(errorData.message || 'API request failed', res.status, errorData);
    }

    return await res.json();
  } catch (err: any) {
    // If backend is unreachable or not yet running, check if mock mode or provide helpful error
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new ApiError('Cannot connect to backend server at ' + API_BASE, 503);
    }
    throw err;
  }
}

export const api = {
  // Auth
  async register(email: string, name: string): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name })
    });
  },

  async login(email: string): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async getMe(): Promise<{ user: { id: string; email: string; name: string } }> {
    return request('/auth/me');
  },

  // Kits
  async getKits(): Promise<InterviewPrepKit[]> {
    return request('/kits');
  },

  async getKit(id: string): Promise<UIInterviewPrepKit> {
    return request(`/kits/${id}`);
  },

  async saveKit(kit: UIInterviewPrepKit): Promise<UIInterviewPrepKit> {
    return request(`/kits/${kit.id || 'new'}`, {
      method: 'PUT',
      body: JSON.stringify(kit)
    });
  },

  async deleteKit(id: string): Promise<{ success: boolean }> {
    return request(`/kits/${id}`, {
      method: 'DELETE'
    });
  },

  // Single Section Regeneration (Section 6)
  async regenerateSection(
    kitId: string, 
    section: 'company_brief' | 'schedule' | 'category', 
    category?: QuestionCategory,
    existingManualQuestions?: UIQuestion[]
  ): Promise<UIInterviewPrepKit> {
    return request(`/kits/${kitId}/regenerate-section`, {
      method: 'POST',
      body: JSON.stringify({
        section,
        category,
        existingManualQuestions
      })
    });
  },

  // Generation Stream (SSE or polling progress)
  generateKit(
    params: { jd: string; company_url: string; days: number },
    onProgress: (progress: GenerationProgress) => void
  ): Promise<UIInterviewPrepKit> {
    return new Promise(async (resolve, reject) => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE}/kits/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: 'Generation failed' }));
          return reject(new Error(err.message || 'Generation failed'));
        }

        // If response is a readable stream of SSE / NDJSON progress events
        if (response.headers.get('content-type')?.includes('text/event-stream') || 
            response.headers.get('content-type')?.includes('application/x-ndjson')) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          if (!reader) throw new Error('Stream response body unavailable');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line.replace(/^data:\s*/, ''));
                if (parsed.type === 'progress') {
                  onProgress(parsed.data);
                } else if (parsed.type === 'complete') {
                  resolve(parsed.data);
                  return;
                } else if (parsed.type === 'error') {
                  reject(new Error(parsed.message));
                  return;
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        } else {
          // Direct JSON response
          const result = await response.json();
          resolve(result);
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  // Creative Feature: AI Mock Answer Evaluator
  async evaluateAnswer(params: {
    questionPrompt: string;
    answerOutline: string;
    userAnswer: string;
  }): Promise<{
    score: number; // 0-100
    strengths: string[];
    gaps: string[];
    feedback: string;
  }> {
    return request('/mock/evaluate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
};
