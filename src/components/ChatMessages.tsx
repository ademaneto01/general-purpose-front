import { useAutoScroll } from '../hooks/useAutoScroll';
import type { UIMessage } from '../types';
import { MessageBubble } from './MessageBubble';
import { StatusIndicator } from './StatusIndicator';

type Props = {
  messages: UIMessage[];
  status: string | null;
  streaming: boolean;
  loadingSession: boolean;
};

export function ChatMessages({ messages, status, streaming, loadingSession }: Props) {
  const scrollKey = messages
    .map((m) => `${m.id}:${m.content.length}:${m.streaming ? 1 : 0}`)
    .join('|');
  const ref = useAutoScroll(`${scrollKey}|${status ?? ''}`);

  const visible = messages.filter((m) => !m.hidden);

  return (
    <div
      ref={ref}
      className="flex-1 overflow-y-auto"
    >
      <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
        {loadingSession ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="flex items-center gap-3 text-white/50">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <span className="text-sm">Carregando conversa...</span>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState />
        ) : (
          visible.map((m) => <MessageBubble key={m.id} message={m} />)
        )}

        <StatusIndicator status={status} visible={streaming} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/20">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white">Inicie a conversa</h2>
      <p className="max-w-sm text-sm text-white/50">
        Envie uma mensagem para começar. O contexto do seu perfil será compartilhado
        automaticamente na primeira interação.
      </p>
    </div>
  );
}
