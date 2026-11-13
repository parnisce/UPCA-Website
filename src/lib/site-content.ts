// Editable homepage content. Defaults live in components/upca/content.ts so the
// site works even if the database is empty or unreachable; anything saved from
// the admin overrides those defaults after the page loads.
import { useMemo, useSyncExternalStore } from "react";

import { ABOUT, CONTACT, FAQS, SERVICES, TESTIMONIALS } from "@/components/upca/content";
import { api } from "./supabase";

export type HeroCopy = { title: string; body: string; tag: string };
export type AboutContent = { title: string; paragraphs: string[]; facts: { value: string; label: string }[] };
export type ServiceCopy = { slug: string; title: string; text: string };
export type Testimonial = { name: string; role: string; text: string; sample?: boolean };
export type Faq = { q: string; a: string };
export type ContactInfo = { phone: string; email: string };

export type SiteContent = {
  hero?: HeroCopy[];
  about?: AboutContent;
  services?: ServiceCopy[];
  testimonials?: Testimonial[];
  faqs?: Faq[];
  contact?: ContactInfo;
};

const CACHE_KEY = "upca-site-content";
const EMPTY: SiteContent = {};
let state: SiteContent = EMPTY;
let started = false;
const listeners = new Set<() => void>();

function set(next: SiteContent) {
  state = next;
  listeners.forEach((l) => l());
}

export function applyContent(key: keyof SiteContent, value: unknown) {
  const next = { ...state } as Record<string, unknown>;
  if (value === null || value === undefined) delete next[key];
  else next[key] = value;
  set(next as SiteContent);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  try {
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (cached) set(JSON.parse(cached) as SiteContent);
  } catch {
    /* ignore a bad cache */
  }
  api<{ key: string; value: unknown }[]>("/rest/v1/site_content?select=key,value")
    .then((rows) => {
      const next: Record<string, unknown> = {};
      for (const r of rows) next[r.key] = r.value;
      set(next as SiteContent);
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
    })
    .catch(() => {
      /* keep defaults when the database is unreachable */
    });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  start();
  return () => {
    listeners.delete(cb);
  };
}

export function useSiteContent(): SiteContent {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

// ------------------------------------------------------------------ section hooks
export function useAbout(): AboutContent {
  const c = useSiteContent();
  return c.about ?? ABOUT;
}

export function useServices() {
  const c = useSiteContent();
  return useMemo(
    () =>
      SERVICES.map((s) => {
        const o = c.services?.find((x) => x.slug === s.slug);
        return o ? { ...s, title: o.title || s.title, text: o.text || s.text } : s;
      }),
    [c.services],
  );
}

export function useTestimonials(): Testimonial[] {
  const c = useSiteContent();
  return useMemo(() => c.testimonials ?? TESTIMONIALS.map((t) => ({ ...t, sample: true })), [c.testimonials]);
}

export function useFaqs(): Faq[] {
  const c = useSiteContent();
  return c.faqs ?? FAQS;
}

export function phoneToHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 10 ? `1${digits}` : digits;
  return `tel:+${full}`;
}

export function useContact() {
  const c = useSiteContent();
  return useMemo(() => {
    const phone = c.contact?.phone || CONTACT.phone;
    const email = c.contact?.email || CONTACT.email;
    return { ...CONTACT, phone, phoneHref: c.contact?.phone ? phoneToHref(phone) : CONTACT.phoneHref, email, emailHref: `mailto:${email}` };
  }, [c.contact]);
}

export const DEFAULTS = {
  about: ABOUT,
  services: SERVICES.map((s) => ({ slug: s.slug, title: s.title, text: s.text })),
  testimonials: TESTIMONIALS.map((t) => ({ ...t, sample: true })),
  faqs: FAQS,
  contact: { phone: CONTACT.phone, email: CONTACT.email },
};
