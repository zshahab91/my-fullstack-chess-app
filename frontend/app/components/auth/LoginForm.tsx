"use client";
import { useRef, useState } from "react";
import { apiService } from "@/app/services/apiService";
import { toast } from "react-toastify";

export default function LoginForm({ onLogin }: { onLogin?: (nickName: string) => void }) {
  const [nickName, setNickName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inProgress = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inProgress.current) return;
    inProgress.current = true;
    setError(null);

    try {
      await apiService.login(nickName);
      toast.success('Login successful!');
      if (onLogin) onLogin(nickName);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Login failed');
      } else {
        toast.error('Login failed');
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
      <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--text-primary)]">Nick Name</h2>
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
        Enter
      </button>
      {error && <span className="text-red-500 text-sm text-center">{error}</span>}
    </form>
  );
}