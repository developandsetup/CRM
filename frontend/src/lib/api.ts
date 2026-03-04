import { getAccessToken } from "./auth";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Create frontend/.env.local");
}

type Json = Record<string, unknown>;

export async function apiPost<TResponse>(
  path: string,
  body: Json,
  opts?: { auth?: boolean }
): Promise<TResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (opts?.auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return (await res.json()) as TResponse;
}