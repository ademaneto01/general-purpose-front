type Props = {
  status: string | null;
  visible: boolean;
};

export function StatusIndicator({ status, visible }: Props) {
  if (!visible || !status) return null;
  return (
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
        </span>
        <span className="max-w-[260px] truncate">{status}</span>
      </div>
    </div>
  );
}
