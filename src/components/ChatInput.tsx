import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

type Props = {
  onSend: (text: string, files: File[]) => void;
  disabled?: boolean;
  streaming?: boolean;
  onCancel?: () => void;
};

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 5 MB
const ACCEPTED_EXTENSIONS = [
  '.txt',
  '.md',
  '.csv',
  '.json',
  '.yaml',
  '.yml',
  '.xml',
  '.html',
  '.py',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.log',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.gz',
  '.bz2',
  '.xz',
];

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatInput({ onSend, disabled, streaming, onCancel }: Props) {
  const [value, setValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    setFileError(null);

    const errors: string[] = [];
    const accepted: File[] = [];
    const existingKeys = new Set(files.map((f) => `${f.name}:${f.size}`));

    for (const f of incoming) {
      if (!hasAcceptedExtension(f.name)) {
        errors.push(`"${f.name}": unsupported type`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${f.name}": exceeds ${formatSize(MAX_FILE_SIZE_BYTES)}`);
        continue;
      }
      const key = `${f.name}:${f.size}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      accepted.push(f);
    }

    const available = Math.max(0, MAX_FILES - files.length);
    const toAdd = accepted.slice(0, available);
    if (accepted.length > available) {
      errors.push(`Maximum of ${MAX_FILES} files`);
    }

    if (toAdd.length > 0) {
      setFiles((prev) => [...prev, ...toAdd]);
    }
    if (errors.length > 0) {
      setFileError(errors.join(' · '));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    addFiles(Array.from(list));
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  const submit = () => {
    const trimmed = value.trim();
    if (disabled) return;
    if (!trimmed && files.length === 0) return;
    onSend(trimmed, files);
    setValue('');
    setFiles([]);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer?.files;
    if (dropped && dropped.length > 0) {
      addFiles(Array.from(dropped));
    }
  };

  const canSubmit = !disabled && (value.trim().length > 0 || files.length > 0);

  return (
    <div className="border-t border-white/5 bg-[#0b0b12]/80 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl px-4 py-3 sm:px-6 sm:py-4"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            'rounded-2xl border bg-white/[0.03] p-2 shadow-lg shadow-black/20 transition',
            isDragging
              ? 'border-violet-400/70 ring-2 ring-violet-500/30'
              : 'border-white/10 focus-within:border-violet-400/50 focus-within:ring-2 focus-within:ring-violet-500/20',
          ].join(' ')}
        >
          {files.length > 0 ? (
            <ul className="flex flex-wrap gap-2 px-1 pb-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${f.size}-${i}`}
                  className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-white/80"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 shrink-0 text-white/60"
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
                  <span className="max-w-[160px] truncate sm:max-w-[220px]" title={f.name}>
                    {f.name}
                  </span>
                  <span className="text-white/40">{formatSize(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                    aria-label={`Remove ${f.name}`}
                    title="Remove"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS.join(',')}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= MAX_FILES}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Attach files"
              title="Attach files"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your message..."
              rows={1}
              disabled={disabled && !streaming}
              className="max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none sm:text-[15px]"
            />

            {streaming ? (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Cancel"
                title="Cancel"
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
                disabled={!canSubmit}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                aria-label="Send"
                title="Send"
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
        </div>

        {fileError ? (
          <p className="mt-2 text-center text-[11px] text-rose-300/90">{fileError}</p>
        ) : (
          <p className="mt-2 text-center text-[11px] text-white/30">
            Enter to send · Shift + Enter for a new line · Attach up to {MAX_FILES} files (max{' '}
            {formatSize(MAX_FILE_SIZE_BYTES)} each)
          </p>
        )}
      </form>
    </div>
  );
}
