const TOKEN_KEY = "crm_access_token";

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}