import type { ReactNode } from "react";

const PATHS: Record<string, string> = {
  dashboard: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z",
  content: "M4 5h16M4 10h16M4 15h10M4 20h7",
  posts: "M6 3h9l4 4v14H6V3Zm8 0v5h5M9 13h7M9 17h7M9 9h3",
  inbox: "M4 13l2.5-8h11L20 13v6H4v-6Zm0 0h5l1 2h4l1-2h5",
  logout: "M10 4H5v16h5M15 8l4 4-4 4M19 12H9",
  plus: "M12 5v14M5 12h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4",
  trash: "M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13",
  up: "M6 14l6-6 6 6",
  down: "M6 10l6 6 6-6",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  mail: "M4 6h16v12H4V6Zm0 1 8 6 8-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z",
  check: "M5 12.5 10 17l9-10",
  x: "M6 6l12 12M18 6 6 18",
  image: "M4 5h16v14H4V5Zm0 11 5-5 4 4 3-3 4 4M9 9.5h.01",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  save: "M5 4h11l3 3v13H5V4Zm3 0v5h7V4M8 20v-6h8v6",
  download: "M12 4v11m-5-4 5 5 5-5M5 20h14",
  menu: "M4 7h16M4 12h16M4 17h16",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 6.8M18 14a6 6 0 0 1 3 6",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z",
  lock: "M6 11h12v9H6v-9Zm3 0V8a3 3 0 0 1 6 0v3",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24" width={size}>
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="a-field">
      <span>{label}</span>
      {children}
      {hint ? <em>{hint}</em> : null}
    </label>
  );
}

export function TextInput({ label, hint, value, onChange, placeholder, type = "text" }: { label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <Field hint={hint} label={label}>
      <input onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} value={value} />
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, rows = 4 }: { label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <Field hint={hint} label={label}>
      <textarea onChange={(e) => onChange(e.target.value)} rows={rows} value={value} />
    </Field>
  );
}

export function RowTools({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
  return (
    <div className="a-rowtools">
      <button aria-label="Move up" disabled={index === 0} onClick={() => onMove(index - 1)} type="button">
        <Icon name="up" size={16} />
      </button>
      <button aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(index + 1)} type="button">
        <Icon name="down" size={16} />
      </button>
      <button aria-label="Remove" className="is-danger" onClick={onRemove} type="button">
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export type ToastKind = "ok" | "error";
export type Notify = (message: string, kind?: ToastKind) => void;

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
