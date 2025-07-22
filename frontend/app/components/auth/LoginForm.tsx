"use client";
import { useState } from "react";
import { apiService } from "@/app/services/apiService";

export default function LoginForm({ onLogin }: { onLogin?: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Use the apiService for login
      const data = await apiService.login(username);
      if (onLogin) onLogin(username);
      // Optionally, you can store the token here if needed
      // localStorage.setItem("token", data.token);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
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
      </form>
    );
}