"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export default function MePage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet("/auth/me", { auth: true })
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-xl font-semibold mb-4">Me</h1>
      {err && <div className="text-red-300">{err}</div>}
      <pre className="text-sm">{data ? JSON.stringify(data, null, 2) : "Loading..."}</pre>
    </div>
  );
}