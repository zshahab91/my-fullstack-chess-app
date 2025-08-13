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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-gray-100 p-6 rounded shadow w-80">
      <h2 className="text-xl font-bold text-center text-gray-700">Nick Name</h2>
      <input
        type="text"
        placeholder="NickName"
        className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-700"
        value={nickName}
        onChange={e => setNickName(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-gray-900 text-white font-bold py-2 rounded hover:bg-gray-700 transition"
      >
        Enter
      </button>
      {error && <span className="text-red-500 text-sm text-center">{error}</span>}
    </form>
  );
}