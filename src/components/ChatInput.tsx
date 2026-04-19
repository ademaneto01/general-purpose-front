import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  streaming?: boolean;
  onCancel?: () => void;
};

export function ChatInput({ onSend, disabled, streaming, onCancel }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-white/5 bg-[#0b0b12]/80 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl px-4 py-3 sm:px-6 sm:py-4"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-lg shadow-black/20 focus-within:border-violet-400/50 focus-within:ring-2 focus-within:ring-violet-500/20">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva sua mensagem..."
            rows={1}
            disabled={disabled && !streaming}
            className="max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none sm:text-[15px]"
          />

          {streaming ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Cancelar"
              title="Cancelar"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={disabled || value.trim().length === 0}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              aria-label="Enviar"
              title="Enviar"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>

        <p className="mt-2 text-center text-[11px] text-white/30">
          Enter para enviar · Shift + Enter para quebrar linha
        </p>
      </form>
    </div>
  );
}
