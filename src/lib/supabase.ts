// Minimal Supabase client (REST + Auth + Storage) with no extra dependency.
// The publishable key is designed to be public. Data is protected by the
// row-level security rules in supabase/schema.sql, not by hiding this key.

export const SUPABASE_URL = "https://friptqshoellqeknktrx.supabase.co";
export const SUPABASE_KEY = "sb_publishable_-_Cz3JW2s7x0d2fMKZGWTA_tMhaJjf2";

const SESSION_KEY = "upca-admin-session";

export type Session = { access_token: string; refresh_token: string; expires_at: number; email: string };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function load(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function save(s: Session | null) {
  try {
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  return load();
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  user?: { email?: string };
  error_description?: string;
  msg?: string;
  message?: string;
  error?: string;
};

function toSession(r: TokenResponse, fallbackEmail: string): Session {
  const expires = r.expires_at ?? Math.floor(Date.now() / 1000) + (r.expires_in ?? 3600);
  return {
    access_token: String(r.access_token),
    refresh_token: String(r.refresh_token),
    expires_at: expires,
    email: r.user?.email ?? fallbackEmail,
  };
}

async function tokenRequest(grant: "password" | "refresh_token", body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=${grant}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as TokenResponse;
  if (!res.ok || !data.access_token) {
    const raw = data.error_description ?? data.msg ?? data.message ?? data.error ?? "";
    const text = /invalid login/i.test(raw) ? "That email or password is not right." : raw || "Could not sign in. Please try again.";
    throw new ApiError(text, res.status);
  }
  return data;
}

export async function signIn(email: string, password: string): Promise<Session> {
  const data = await tokenRequest("password", { email, password });
  const session = toSession(data, email);
  save(session);
  return session;
}

export async function accessToken(): Promise<string | null> {
  const s = getSession();
  if (!s) return null;
  if (s.expires_at - Date.now() / 1000 > 60) return s.access_token;
  try {
    const data = await tokenRequest("refresh_token", { refresh_token: s.refresh_token });
    const next = toSession(data, s.email);
    save(next);
    return next.access_token;
  } catch {
    save(null);
    return null;
  }
}

export async function signOut(): Promise<void> {
  const s = getSession();
  save(null);
  if (!s) return;
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${s.access_token}` } });
  } catch {
    /* already signed out locally */
  }
}

export async function sendRecovery(email: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirect_to: `${window.location.origin}/login` }),
  });
  if (!res.ok) throw new ApiError("Could not send the reset email. Please try again.", res.status);
}

type ApiOptions = { method?: string; body?: unknown; auth?: boolean; prefer?: string };

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { apikey: SUPABASE_KEY };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.prefer) headers.Prefer = opts.prefer;
  if (opts.auth) {
    const token = await accessToken();
    if (!token) throw new ApiError("Your session has ended. Please sign in again.", 401);
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string; hint?: string };
    if (res.status === 401 && opts.auth) save(null);
    throw new ApiError(data.message ?? data.error ?? `Request failed (${res.status})`, res.status);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function checkAdmin(): Promise<boolean> {
  try {
    return (await api<boolean>("/rest/v1/rpc/is_admin", { method: "POST", body: {}, auth: true })) === true;
  } catch {
    return false;
  }
}

export async function uploadMedia(file: File): Promise<string> {
  const token = await accessToken();
  if (!token) throw new ApiError("Your session has ended. Please sign in again.", 401);
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/media/${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" },
    body: file,
  });
  if (!res.ok) throw new ApiError("Image upload failed. Check that the setup SQL has been run.", res.status);
  return `${SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}

// ------------------------------------------------------------------ data types
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EnquiryStatus = "new" | "contacted" | "closed";

export type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  package: string;
  area: string;
  message: string;
  source: string;
  status: EnquiryStatus;
  notes: string;
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA", withTime ? { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" } : { year: "numeric", month: "short", day: "numeric" });
}
