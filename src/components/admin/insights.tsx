import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/supabase";
import { Icon, type Notify } from "./parts";

type Category = "shoots" | "editing" | "marketing" | "admin";
type Entry = { id: string; task_id: string | null; title: string; category: Category; minutes: number; day: string };
type TaskLite = { id: string; title: string; status: string; updated_at: string };
type Mode = "week" | "month" | "year";

const CATS: { id: Category; label: string; rgb: string }[] = [
  { id: "shoots", label: "Shoots", rgb: "242, 182, 32" },
  { id: "editing", label: "Editing", rgb: "92, 200, 255" },
  { id: "marketing", label: "Marketing", rgb: "74, 222, 128" },
  { id: "admin", label: "Admin", rgb: "255, 138, 122" },
];
const catOf = (id: string) => CATS.find((c) => c.id === id) ?? CATS[0];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => new Date(`${s}T12:00:00`);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

function minutes(n: number) {
  const h = Math.floor(n / 60);
  const m = n % 60;
  return h ? (m ? `${h}H ${m}M` : `${h}H`) : `${m}M`;
}

// "45", "45m", "1h", "1h 30m", "1.5h", "1:30" -> minutes
function parseDuration(v: string): number {
  const s = v.trim().toLowerCase();
  if (!s) return 0;
  const colon = s.match(/^(\d+):(\d{1,2})$/);
  if (colon) return Number(colon[1]) * 60 + Number(colon[2]);
  const hm = s.match(/^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+)\s*m?)?$/);
  if (!hm) return 0;
  return Math.round(Number(hm[1] ?? 0) * 60 + Number(hm[2] ?? 0));
}

function cellStyle(byCat: Record<string, number>, total: number, max: number, selectedAlpha = 1) {
  if (total <= 0) return undefined;
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0][0];
  const level = Math.max(0.28, Math.min(1, total / Math.max(1, max)));
  return { background: `rgba(${catOf(top).rgb}, ${(0.25 + 0.75 * level) * selectedAlpha})` };
}

export function Insights({ notify }: { notify: Notify }) {
  const today = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<Mode>("month");
  const [anchor, setAnchor] = useState<Date>(today);
  const [selected, setSelected] = useState(ymd(today));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tasks, setTasks] = useState<TaskLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const since = ymd(addDays(new Date(), -400));
      const [e, t] = await Promise.all([
        api<Entry[]>(`/rest/v1/time_entries?select=id,task_id,title,category,minutes,day&day=gte.${since}&order=day.desc,created_at.desc&limit=5000`, { auth: true }),
        api<TaskLite[]>("/rest/v1/tasks?select=id,title,status,updated_at&order=created_at.asc", { auth: true }).catch(() => [] as TaskLite[]),
      ]);
      setEntries(e);
      setTasks(t);
      setMissing(false);
    } catch {
      setMissing(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const range = useMemo(() => {
    if (mode === "week") {
      const s = mondayOf(anchor);
      return { start: s, end: addDays(s, 6) };
    }
    if (mode === "month") return { start: new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12), end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 12) };
    return { start: new Date(anchor.getFullYear(), 0, 1, 12), end: new Date(anchor.getFullYear(), 11, 31, 12) };
  }, [mode, anchor]);

  const label = useMemo(() => {
    if (mode === "year") return String(anchor.getFullYear());
    if (mode === "month") return range.start.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
    return `${range.start.toLocaleDateString("en-CA", { month: "short", day: "numeric" })} - ${range.end.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}`;
  }, [mode, range, anchor]);

  const startS = ymd(range.start);
  const endS = ymd(range.end);
  const todayS = ymd(today);
  const inRange = useMemo(() => entries.filter((e) => e.day >= startS && e.day <= endS), [entries, startS, endS]);

  const perDay = useMemo(() => {
    const m = new Map<string, { total: number; byCat: Record<string, number> }>();
    for (const e of entries) {
      const d = m.get(e.day) ?? { total: 0, byCat: {} };
      d.total += e.minutes;
      d.byCat[e.category] = (d.byCat[e.category] ?? 0) + e.minutes;
      m.set(e.day, d);
    }
    return m;
  }, [entries]);

  const stats = useMemo(() => {
    const total = inRange.reduce((a, e) => a + e.minutes, 0);
    const byCat: Record<string, number> = {};
    for (const e of inRange) byCat[e.category] = (byCat[e.category] ?? 0) + e.minutes;
    const days = new Map<string, number>();
    for (const e of inRange) days.set(e.day, (days.get(e.day) ?? 0) + e.minutes);
    const best = [...days.entries()].sort((a, b) => b[1] - a[1])[0];
    const elapsedEnd = endS < todayS ? range.end : today;
    const elapsed = startS > todayS ? 0 : Math.round((elapsedEnd.getTime() - range.start.getTime()) / 86_400_000) + 1;
    let streak = 0;
    let cursor = perDay.has(todayS) ? today : addDays(today, -1);
    while (perDay.has(ymd(cursor))) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    const done = tasks.filter((t) => t.status === "done" && t.updated_at.slice(0, 10) >= startS && t.updated_at.slice(0, 10) <= endS).length;
    const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    return { total, byCat, active: days.size, best, elapsed, streak, done, avg: days.size ? Math.round(total / days.size) : 0, topCat, maxDay: Math.max(1, ...days.values()) };
  }, [inRange, perDay, tasks, startS, endS, todayS, range, today]);

  function shift(dir: -1 | 1) {
    const a = new Date(anchor);
    if (mode === "week") a.setDate(a.getDate() + dir * 7);
    else if (mode === "month") a.setMonth(a.getMonth() + dir, 1);
    else a.setFullYear(a.getFullYear() + dir, 0, 1);
    setAnchor(a);
    const first = mode === "week" ? mondayOf(a) : mode === "month" ? new Date(a.getFullYear(), a.getMonth(), 1, 12) : new Date(a.getFullYear(), 0, 1, 12);
    setSelected(ymd(first) > todayS ? todayS : ymd(first));
  }

  function changeMode(m: Mode) {
    setMode(m);
    setAnchor(today);
    setSelected(todayS);
  }

  async function removeEntry(id: string) {
    const previous = entries;
    setEntries(entries.filter((e) => e.id !== id));
    try {
      await api(`/rest/v1/time_entries?id=eq.${id}`, { method: "DELETE", auth: true });
      notify("Entry removed.");
    } catch (err) {
      setEntries(previous);
      notify(err instanceof Error ? err.message : "Could not remove the entry.", "error");
    }
  }

  const cells = useMemo(() => {
    if (mode === "year") return [];
    const list: (string | null)[] = [];
    if (mode === "month") for (let i = 0; i < (range.start.getDay() + 6) % 7; i++) list.push(null);
    for (let d = new Date(range.start); ymd(d) <= endS; d = addDays(d, 1)) list.push(ymd(d));
    return list;
  }, [mode, range, endS]);

  const yearMonths = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) => {
        const prefix = `${anchor.getFullYear()}-${pad(m + 1)}`;
        const mine = entries.filter((e) => e.day.startsWith(prefix));
        const byCat: Record<string, number> = {};
        for (const e of mine) byCat[e.category] = (byCat[e.category] ?? 0) + e.minutes;
        return { m, total: mine.reduce((a, e) => a + e.minutes, 0), byCat };
      }),
    [entries, anchor],
  );
  const yearMax = Math.max(1, ...yearMonths.map((x) => x.total));

  // Last 12 months heatmap: columns are weeks (Monday first), rows are days.
  const heat = useMemo(() => {
    const first = mondayOf(addDays(today, -52 * 7));
    const cols: { date: string; future: boolean }[][] = [];
    for (let w = 0; w < 53; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const day = addDays(first, w * 7 + d);
        col.push({ date: ymd(day), future: ymd(day) > todayS });
      }
      cols.push(col);
    }
    const months = cols.map((c, i) => {
      const d = parse(c[0].date);
      const prev = i > 0 ? parse(cols[i - 1][0].date) : null;
      return !prev || prev.getMonth() !== d.getMonth() ? d.toLocaleDateString("en-CA", { month: "short" }) : "";
    });
    const max = Math.max(1, ...[...perDay.values()].map((v) => v.total));
    return { cols, months, max };
  }, [today, todayS, perDay]);

  const selectedEntries = inRange.filter((e) => e.day === selected);
  const topItems = useMemo(() => {
    const m = new Map<string, { title: string; category: Category; minutes: number }>();
    for (const e of inRange) {
      const k = e.title.toLowerCase();
      const cur = m.get(k) ?? { title: e.title, category: e.category, minutes: 0 };
      cur.minutes += e.minutes;
      m.set(k, cur);
    }
    return [...m.values()].sort((a, b) => b.minutes - a.minutes).slice(0, 8);
  }, [inRange]);

  const current = startS <= todayS && endS >= todayS;
  const selLabel = parse(selected).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
  const selTotal = perDay.get(selected)?.total ?? 0;

  if (missing && !loading) {
    return (
      <div className="a-empty a-card">
        <Icon name="chart" size={34} />
        <h3>Insights needs one more setup step</h3>
        <p>Run supabase/admin-extras.sql, then supabase/tasks-upgrade.sql, then supabase/time-entries.sql in the Supabase SQL Editor and refresh this page.</p>
        <button className="a-btn a-btn--gold" onClick={() => void load()} type="button">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="ti">
      <header className="tk-head">
        <div>
          <h2>Insights</h2>
          <p>Where your time actually went</p>
        </div>
        <button className="tk-new" onClick={() => setLogOpen(true)} type="button">
          <Icon name="plus" size={16} /> Log time
        </button>
      </header>

      <div className="ti-bar">
        <div className="tk-toggle" role="group" aria-label="Period">
          {(["week", "month", "year"] as const).map((m) => (
            <button aria-pressed={mode === m} key={m} onClick={() => changeMode(m)} type="button">
              {m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        <div className="ti-nav">
          <button aria-label="Previous period" onClick={() => shift(-1)} type="button">
            <Icon name="left" size={16} />
          </button>
          <span>{label}</span>
          <button aria-label="Next period" onClick={() => shift(1)} type="button">
            <Icon name="right" size={16} />
          </button>
        </div>
      </div>

      <p className="ti-summary">
        {stats.total === 0 ? (
          <>
            Nothing logged for {label} yet. Use <b>Log time</b> to add your first entry.
          </>
        ) : (
          <>
            {label}
            {current ? " so far" : ""}: <b>{minutes(stats.total)}</b> logged. Most of it went to <em style={{ color: `rgb(${catOf(stats.topCat[0]).rgb})` }}>{catOf(stats.topCat[0]).label}</em>.
          </>
        )}
      </p>

      <section className="ti-main">
        <div className="ti-main__left">
          <small className="ti-label">Logged {label}</small>
          <strong className="ti-total">{minutes(stats.total)}</strong>
          <div aria-hidden="true" className="ti-stack">
            {CATS.map((c) => (stats.byCat[c.id] ? <i key={c.id} style={{ width: `${(stats.byCat[c.id] / stats.total) * 100}%`, background: `rgb(${c.rgb})` }} /> : null))}
          </div>
          <ul className="ti-legend">
            {CATS.map((c) => (
              <li key={c.id}>
                <i style={{ background: `rgb(${c.rgb})` }} /> {c.label} <b>{minutes(stats.byCat[c.id] ?? 0)}</b>
              </li>
            ))}
          </ul>

          <div className="ti-day">
            <h3>{mode === "year" ? "Top items this year" : selLabel}</h3>
            {mode === "year" ? (
              topItems.length === 0 ? (
                <p className="a-empty-sm">{loading ? "Loading..." : "Nothing logged this year yet."}</p>
              ) : (
                <ul>
                  {topItems.map((t) => (
                    <li key={t.title}>
                      <i style={{ background: `rgb(${catOf(t.category).rgb})` }} />
                      <span>{t.title}</span>
                      <small>{catOf(t.category).label}</small>
                      <b>{minutes(t.minutes)}</b>
                    </li>
                  ))}
                </ul>
              )
            ) : selectedEntries.length === 0 ? (
              <p className="a-empty-sm">{loading ? "Loading..." : "Nothing logged on this day."}</p>
            ) : (
              <ul>
                {selectedEntries.map((e) => (
                  <li key={e.id}>
                    <i style={{ background: `rgb(${catOf(e.category).rgb})` }} />
                    <span>{e.title}</span>
                    <small>{catOf(e.category).label}</small>
                    <b>{minutes(e.minutes)}</b>
                    <button aria-label={`Remove ${e.title}`} onClick={() => void removeEntry(e.id)} type="button">
                      <Icon name="trash" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="ti-main__right">
          <small className="ti-label">{mode === "year" ? `${anchor.getFullYear()} months` : mode === "week" ? "This week" : `${range.start.toLocaleDateString("en-CA", { month: "long" })} squares`}</small>
          {mode === "year" ? (
            <div className="ti-months">
              {yearMonths.map((x) => (
                <button
                  key={x.m}
                  onClick={() => {
                    setMode("month");
                    setAnchor(new Date(anchor.getFullYear(), x.m, 1, 12));
                    setSelected(ymd(new Date(anchor.getFullYear(), x.m, 1, 12)));
                  }}
                  style={cellStyle(x.byCat, x.total, yearMax)}
                  title={`${new Date(2000, x.m, 1).toLocaleDateString("en-CA", { month: "long" })}: ${minutes(x.total)}`}
                  type="button"
                >
                  {new Date(2000, x.m, 1).toLocaleDateString("en-CA", { month: "short" })}
                </button>
              ))}
            </div>
          ) : (
            <div className="ti-cal">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <small key={i}>{d}</small>
              ))}
              {cells.map((d, i) => {
                if (!d) return <i key={`b${i}`} />;
                const info = perDay.get(d);
                return (
                  <button
                    aria-label={`${d}: ${minutes(info?.total ?? 0)}`}
                    aria-pressed={d === selected}
                    className={d === todayS ? "is-today" : undefined}
                    disabled={d > todayS}
                    key={d}
                    onClick={() => setSelected(d)}
                    style={info ? cellStyle(info.byCat, info.total, stats.maxDay) : undefined}
                    type="button"
                  />
                );
              })}
            </div>
          )}
          <p className="ti-caption">{mode === "year" ? "Click a month to open it" : `${selLabel}: ${minutes(selTotal)}`}</p>
        </div>
      </section>

      <section aria-label="Summary" className="ti-stats">
        <div>
          <small>Active days</small>
          <strong>{stats.active}</strong>
          <span>of {stats.elapsed} days</span>
        </div>
        <div>
          <small>Best day</small>
          <strong>{stats.best ? minutes(stats.best[1]) : "0M"}</strong>
          <span>{stats.best ? parse(stats.best[0]).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" }) : "Nothing yet"}</span>
        </div>
        <div>
          <small>Day streak</small>
          <strong>{stats.streak}</strong>
          <span>days logged in a row</span>
        </div>
        <div>
          <small>Tasks done</small>
          <strong>{stats.done}</strong>
          <span>tasks</span>
        </div>
        <div>
          <small>Average per active day</small>
          <strong>{minutes(stats.avg)}</strong>
          <span>on days you logged time</span>
        </div>
      </section>

      <section className="ti-heat">
        <header>
          <h3>The last 12 months</h3>
          <p>Each square is a day, coloured by where most time went</p>
        </header>
        <div className="ti-heat__scroll">
          <div className="ti-heat__months" style={{ gridTemplateColumns: `repeat(${heat.cols.length}, minmax(0, 1fr))` }}>
            {heat.months.map((m, i) => (
              <small key={i}>{m}</small>
            ))}
          </div>
          <div className="ti-heat__grid" style={{ gridTemplateColumns: `repeat(${heat.cols.length}, minmax(0, 1fr))` }}>
            {heat.cols.map((col) =>
              col.map((c) => {
                const info = perDay.get(c.date);
                return <i className={c.future ? "is-future" : undefined} key={c.date} style={info ? cellStyle(info.byCat, info.total, heat.max) : undefined} title={`${c.date}: ${minutes(info?.total ?? 0)}`} />;
              }),
            )}
          </div>
        </div>
      </section>

      {logOpen ? (
        <LogTime
          onClose={() => setLogOpen(false)}
          onSaved={(e) => {
            setEntries((list) => [e, ...list]);
            setSelected(e.day > todayS ? todayS : e.day);
            const d = parse(e.day);
            if (e.day < startS || e.day > endS) setAnchor(d);
            setLogOpen(false);
            notify("Time logged.");
          }}
          tasks={tasks.filter((t) => t.status !== "done")}
          today={todayS}
        />
      ) : null}
    </div>
  );
}

function LogTime({ tasks, today, onClose, onSaved }: { tasks: TaskLite[]; today: string; onClose: () => void; onSaved: (e: Entry) => void }) {
  const [taskId, setTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("shoots");
  const [duration, setDuration] = useState("");
  const [day, setDay] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const mins = parseDuration(duration);
    const name = taskId ? (tasks.find((t) => t.id === taskId)?.title ?? "") : title.trim();
    if (!name) return setError("Pick a task or type what you worked on.");
    if (mins <= 0 || mins > 1440) return setError("Enter a time like 45, 1h 30m or 1.5h.");
    setError("");
    setSaving(true);
    try {
      const rows = await api<Entry[]>("/rest/v1/time_entries", { method: "POST", body: { task_id: taskId || null, title: name.slice(0, 200), category, minutes: mins, day }, auth: true, prefer: "return=representation" });
      onSaved(rows[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Run supabase/time-entries.sql first.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="a-modal" role="dialog" aria-modal="true" aria-label="Log time">
      <button aria-label="Close" className="a-modal__scrim" onClick={onClose} type="button" />
      <form className="a-card a-modal__box" onSubmit={submit}>
        <h3>Log time</h3>
        <label className="a-field">
          <span>Task</span>
          <select onChange={(e) => setTaskId(e.target.value)} value={taskId}>
            <option value="">Something else</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        {taskId ? null : (
          <label className="a-field">
            <span>What did you work on?</span>
            <input onChange={(e) => setTitle(e.target.value)} placeholder="Shoot at Thorold listing" value={title} />
          </label>
        )}
        <div className="a-two">
          <label className="a-field">
            <span>Category</span>
            <select onChange={(e) => setCategory(e.target.value as Category)} value={category}>
              {CATS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="a-field">
            <span>Time spent</span>
            <input onChange={(e) => setDuration(e.target.value)} placeholder="45m or 1h 30m" value={duration} />
          </label>
        </div>
        <label className="a-field">
          <span>Date</span>
          <input max={today} onChange={(e) => setDay(e.target.value)} type="date" value={day} />
        </label>
        {error ? (
          <p className="a-alert a-alert--error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="a-actions">
          <button className="a-btn a-btn--gold" disabled={saving} type="submit">
            {saving ? "Saving..." : "Log time"}
          </button>
          <button className="a-btn a-btn--ghost" onClick={onClose} type="button">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
