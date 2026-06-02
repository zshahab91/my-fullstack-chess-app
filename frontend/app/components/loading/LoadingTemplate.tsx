"use client";

export default function LoadingTemplate({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-soft)] border-t-[var(--accent)]" />
      <p className="text-sm font-semibold tracking-wide text-[var(--text-secondary)]">
        {message}
      </p>
    </div>
  );
}