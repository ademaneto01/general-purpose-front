import type { Attachment, UIMessage } from '../types';

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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentsList({
  attachments,
  isUser,
}: {
  attachments: Attachment[];
  isUser: boolean;
}) {
  return (
    <ul
      className={[
        'flex flex-wrap gap-1.5',
        isUser ? 'mb-2' : 'mb-2',
      ].join(' ')}
    >
      {attachments.map((a, i) => (
        <li
          key={`${a.name}-${a.size}-${i}`}
          className={[
            'inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px]',
            isUser
              ? 'bg-white/15 text-white'
              : 'border border-white/10 bg-white/[0.04] text-white/80',
          ].join(' ')}
          title={`${a.name} · ${formatSize(a.size)}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3 shrink-0 opacity-80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="max-w-[140px] truncate sm:max-w-[200px]">{a.name}</span>
          <span className="opacity-60">{formatSize(a.size)}</span>
        </li>
      ))}
    </ul>
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
  const hasAttachments = !!message.attachments && message.attachments.length > 0;
  const hasContent = message.content.length > 0;

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
        {hasAttachments ? (
          <AttachmentsList attachments={message.attachments!} isUser={isUser} />
        ) : null}

        {!hasContent && message.streaming ? (
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
        ) : hasContent ? (
          renderContent(message.content, message.streaming)
        ) : null}
      </div>
    </div>
  );
}
