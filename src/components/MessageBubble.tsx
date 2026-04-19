import type { UIMessage } from '../types';

type Props = { message: UIMessage };

function renderContent(content: string, streaming: boolean | undefined) {
  const lines = content.split('\n');
  return (
    <span className={streaming ? 'streaming-caret' : undefined}>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}

export function MessageBubble({ message }: Props) {
  if (message.role === 'error') {
    return (
      <div className="flex justify-center">
        <div className="max-w-[90%] rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          <span className="font-semibold">Error: </span>
          {message.content}
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm sm:text-[15px]',
          isUser
            ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white rounded-br-md'
            : 'bg-white/[0.04] text-white/90 border border-white/10 rounded-bl-md',
        ].join(' ')}
      >
        {message.content.length === 0 && message.streaming ? (
          <span className="inline-flex items-center gap-1 text-white/70">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70" />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70"
              style={{ animationDelay: '120ms' }}
            />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70"
              style={{ animationDelay: '240ms' }}
            />
          </span>
        ) : (
          renderContent(message.content, message.streaming)
        )}
      </div>
    </div>
  );
}
