import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/supabase";
import { Icon, TextArea, TextInput, type Notify } from "./parts";

type Status = "open" | "doing" | "blocked" | "done";
type Priority = "low" | "medium" | "high";
type Category = "shoots" | "editing" | "marketing" | "admin";
type Check = { t: string; d: boolean };
type Task = {
  id: string;
  title: string;
  notes: string;
  status: Status;
  priority: Priority;
  due_date: string | null;
  start_at: string | null;
  timer_started_at: string | null;
  category: Category;
  position: number;
  tags: string[];
  estimate_min: number | null;
  checklist: Check[];
  created_at: string;
};

const COLS: { id: Status; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "doing", label: "In progress" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

const PRIORITIES: Priority[] = ["low", "medium", "high"];
const CATEGORIES: { id: Category; label: string }[] = [
  { id: "shoots", label: "Shoots" },
  { id: "editing", label: "Editing" },
  { id: "marketing", label: "Marketing" },
  { id: "admin", label: "Admin" },
];
const DAY = 86_400_000;

function normalise(t: Task & { status: string }): Task {
  return { ...t, status: (t.status === "todo" ? "open" : t.status) as Status, tags: t.tags ?? [], checklist: t.checklist ?? [], estimate_min: t.estimate_min ?? null, start_at: t.start_at ?? null, timer_started_at: t.timer_started_at ?? null, category: t.category ?? "shoots" };
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const dayDiff = (d: string) => Math.round((new Date(`${d}T12:00:00`).getTime() - new Date(`${todayStr()}T12:00:00`).getTime()) / DAY);

function dueState(t: Task): "late" | "soon" | "" {
  if (!t.due_date || t.status === "done") return "";
  const n = dayDiff(t.due_date);
  return n < 0 ? "late" : n <= 2 ? "soon" : "";
}

// Value for <input type="datetime-local"> in the viewer's own time zone.
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function startLabel(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(" AM", " am").replace(" PM", " pm");
  return `${day}, ${time}`;
}

const localDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function timerText(totalSecs: number, live: boolean) {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const sec = Math.floor(totalSecs % 60);
  if (!live) return minutes(Math.round(totalSecs / 60));
  return h ? `${h}H ${m}M` : `${m}M ${sec}S`;
}

const dueShort = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

function minutes(n: number) {
  const h = Math.floor(n / 60);
  const m = n % 60;
  return h ? (m ? `${h}H ${m}M` : `${h}H`) : `${m}M`;
}

type Draft = { id?: string; title: string; notes: string; priority: Priority; due_date: string; start_at: string; category: Category; status: Status; tags: string; estimate: string; checklist: Check[] };

const blank = (status: Status): Draft => ({ title: "", notes: "", priority: "medium", due_date: "", start_at: "", category: "shoots", status, tags: "", estimate: "", checklist: [] });

function toDraft(t: Task): Draft {
  return { id: t.id, title: t.title, notes: t.notes, priority: t.priority, due_date: t.due_date ?? "", start_at: toLocalInput(t.start_at), category: t.category, status: t.status, tags: t.tags.join(", "), estimate: t.estimate_min ? String(t.estimate_min) : "", checklist: t.checklist };
}

export function TasksBoard({ notify }: { notify: Notify }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);
  const [view, setView] = useState<"board" | "list">("board");
  const [newCheck, setNewCheck] = useState("");
  const [loggedBy, setLoggedBy] = useState<Map<string, number>>(() => new Map());
  const [now, setNow] = useState(() => Date.now());
  const logged = [...loggedBy.values()].reduce((a, b) => a + b, 0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api<(Task & { status: string })[]>("/rest/v1/tasks?select=*&order=position.asc,created_at.asc", { auth: true });
      setTasks(rows.map(normalise));
      setMissing(false);
    } catch (err) {
      setMissing(true);
      notify(err instanceof Error ? err.message : "Could not load tasks.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void load();
    api<{ task_id: string; minutes: number }[]>("/rest/v1/time_entries?select=task_id,minutes&task_id=not.is.null&limit=5000", { auth: true })
      .then((rows) => {
        const m = new Map<string, number>();
        for (const r of rows) m.set(r.task_id, (m.get(r.task_id) ?? 0) + r.minutes);
        setLoggedBy(m);
      })
      .catch(() => undefined);
  }, [load]);

  const anyRunning = tasks.some((t) => t.timer_started_at);
  useEffect(() => {
    if (!anyRunning) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [anyRunning]);

  const byCol = (c: Status) => tasks.filter((t) => t.status === c).sort((a, b) => a.position - b.position);

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.status === "done").length;
    const doing = tasks.filter((t) => t.status === "doing").length;
    const blocked = tasks.filter((t) => t.status === "blocked").length;
    const openN = tasks.filter((t) => t.status !== "done").length;
    const planned = tasks.filter((t) => t.status !== "done").reduce((a, t) => a + (t.estimate_min ?? 0), 0);
    const next = tasks.filter((t) => t.status !== "done" && t.due_date).sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))[0];
    return { done, doing, blocked, openN, planned, next };
  }, [tasks]);

  async function move(id: string, status: Status, beforeId?: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (status === "done" && task.timer_started_at) void stopTimer(task);
    const col = tasks.filter((t) => t.status === status && t.id !== id).sort((a, b) => a.position - b.position);
    const idx = beforeId ? col.findIndex((t) => t.id === beforeId) : -1;
    const position = idx === -1 ? (col[col.length - 1]?.position ?? 0) + 1 : ((col[idx - 1]?.position ?? col[idx].position - 2) + col[idx].position) / 2;
    const previous = tasks;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status, position } : t)));
    try {
      await api(`/rest/v1/tasks?id=eq.${id}`, { method: "PATCH", body: { status, position, updated_at: new Date().toISOString() }, auth: true, prefer: "return=minimal" });
    } catch (err) {
      setTasks(previous);
      notify(err instanceof Error ? err.message : "Could not move the task. Run supabase/tasks-upgrade.sql first.", "error");
    }
  }

  async function stopTimer(t: Task, silent = false) {
    if (!t.timer_started_at) return;
    const started = new Date(t.timer_started_at);
    const secs = (Date.now() - started.getTime()) / 1000;
    const mins = secs >= 30 ? Math.min(1440, Math.max(1, Math.round(secs / 60))) : 0;
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, timer_started_at: null } : x)));
    try {
      await api(`/rest/v1/tasks?id=eq.${t.id}`, { method: "PATCH", body: { timer_started_at: null, updated_at: new Date().toISOString() }, auth: true, prefer: "return=minimal" });
      if (mins > 0) {
        await api("/rest/v1/time_entries", { method: "POST", body: { task_id: t.id, title: t.title.slice(0, 200), category: t.category, minutes: mins, day: localDay(started) }, auth: true, prefer: "return=minimal" });
        setLoggedBy((m) => new Map(m).set(t.id, (m.get(t.id) ?? 0) + mins));
        if (!silent) notify(`Logged ${minutes(mins)} on this task.`);
      } else if (!silent) {
        notify("Timer stopped. Under 30 seconds, so nothing was logged.");
      }
    } catch (err) {
      setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x)));
      notify(err instanceof Error ? err.message : "Could not stop the timer. Run supabase/tasks-upgrade.sql first.", "error");
    }
  }

  async function startTimer(t: Task) {
    for (const r of tasks.filter((x) => x.timer_started_at && x.id !== t.id)) await stopTimer(r, true);
    const at = new Date().toISOString();
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, timer_started_at: at } : x)));
    try {
      await api(`/rest/v1/tasks?id=eq.${t.id}`, { method: "PATCH", body: { timer_started_at: at, updated_at: at }, auth: true, prefer: "return=minimal" });
    } catch (err) {
      setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x)));
      notify(err instanceof Error ? err.message : "Could not start the timer. Run supabase/tasks-upgrade.sql first.", "error");
    }
  }

  const toggleTimer = (t: Task) => (t.timer_started_at ? stopTimer(t) : startTimer(t));

  async function save() {
    if (!draft) return;
    const title = draft.title.trim();
    if (!title) {
      notify("Give the task a title.", "error");
      return;
    }
    const est = parseInt(draft.estimate, 10);
    const body = {
      title: title.slice(0, 200),
      notes: draft.notes.trim(),
      priority: draft.priority,
      due_date: draft.due_date || null,
      category: draft.category,
      start_at: draft.start_at ? new Date(draft.start_at).toISOString() : null,
      status: draft.status,
      tags: draft.tags.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6),
      estimate_min: Number.isFinite(est) && est > 0 ? est : null,
      checklist: draft.checklist.filter((c) => c.t.trim()),
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      if (draft.id) {
        const rows = await api<(Task & { status: string })[]>(`/rest/v1/tasks?id=eq.${draft.id}`, { method: "PATCH", body, auth: true, prefer: "return=representation" });
        setTasks(tasks.map((t) => (t.id === draft.id ? normalise(rows[0]) : t)));
      } else {
        const last = Math.max(0, ...tasks.filter((t) => t.status === draft.status).map((t) => t.position));
        const rows = await api<(Task & { status: string })[]>("/rest/v1/tasks", { method: "POST", body: { ...body, position: last + 1 }, auth: true, prefer: "return=representation" });
        setTasks([...tasks, normalise(rows[0])]);
      }
      setDraft(null);
      notify("Task saved.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save the task. Run supabase/tasks-upgrade.sql first.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft?.id || !window.confirm("Delete this task? This cannot be undone.")) return;
    setSaving(true);
    try {
      await api(`/rest/v1/tasks?id=eq.${draft.id}`, { method: "DELETE", auth: true });
      setTasks(tasks.filter((t) => t.id !== draft.id));
      setDraft(null);
      notify("Task deleted.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not delete.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (missing && !loading) {
    return (
      <div className="a-empty a-card">
        <Icon name="board" size={34} />
        <h3>Task board needs one more setup step</h3>
        <p>Run supabase/admin-extras.sql, then supabase/tasks-upgrade.sql, in the Supabase SQL Editor and refresh this page.</p>
        <button className="a-btn a-btn--gold" onClick={() => void load()} type="button">
          Try again
        </button>
      </div>
    );
  }

  const checkDone = (t: Task) => t.checklist.filter((c) => c.d).length;

  // A plain render function (not a component) so the dragged element is not remounted mid-drag.
  const card = (t: Task) => {
    const due = dueState(t);
    const running = Boolean(t.timer_started_at);
    const secs = (loggedBy.get(t.id) ?? 0) * 60 + (running ? Math.max(0, (now - new Date(t.timer_started_at as string).getTime()) / 1000) : 0);
    return (
      <li
        className={[dragId === t.id ? "is-drag" : "", running ? "is-running" : ""].filter(Boolean).join(" ") || undefined}
        draggable
        key={t.id}
        onDragEnd={() => {
          setDragId(null);
          setOverCol(null);
        }}
        onDragOver={(e) => dragId && dragId !== t.id && e.preventDefault()}
        onDragStart={(e) => {
          setDragId(t.id);
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", t.id);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOverCol(null);
          if (dragId && dragId !== t.id) void move(dragId, t.status, t.id);
          setDragId(null);
        }}
      >
        <button className="tk-card" onClick={() => setDraft(toDraft(t))} type="button">
          <span className={`tk-state is-${t.status}`}>
            <i /> {COLS.find((c) => c.id === t.status)?.label}
          </span>
          <strong>{t.title}</strong>
          {t.notes ? <small>{t.notes}</small> : null}
          <span className="tk-chips">
            <span className={`tk-chip tk-chip--${t.priority}`}>{t.priority[0].toUpperCase() + t.priority.slice(1)}</span>
            {t.start_at ? <span className="tk-chip">Starts {startLabel(t.start_at)}</span> : null}
            {t.due_date ? <span className={`tk-chip${due ? ` tk-chip--${due}` : ""}`}>Due {dueShort(t.due_date)}</span> : null}
            {t.tags.map((g) => (
              <span className="tk-chip tk-chip--tag" key={g}>
                {g}
              </span>
            ))}
          </span>
          <span className="tk-foot">
            <span className={running ? "is-live" : undefined}>
              {timerText(secs, running)}
              {t.estimate_min ? <em> / {minutes(t.estimate_min)}</em> : null}
            </span>
            {t.checklist.length ? (
              <span>
                <Icon name="check" size={12} /> {checkDone(t)}/{t.checklist.length}
              </span>
            ) : null}
          </span>
        </button>
        {t.status !== "done" ? (
          <button aria-label={running ? `Pause timer for ${t.title}` : `Start timer for ${t.title}`} className={`tk-timer${running ? " is-on" : ""}`} onClick={() => void toggleTimer(t)} title={running ? "Pause and log time" : "Start timer"} type="button">
            <Icon name={running ? "pause" : "play"} size={18} />
          </button>
        ) : null}
      </li>
    );
  };

  return (
    <div className="tk">
      <header className="tk-head">
        <div>
          <h2>
            Tasks <sup>{tasks.length}</sup>
          </h2>
          <p>{view === "board" ? "Drag a card to another column to change its status" : "All tasks, newest status first"}</p>
        </div>
        <div className="tk-head__right">
          <div className="tk-toggle" role="group" aria-label="View">
            <button aria-pressed={view === "list"} onClick={() => setView("list")} type="button">
              <Icon name="content" size={15} /> List
            </button>
            <button aria-pressed={view === "board"} onClick={() => setView("board")} type="button">
              <Icon name="board" size={15} /> Board
            </button>
          </div>
          <button className="tk-new" onClick={() => setDraft(blank("open"))} type="button">
            <Icon name="plus" size={16} /> New task
          </button>
        </div>
      </header>

      <section aria-label="Task summary" className="tk-stats">
        <div>
          <small>Tasks done</small>
          <strong>
            {stats.done} / {tasks.length}
          </strong>
          <span aria-hidden="true" className="tk-bar">
            <i style={{ width: `${tasks.length ? (stats.done / tasks.length) * 100 : 0}%` }} />
          </span>
        </div>
        <div>
          <small>Time logged</small>
          <strong>{minutes(logged)}</strong>
          <span>{stats.planned ? `of ${minutes(stats.planned)} planned on open tasks` : "Log time from Insights"}</span>
        </div>
        <div>
          <small>In progress</small>
          <strong>{stats.doing}</strong>
          <span>
            {stats.blocked} blocked · {stats.openN} open
          </span>
        </div>
        <div>
          <small>Due</small>
          <strong>{stats.next?.due_date ? (dayDiff(stats.next.due_date) < 0 ? `${-dayDiff(stats.next.due_date)}d late` : dayDiff(stats.next.due_date) === 0 ? "today" : `in ${dayDiff(stats.next.due_date)} days`) : "none"}</strong>
          <span>{stats.next?.due_date ? new Date(`${stats.next.due_date}T12:00:00`).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" }) : "No deadlines set"}</span>
        </div>
      </section>

      {view === "board" ? (
        <div className="tk-board">
          {COLS.map((c) => {
            const list = byCol(c.id);
            return (
              <section
                aria-label={c.label}
                className={`tk-col${overCol === c.id ? " is-over" : ""}`}
                key={c.id}
                onDragLeave={() => setOverCol((o) => (o === c.id ? null : o))}
                onDragOver={(e) => {
                  if (dragId) {
                    e.preventDefault();
                    setOverCol(c.id);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setOverCol(null);
                  if (dragId) void move(dragId, c.id);
                  setDragId(null);
                }}
              >
                <header className="tk-col__head">
                  <h3>
                    <i className={`tk-dot is-${c.id}`} /> {c.label} <span>{list.length}</span>
                  </h3>
                </header>
                {list.length > 0 ? (
                  <ul>
                    {list.map(card)}
                  </ul>
                ) : null}
                <button className="tk-add" onClick={() => setDraft(blank(c.id))} type="button">
                  <Icon name="plus" size={15} /> Add
                </button>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="tk-list">
          {tasks.length === 0 ? (
            <p className="a-empty-sm">{loading ? "Loading..." : "No tasks yet. Use New task to add your first."}</p>
          ) : (
            COLS.flatMap((c) => byCol(c.id)).map((t) => (
              <button className="tk-row" key={t.id} onClick={() => setDraft(toDraft(t))} type="button">
                <span className={`tk-state is-${t.status}`}>
                  <i /> {COLS.find((c) => c.id === t.status)?.label}
                </span>
                <strong>{t.title}</strong>
                <span className={`tk-chip tk-chip--${t.priority}`}>{t.priority[0].toUpperCase() + t.priority.slice(1)}</span>
                <span className="tk-row__due">{t.start_at ? `Starts ${startLabel(t.start_at)}` : t.due_date ? `Due ${dueShort(t.due_date)}` : ""}</span>
              </button>
            ))
          )}
        </div>
      )}

      {draft ? (
        <div className="a-modal" role="dialog" aria-modal="true" aria-label={draft.id ? "Edit task" : "New task"}>
          <button aria-label="Close" className="a-modal__scrim" onClick={() => setDraft(null)} type="button" />
          <form
            className="a-card a-modal__box"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <h3>{draft.id ? "Edit task" : "New task"}</h3>
            <TextInput label="Title" onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Create privacy policy page" value={draft.title} />
            <TextArea label="Notes" onChange={(v) => setDraft({ ...draft, notes: v })} rows={3} value={draft.notes} />
            <div className="a-two">
              <label className="a-field">
                <span>Status</span>
                <select onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })} value={draft.status}>
                  {COLS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="a-field">
                <span>Priority</span>
                <select onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })} value={draft.priority}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="a-two">
              <TextInput label="Start time" onChange={(v) => setDraft({ ...draft, start_at: v })} type="datetime-local" value={draft.start_at} />
              <TextInput label="Due date" onChange={(v) => setDraft({ ...draft, due_date: v })} type="date" value={draft.due_date} />
            </div>
            <div className="a-two">
              <TextInput hint="Minutes" label="Time estimate" onChange={(v) => setDraft({ ...draft, estimate: v.replace(/\D/g, "") })} placeholder="45" value={draft.estimate} />
              <TextInput hint="Separate with commas" label="Tags" onChange={(v) => setDraft({ ...draft, tags: v })} placeholder="website, legal" value={draft.tags} />
            </div>
            <label className="a-field">
              <span>Category (used when the timer logs time)</span>
              <select onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })} value={draft.category}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="a-field">
              <span>Checklist</span>
              <ul className="tk-checks">
                {draft.checklist.map((c, i) => (
                  <li key={i}>
                    <input aria-label="Done" checked={c.d} onChange={(e) => setDraft({ ...draft, checklist: draft.checklist.map((x, n) => (n === i ? { ...x, d: e.target.checked } : x)) })} type="checkbox" />
                    <input aria-label="Checklist item" onChange={(e) => setDraft({ ...draft, checklist: draft.checklist.map((x, n) => (n === i ? { ...x, t: e.target.value } : x)) })} value={c.t} />
                    <button aria-label="Remove item" onClick={() => setDraft({ ...draft, checklist: draft.checklist.filter((_, n) => n !== i) })} type="button">
                      <Icon name="x" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="tk-checks__add">
                <input
                  onChange={(e) => setNewCheck(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCheck.trim()) {
                      e.preventDefault();
                      setDraft({ ...draft, checklist: [...draft.checklist, { t: newCheck.trim(), d: false }] });
                      setNewCheck("");
                    }
                  }}
                  placeholder="Add a step and press Enter"
                  value={newCheck}
                />
              </div>
            </div>

            <div className="a-actions">
              <button className="a-btn a-btn--gold" disabled={saving} type="submit">
                {saving ? "Saving..." : "Save task"}
              </button>
              <button className="a-btn a-btn--ghost" onClick={() => setDraft(null)} type="button">
                Cancel
              </button>
              {draft.id ? (
                <button className="a-btn a-btn--danger" disabled={saving} onClick={() => void remove()} type="button">
                  <Icon name="trash" size={16} /> Delete
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
