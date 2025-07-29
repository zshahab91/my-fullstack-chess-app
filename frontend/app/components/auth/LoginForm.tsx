"use client";
import { useRef, useState } from "react";
import { apiService } from "@/app/services/apiService";

export default function LoginForm({ onLogin }: { onLogin?: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inProgress = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inProgress.current) return;
    inProgress.current = true;
    setError(null);

    try {
      // Use the apiService for login
      await apiService.login(username);
      // Call start service after login
      if (onLogin) onLogin(username);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      inProgress.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-gray-100 p-6 rounded shadow w-80">
      <h2 className="text-xl font-bold text-center text-gray-700">Nickname</h2>
      <input
        type="text"
        placeholder="Username"
        className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-700"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-gray-900 text-white font-bold py-2 rounded hover:bg-gray-700 transition"
      >
        Enter
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </form>
  );
}