import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { storage } from '../utils/storage';
import { newThreadId } from '../utils/userContext';

type UserContextValue = {
  user: User | null;
  threadId: string | null;
  hydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  newConversation: () => string;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedUser = storage.getUser();
    const storedThread = storage.getThreadId();
    if (storedUser) setUser(storedUser);
    if (storedThread) setThreadId(storedThread);
    setHydrated(true);
  }, []);

  const login = useCallback((nextUser: User) => {
    const tid = newThreadId();
    storage.setUser(nextUser);
    storage.setThreadId(tid);
    setUser(nextUser);
    setThreadId(tid);
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setUser(null);
    setThreadId(null);
  }, []);

  const newConversation = useCallback(() => {
    const tid = newThreadId();
    storage.setThreadId(tid);
    setThreadId(tid);
    return tid;
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({ user, threadId, hydrated, login, logout, newConversation }),
    [user, threadId, hydrated, login, logout, newConversation],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within <UserProvider>');
  }
  return ctx;
}
