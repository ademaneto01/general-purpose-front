import type { User } from '../types';

const KEYS = {
  user: 'chat.user',
  threadId: 'chat.threadId',
  contextSentThreads: 'chat.contextSentThreads',
} as const;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const storage = {
  getUser(): User | null {
    return safeParse<User>(localStorage.getItem(KEYS.user));
  },
  setUser(user: User): void {
    localStorage.setItem(KEYS.user, JSON.stringify(user));
  },
  getThreadId(): string | null {
    return localStorage.getItem(KEYS.threadId);
  },
  setThreadId(threadId: string): void {
    localStorage.setItem(KEYS.threadId, threadId);
  },
  getContextSentThreads(): string[] {
    return safeParse<string[]>(localStorage.getItem(KEYS.contextSentThreads)) ?? [];
  },
  markContextSent(threadId: string): void {
    const current = storage.getContextSentThreads();
    if (!current.includes(threadId)) {
      current.push(threadId);
      localStorage.setItem(KEYS.contextSentThreads, JSON.stringify(current));
    }
  },
  hasContextBeenSent(threadId: string): boolean {
    return storage.getContextSentThreads().includes(threadId);
  },
  clear(): void {
    localStorage.removeItem(KEYS.user);
    localStorage.removeItem(KEYS.threadId);
    localStorage.removeItem(KEYS.contextSentThreads);
  },
};
