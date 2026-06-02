"use client";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

export default function LoginForm({
  onLogin,
  onOidcLogin,
}: {
  onLogin?: (nickName: string) => Promise<void> | void;
  onOidcLogin?: () => void;
}) {
  const [nickName, setNickName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inProgress = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inProgress.current) return;
    inProgress.current = true;
    setError(null);

    try {
      if (!onLogin) {
        throw new Error("Login handler is not available");
      }
      await onLogin(nickName);
      toast.success("Login successful!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        const message = err.message || "Login failed";
        setError(message);
        toast.error(message);
      } else {
        setError("Login failed");
        toast.error("Login failed");
      }
    } finally {
      inProgress.current = false;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-xl backdrop-blur-sm"
    >
      <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--text-primary)]">Login</h2>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        Continue with Google or use a nickname.
      </p>
      <button
        type="button"
        onClick={onOidcLogin}
        className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] py-2.5 font-bold text-[var(--text-primary)] transition hover:cursor-pointer hover:bg-[var(--surface-hover)]"
      >
        Continue with Google
      </button>
      <div className="h-px w-full bg-[var(--border-soft)]" />
      <p className="text-sm font-semibold text-[var(--text-secondary)]">Or use nickname</p>
      <input
        type="text"
        placeholder="NickName"
        className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-strong)] p-2.5 text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent)]"
        value={nickName}
        onChange={e => setNickName(e.target.value)}
        required
      />
      <button
        type="submit"
        className="rounded-lg bg-[var(--accent)] py-2.5 font-bold text-white transition hover:bg-[var(--accent-strong)] hover:cursor-pointer"
      >
        Continue with nickname
      </button>
      {error && <span className="text-red-500 text-sm text-center">{error}</span>}
    </form>
  );
}