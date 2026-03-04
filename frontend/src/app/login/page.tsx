"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";

type AuthResponse = { accessToken: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("Test12345");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  console.log("LOGIN SUBMIT", { email });

  setError(null);
  setBusy(true);

  try {
    console.log("CALLING API...");
    const resp = await apiPost<AuthResponse>("/auth/login", { email, password });
    setAccessToken(resp.accessToken);
    router.push("/");
  } catch (err) {
    console.error("LOGIN ERROR", err);
    setError(err instanceof Error ? err.message : "Login failed");
  } finally {
    setBusy(false);
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-slate-900 p-6 border border-slate-800">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>

        <label className="block text-sm mb-2">Email</label>
        <input
          className="w-full mb-4 rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
        />

        <label className="block text-sm mb-2">Password</label>
        <input
          className="w-full mb-4 rounded-md bg-slate-950 border border-slate-800 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />

        {error && <div className="mb-4 text-sm text-red-300">{error}</div>}

        <button
          disabled={busy}
          className="w-full rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-3 py-2 font-medium"
          type="submit"
        >
          {busy ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-sm text-slate-300">
          No account?{" "}
          <a className="underline" href="/register">
            Register
          </a>
        </div>
      </form>
    </div>
  );
}