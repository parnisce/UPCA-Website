import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/supabase";
import { Icon, TextArea, TextInput, type Notify } from "./parts";

type Status = "open" | "doing" | "blocked" | "done";
type Priority = "low" | "medium" | "high";
type Check = { t: string; d: boolean };
type Task = {
  id: string;
  title: string;
  notes: string;
  status: Status;
  priority: Priority;
  due_date: string | null;
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
const DAY = 86_400_000;

function normalise(t: Task & { status: string }): Task {
  return { ...t, status: (t.status === "todo" ? "open" : t.status) as Status, tags: t.tags ?? [], checklist: t.checklist ?? [], estimate_min: t.estimate_min ?? null };
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const dayDiff = (d: string) => Math.round((new Date(`${d}T12:00:00`).getTime() - new Date(`${todayStr()}T12:00:00`).getTime()) / DAY);

function dueState(t: Task): "late" | "soon" | "" {
  if (!t.due_date || t.status === "done") return "";
  const n = dayDiff(t.due_date);
  return n < 0 ? "late" : n <= 2 ? "soon" : "";
}

const dueShort = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

function minutes(n: number) {
  const h = Math.floor(n / 60);
  const m = n % 60;
  return h ? (m ? `${h}H ${m}M` : `${h}H`) : `${m}M`;
}

type Draft = { id?: string; title: string; notes: string; priority: Priority; due_date: string; status: Status; tags: string; estimate: string; checklist: Check[] };

const blank = (status: Status): Draft => ({ title: "", notes: "", priority: "medium", due_date: "", status, tags: "", estimate: "", checklist: [] });

function toDraft(t: Task): Draft {
  return { id: t.id, title: t.title, notes: t.notes, priority: t.priority, due_date: t.due_date ?? "", status: t.status, tags: t.tags.join(", "), estimate: t.estimate_min ? String(t.estimate_min) : "", checklist: t.checklist };
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
  }, [load]);

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
    return (
      <li
        className={dragId === t.id ? "is-drag" : undefined}
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
            {t.due_date ? <span className={`tk-chip${due ? ` tk-chip--${due}` : ""}`}>Due {dueShort(t.due_date)}</span> : null}
            {t.tags.map((g) => (
              <span className="tk-chip tk-chip--tag" key={g}>
                {g}
              </span>
            ))}
          </span>
          {t.estimate_min || t.checklist.length ? (
            <span className="tk-foot">
              {t.estimate_min ? <span>{minutes(t.estimate_min)}</span> : null}
              {t.checklist.length ? (
                <span>
                  <Icon name="check" size={12} /> {checkDone(t)}/{t.checklist.length}
                </span>
              ) : null}
            </span>
          ) : null}
        </button>
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
          <small>Time planned</small>
          <strong>{stats.planned ? minutes(stats.planned) : "0M"}</strong>
          <span>{stats.planned ? "Across open tasks" : "Add estimates to track against"}</span>
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
                <span className="tk-row__due">{t.due_date ? `Due ${dueShort(t.due_date)}` : ""}</span>
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
              <TextInput label="Due date" onChange={(v) => setDraft({ ...draft, due_date: v })} type="date" value={draft.due_date} />
              <TextInput hint="Minutes" label="Time estimate" onChange={(v) => setDraft({ ...draft, estimate: v.replace(/\D/g, "") })} placeholder="45" value={draft.estimate} />
            </div>
            <TextInput hint="Separate with commas" label="Tags" onChange={(v) => setDraft({ ...draft, tags: v })} placeholder="website, legal" value={draft.tags} />

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
