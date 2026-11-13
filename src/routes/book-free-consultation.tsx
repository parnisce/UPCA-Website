import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageHero, PageShell } from "@/components/upca/page-shell";
import { useContact } from "@/lib/site-content";
import { ApiError, api } from "@/lib/supabase";

const DESC = "Book a free 15-minute consultation with UPCA Real Estate Marketing and Media. Pick a date and time that suits you. No obligation.";
const BUSINESS_TZ = "America/Toronto";
const OPEN_HOUR = 9;
const CLOSE_HOUR = 17;
const SLOT_MIN = 15;
const NOTICE_MS = 2 * 3_600_000;
const DAY_MS = 86_400_000;

const ZONES: { id: string; label: string }[] = [
  { id: "America/Toronto", label: "Toronto (Eastern)" },
  { id: "America/Vancouver", label: "Vancouver (Pacific)" },
  { id: "America/Edmonton", label: "Calgary (Mountain)" },
  { id: "America/Halifax", label: "Halifax (Atlantic)" },
  { id: "Europe/London", label: "London" },
  { id: "Asia/Singapore", label: "Singapore" },
  { id: "Asia/Manila", label: "Manila" },
];

export const Route = createFileRoute("/book-free-consultation")({
  head: () => ({
    meta: [
      { title: "Book a Free Consultation | UPCA Real Estate Marketing and Media" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Book a Free Consultation | UPCA Real Estate Marketing and Media" },
      { property: "og:description", content: DESC },
    ],
  }),
  component: BookingPage,
});

type Ymd = { y: number; m: number; d: number };

const pad = (n: number) => String(n).padStart(2, "0");
const key = (v: Ymd) => `${v.y}-${pad(v.m)}-${pad(v.d)}`;
const addDays = (v: Ymd, n: number): Ymd => {
  const t = new Date(Date.UTC(v.y, v.m - 1, v.d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
};
const dow = (v: Ymd) => new Date(Date.UTC(v.y, v.m - 1, v.d)).getUTCDay();
const cmp = (a: Ymd, b: Ymd) => key(a).localeCompare(key(b));

function partsIn(ts: number, tz: string) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const o: Record<string, number> = {};
  for (const p of f.formatToParts(new Date(ts))) if (p.type !== "literal") o[p.type] = Number(p.value);
  return o;
}

// Wall-clock time in the business time zone -> real instant.
function zonedToInstant(v: Ymd, h: number, min: number, tz: string) {
  const guess = Date.UTC(v.y, v.m - 1, v.d, h, min);
  const p = partsIn(guess, tz);
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return guess - (asIfUtc - guess);
}

function todayIn(tz: string): Ymd {
  const p = partsIn(Date.now(), tz);
  return { y: p.year, m: p.month, d: p.day };
}

const fmtTime = (ts: number, tz: string) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(new Date(ts));
  return parts.map((p) => p.value).join("").replace(/\s?(AM|PM)/i, (_, a: string) => ` ${a.toLowerCase()}`);
};
const fmtLong = (ts: number, tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(new Date(ts));

function slotsFor(day: Ymd, taken: Set<number>): number[] {
  if (dow(day) === 0) return [];
  const out: number[] = [];
  const floor = Date.now() + NOTICE_MS;
  for (let mins = OPEN_HOUR * 60; mins < CLOSE_HOUR * 60; mins += SLOT_MIN) {
    const ts = zonedToInstant(day, Math.floor(mins / 60), mins % 60, BUSINESS_TZ);
    if (ts >= floor && !taken.has(ts)) out.push(ts);
  }
  return out;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Chevron({ dir }: { dir: "l" | "r" }) {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <path d={dir === "l" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

function BookingPage() {
  const CONTACT = useContact();
  const today = useMemo(() => todayIn(BUSINESS_TZ), []);
  const [view, setView] = useState<"week" | "month">("week");
  const [weekStart, setWeekStart] = useState<Ymd>(today);
  const [month, setMonth] = useState<Ymd>({ ...today, d: 1 });
  const [day, setDay] = useState<Ymd>(today);
  const [slot, setSlot] = useState<number | null>(null);
  const [tz, setTz] = useState(() => (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : BUSINESS_TZ));
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const zones = ZONES.some((z) => z.id === tz) ? ZONES : [{ id: tz, label: tz.replace(/_/g, " ") }, ...ZONES];
  const [taken, setTaken] = useState<Set<number>>(() => new Set());
  const loadTaken = useCallback(async () => {
    try {
      const rows = await api<{ slot_start: string }[]>(`/rest/v1/bookings?select=slot_start&slot_start=gte.${encodeURIComponent(new Date().toISOString())}&limit=2000`);
      setTaken(new Set(rows.map((r) => new Date(r.slot_start).getTime())));
    } catch {
      // Table not reachable: show all slots; the database still blocks duplicates on submit.
    }
  }, []);
  useEffect(() => {
    void loadTaken();
  }, [loadTaken]);
  const slots = useMemo(() => slotsFor(day, taken), [day, taken]);
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const monthCells = useMemo(() => {
    const lead = dow(month);
    const count = new Date(Date.UTC(month.y, month.m, 0)).getUTCDate();
    return [...Array.from({ length: lead }, () => null), ...Array.from({ length: count }, (_, i) => ({ ...month, d: i + 1 }))] as (Ymd | null)[];
  }, [month]);

  const rangeLabel =
    view === "week"
      ? `${new Date(Date.UTC(week[0].y, week[0].m - 1, week[0].d)).toLocaleDateString("en-CA", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })} - ${new Date(Date.UTC(week[6].y, week[6].m - 1, week[6].d)).toLocaleDateString("en-CA", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })}`
      : `${MONTHS[month.m - 1]} ${month.y}`;

  const canPrev = view === "week" ? cmp(weekStart, today) > 0 : month.y * 12 + month.m > today.y * 12 + today.m;

  function step(dir: -1 | 1) {
    if (view === "week") {
      const next = addDays(weekStart, dir * 7);
      setWeekStart(cmp(next, today) < 0 ? today : next);
    } else {
      const t = new Date(Date.UTC(month.y, month.m - 1 + dir, 1));
      setMonth({ y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: 1 });
    }
  }

  function pick(v: Ymd) {
    setDay(v);
    setSlot(null);
  }

  function switchView(next: "week" | "month") {
    setView(next);
    if (next === "week") setWeekStart(cmp(day, today) < 0 ? today : day);
    else setMonth({ ...day, d: 1 });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (slot === null) return;
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    if (get("website")) {
      setStatus("done");
      return;
    }
    if (!get("name") || !/^\S+@\S+\.\S+$/.test(get("email"))) {
      setError("Please check your name and email, then try again.");
      return;
    }
    setError("");
    setStatus("sending");
    const when = `${fmtLong(slot, BUSINESS_TZ)}, ${fmtTime(slot, BUSINESS_TZ)} to ${fmtTime(slot + SLOT_MIN * 60_000, BUSINESS_TZ)} (Toronto time)`;
    const note = get("message");
    const record = {
      name: get("name").slice(0, 200),
      email: get("email").slice(0, 320),
      phone: get("phone").slice(0, 60),
      package: "Free consultation",
      area: get("area").slice(0, 300),
      message: [`BOOKING REQUEST: ${when}`, tz !== BUSINESS_TZ ? `Visitor time zone: ${tz} (${fmtTime(slot, tz)})` : "", note].filter(Boolean).join("\n").slice(0, 5000),
      source: `book:${new Date(slot).toISOString()}`,
    };
    try {
      await api("/rest/v1/bookings", { method: "POST", body: { slot_start: new Date(slot).toISOString(), email: record.email }, prefer: "return=minimal" });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || /duplicate|unique|23505/i.test(err.message))) {
        setStatus("idle");
        setSlot(null);
        setError("Sorry, that time was just booked by someone else. Please choose another time.");
        void loadTaken();
        return;
      }
    }
    try {
      await api("/rest/v1/enquiries", { method: "POST", body: record, prefer: "return=minimal" });
    } catch {
      const body = [`Name: ${record.name}`, `Email: ${record.email}`, `Phone: ${record.phone}`, `Property: ${record.area}`, "", record.message].join("\n");
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Free consultation booking")}&body=${encodeURIComponent(body)}`;
    }
    setStatus("done");
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Free consultation"
        image="/assets/world/scene-01-poster.jpg"
        lede="Book a 15-minute call. No obligation. We'll map the fastest path from photos to live listing."
        title="Book Free Consultation"
      />
      <section className="u-section u-book">
        <div className="u-wrap u-book__grid">
          <div className="u-book__pick">
            <h2 className="u-book__h">Choose Date &amp; Time</h2>
            <div className="u-book__bar">
              <div className="u-book__seg" role="group" aria-label="Calendar view">
                <button aria-pressed={view === "week"} onClick={() => switchView("week")} type="button">
                  Week
                </button>
                <button aria-pressed={view === "month"} onClick={() => switchView("month")} type="button">
                  Month
                </button>
              </div>
              <p aria-live="polite" className="u-book__range">
                {rangeLabel}
              </p>
              <div className="u-book__nav">
                <button aria-label="Previous" disabled={!canPrev} onClick={() => step(-1)} type="button">
                  <Chevron dir="l" />
                </button>
                <button aria-label="Next" onClick={() => step(1)} type="button">
                  <Chevron dir="r" />
                </button>
              </div>
            </div>

            {view === "week" ? (
              <div className="u-book__week">
                {week.map((v) => {
                  const closed = dow(v) === 0 || cmp(v, today) < 0;
                  return (
                    <button aria-pressed={key(v) === key(day)} disabled={closed} key={key(v)} onClick={() => pick(v)} type="button">
                      <small>{WEEKDAYS[dow(v)]}</small>
                      <span>{v.d}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="u-book__month">
                {WEEKDAYS.map((w) => (
                  <small key={w}>{w}</small>
                ))}
                {monthCells.map((v, i) =>
                  v ? (
                    <button aria-pressed={key(v) === key(day)} disabled={dow(v) === 0 || cmp(v, today) < 0} key={key(v)} onClick={() => pick(v)} type="button">
                      {v.d}
                    </button>
                  ) : (
                    <i key={`b${i}`} />
                  ),
                )}
              </div>
            )}

            <div className="u-book__timehead">
              <h3 className="u-book__h u-book__h--sm">Choose Time</h3>
              <label className="u-book__tz">
                <span className="u-sr">Time zone</span>
                <select onChange={(e) => { setTz(e.target.value); }} value={tz}>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {slots.length === 0 ? (
              <p className="u-book__none">No times left on this day. Please pick another date. We are closed on Sundays.</p>
            ) : (
              <div className="u-book__slots" role="group" aria-label="Available times">
                {slots.map((ts) => (
                  <button aria-pressed={slot === ts} key={ts} onClick={() => setSlot(ts)} type="button">
                    {fmtTime(ts, tz)} <i>-</i> {fmtTime(ts + SLOT_MIN * 60_000, tz)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="u-book__side">
            <h2 className="u-book__h">Booking Details</h2>
            {status === "done" ? (
              <div className="u-sent" role="status">
                <h3>You are booked in.</h3>
                <p>
                  {slot !== null ? `${fmtLong(slot, tz)} at ${fmtTime(slot, tz)}. ` : ""}We will confirm by email shortly and call you at the time you picked.
                </p>
              </div>
            ) : (
              <>
                <dl className="u-book__sum">
                  <div>
                    <dt>Service</dt>
                    <dd>
                      Free consultation <em>15 min</em> <b>Free</b>
                    </dd>
                  </div>
                  <div>
                    <dt>Employee</dt>
                    <dd>UPCA Media Capture Technician</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>
                      UPCA Niagara Region
                      <small>By phone or video call. Ontario, Canada</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Date &amp; Time</dt>
                    <dd>{slot !== null ? `${fmtLong(slot, tz)}, ${fmtTime(slot, tz)}` : "Pick a time on the left"}</dd>
                  </div>
                </dl>
                <form className="u-form u-book__form" noValidate onSubmit={onSubmit}>
                  <label>
                    <span>Name</span>
                    <input autoComplete="name" name="name" required type="text" />
                  </label>
                  <label>
                    <span>Email</span>
                    <input autoComplete="email" name="email" required type="email" />
                  </label>
                  <label>
                    <span>Phone</span>
                    <input autoComplete="tel" name="phone" type="tel" />
                  </label>
                  <label>
                    <span>Property address or area</span>
                    <input name="area" type="text" />
                  </label>
                  <label>
                    <span>Anything we should know (optional)</span>
                    <textarea name="message" rows={3} />
                  </label>
                  <input aria-hidden="true" autoComplete="off" className="u-hp" name="website" tabIndex={-1} type="text" />
                  {error ? (
                    <p className="u-form__error" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <button className="u-book__go" disabled={slot === null || status === "sending"} type="submit">
                    {status === "sending" ? "Booking..." : slot === null ? "Choose a time to continue" : "Confirm booking"}
                  </button>
                </form>
              </>
            )}
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
