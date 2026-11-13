import { SUPABASE_KEY, SUPABASE_URL } from "./supabase";

const SKIP = /^\/(admin|login)(\/|$)/;
let last = "";

function sessionId() {
  try {
    let id = sessionStorage.getItem("upca-sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("upca-sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function device() {
  const w = window.innerWidth;
  return w < 700 ? "mobile" : w < 1100 ? "tablet" : "desktop";
}

function referrerHost() {
  try {
    if (!document.referrer) return "";
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return host === window.location.hostname.replace(/^www\./, "") ? "" : host.slice(0, 200);
  } catch {
    return "";
  }
}

// Anonymous page view: path, referring site, per-tab random id and device type. No cookies, no IP.
export function trackView(path: string) {
  if (typeof window === "undefined" || SKIP.test(path) || path === last) return;
  if (/^(localhost|127\.|\[::1\])/.test(window.location.hostname)) return;
  if (navigator.webdriver) return;
  last = path;
  const first = !sessionStorage.getItem("upca-seen");
  try {
    sessionStorage.setItem("upca-seen", "1");
  } catch {
    // ignore
  }
  void fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
    method: "POST",
    keepalive: true,
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ path: path.slice(0, 300), referrer: first ? referrerHost() : "", session_id: sessionId(), device: device() }),
  }).catch(() => undefined);
}
