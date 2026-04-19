import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, getSession, streamChat } from '../services/api';
import { storage } from '../utils/storage';
import { buildUserContextMessage } from '../utils/userContext';
import type { BackendMessage, UIMessage, User } from '../types';

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapBackendMessages(messages: BackendMessage[]): UIMessage[] {
  const mapped: UIMessage[] = [];
  for (const m of messages) {
    if (m.role === 'human') {
      mapped.push({ id: makeId(), role: 'user', content: m.content });
    } else if (m.role === 'ai') {
      mapped.push({ id: makeId(), role: 'assistant', content: m.content });
    }
  }
  return mapped;
}

type UseChatArgs = {
  user: User | null;
  threadId: string | null;
};

export function useChat({ user, threadId }: UseChatArgs) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const activeThreadRef = useRef<string | null>(null);

  const abortActive = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => {
    abortActive();
    setMessages([]);
    setStatus(null);
    setStreaming(false);
    setError(null);
  }, [abortActive]);

  const loadSession = useCallback(
    async (tid: string) => {
      setLoadingSession(true);
      setError(null);
      try {
        const session = await getSession(tid);
        const ui = mapBackendMessages(session.messages);
        setMessages(ui);
        if (ui.length > 0) {
          storage.markContextSent(tid);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof ApiError && err.status === 404) {
          setMessages([]);
          return;
        }
        setError(
          err instanceof Error
            ? `Não foi possível carregar a sessão: ${err.message}`
            : 'Não foi possível carregar a sessão.',
        );
      } finally {
        setLoadingSession(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }
    if (activeThreadRef.current === threadId) return;
    activeThreadRef.current = threadId;
    void loadSession(threadId);
  }, [threadId, loadSession]);

  useEffect(() => () => abortActive(), [abortActive]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !user || !threadId || streaming) return;

      setError(null);
      const userMsg: UIMessage = {
        id: makeId(),
        role: 'user',
        content: trimmed,
      };
      const assistantId = makeId();
      const assistantMsg: UIMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        streaming: true,
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);
      setStatus(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        if (!storage.hasContextBeenSent(threadId)) {
          const contextText = buildUserContextMessage(user);
          await streamChat({
            message: contextText,
            threadId,
            signal: controller.signal,
          });
          storage.markContextSent(threadId);
        }

        await streamChat({
          message: trimmed,
          threadId,
          signal: controller.signal,
          onStatus: (s) => setStatus(s),
          onToken: (t) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + t } : m,
              ),
            );
          },
        });

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, streaming: false } : m,
            ),
          );
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Erro desconhecido ao enviar mensagem.';
        setError(`Falha ao enviar mensagem: ${message}`);
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== assistantId)
            .concat({
              id: makeId(),
              role: 'error',
              content: message,
            }),
        );
      } finally {
        setStreaming(false);
        setStatus(null);
        abortRef.current = null;
      }
    },
    [user, threadId, streaming],
  );

  const cancel = useCallback(() => {
    abortActive();
  }, [abortActive]);

  return {
    messages,
    status,
    streaming,
    loadingSession,
    error,
    send,
    cancel,
    reset,
  };
}
