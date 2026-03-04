import { getAccessToken } from "./auth";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Create frontend/.env.local");
}

type Json = Record<string, unknown>;

function makeHeaders(opts?: { auth?: boolean; headers?: Record<string, string> }) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts?.headers ?? {}),
  };

  if (opts?.auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  // Some endpoints may return empty body; handle gracefully.
  const text = await res.text();
  return (text ? (JSON.parse(text) as T) : (undefined as T));
}

export async function apiGet<TResponse>(
  path: string,
  opts?: { auth?: boolean; headers?: Record<string, string> }
): Promise<TResponse> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: makeHeaders(opts),
  });

  return await parseJsonOrThrow<TResponse>(res);
}

export async function apiPost<TResponse>(
  path: string,
  body: Json,
  opts?: { auth?: boolean; headers?: Record<string, string> }
): Promise<TResponse> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: makeHeaders(opts),
    body: JSON.stringify(body),
  });

  return await parseJsonOrThrow<TResponse>(res);
}