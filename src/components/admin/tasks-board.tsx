import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/supabase";
import { Icon, TextArea, TextInput, type Notify } from "./parts";

type Status = "todo" | "doing" | "done";
type Priority = "low" | "medium" | "high";
type Task = { id: string; title: string; notes: string; status: Status; priority: Priority; due_date: string | null; position: number; created_at: string };

const COLS: { id: Status; label: string; hint: string }[] = [
  { id: "todo", label: "To do", hint: "Waiting to start" },
  { id: "doing", label: "In progress", hint: "Being worked on" },
  { id: "done", label: "Done", hint: "Finished" },
];

const PRIORITIES: Priority[] = ["low", "medium", "high"];

function dueState(t: Task): "late" | "soon" | "" {
  if (!t.due_date || t.status === "done") return "";
  const today = new Date().toISOString().slice(0, 10);
  if (t.due_date < today) return "late";
  const soon = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10);
  return t.due_date <= soon ? "soon" : "";
}

function dueLabel(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

type Draft = { id?: string; title: string; notes: string; priority: Priority; due_date: string; status: Status };

export function TasksBoard({ notify }: { notify: Notify }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await api<Task[]>("/rest/v1/tasks?select=*&order=position.asc,created_at.asc", { auth: true }));
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tasks.filter((t) => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)) : tasks;
  }, [tasks, query]);

  const byCol = (c: Status) => visible.filter((t) => t.status === c).sort((a, b) => a.position - b.position);
  const open = tasks.filter((t) => t.status !== "done").length;
  const late = tasks.filter((t) => dueState(t) === "late").length;

  async function move(id: string, status: Status, beforeId?: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const col = tasks.filter((t) => t.status === status && t.id !== id).sort((a, b) => a.position - b.position);
    let position: number;
    const idx = beforeId ? col.findIndex((t) => t.id === beforeId) : -1;
    if (idx === -1) position = (col[col.length - 1]?.position ?? 0) + 1;
    else position = ((col[idx - 1]?.position ?? col[idx].position - 2) + col[idx].position) / 2;
    if (task.status === status && idx === -1 && col.length === 0) position = task.position;
    const previous = tasks;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status, position } : t)));
    try {
      await api(`/rest/v1/tasks?id=eq.${id}`, { method: "PATCH", body: { status, position, updated_at: new Date().toISOString() }, auth: true, prefer: "return=minimal" });
    } catch (err) {
      setTasks(previous);
      notify(err instanceof Error ? err.message : "Could not move the task.", "error");
    }
  }

  async function save() {
    if (!draft) return;
    const title = draft.title.trim();
    if (!title) {
      notify("Give the task a title.", "error");
      return;
    }
    const body = { title: title.slice(0, 200), notes: draft.notes.trim(), priority: draft.priority, due_date: draft.due_date || null, status: draft.status, updated_at: new Date().toISOString() };
    setSaving(true);
    try {
      if (draft.id) {
        const rows = await api<Task[]>(`/rest/v1/tasks?id=eq.${draft.id}`, { method: "PATCH", body, auth: true, prefer: "return=representation" });
        setTasks(tasks.map((t) => (t.id === draft.id ? rows[0] : t)));
      } else {
        const last = Math.max(0, ...tasks.filter((t) => t.status === draft.status).map((t) => t.position));
        const rows = await api<Task[]>("/rest/v1/tasks", { method: "POST", body: { ...body, position: last + 1 }, auth: true, prefer: "return=representation" });
        setTasks([...tasks, rows[0]]);
      }
      setDraft(null);
      notify("Task saved.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save the task.", "error");
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
        <p>Run supabase/admin-extras.sql in the Supabase SQL Editor, then refresh this page.</p>
        <button className="a-btn a-btn--gold" onClick={() => void load()} type="button">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="a-tasks">
      <div className="a-toolbar">
        <label className="a-search">
          <Icon name="search" size={16} />
          <input aria-label="Search tasks" onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks..." type="search" value={query} />
        </label>
        <p className="a-tasks__sum">
          <b>{open}</b> open{late > 0 ? <span className="a-tasks__late"> · {late} overdue</span> : null}
        </p>
        <button className="a-btn a-btn--gold" onClick={() => setDraft({ title: "", notes: "", priority: "medium", due_date: "", status: "todo" })} type="button">
          <Icon name="plus" size={16} /> New task
        </button>
      </div>

      <div className="a-board">
        {COLS.map((c) => {
          const list = byCol(c.id);
          return (
            <section
              aria-label={c.label}
              className={`a-col${overCol === c.id ? " is-over" : ""}`}
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
              <header className="a-col__head">
                <h3>
                  <i className={`a-col__dot is-${c.id}`} /> {c.label}
                </h3>
                <span>{list.length}</span>
              </header>
              <ul>
                {list.map((t) => {
                  const due = dueState(t);
                  const i = COLS.findIndex((x) => x.id === t.status);
                  return (
                    <li
                      className={dragId === t.id ? "is-drag" : undefined}
                      draggable
                      key={t.id}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      onDragStart={(e) => {
                        setDragId(t.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", t.id);
                      }}
                      onDragOver={(e) => dragId && dragId !== t.id && e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOverCol(null);
                        if (dragId && dragId !== t.id) void move(dragId, c.id, t.id);
                        setDragId(null);
                      }}
                    >
                      <button className="a-task" onClick={() => setDraft({ id: t.id, title: t.title, notes: t.notes, priority: t.priority, due_date: t.due_date ?? "", status: t.status })} type="button">
                        <span className={`a-prio is-${t.priority}`}>{t.priority}</span>
                        <strong>{t.title}</strong>
                        {t.notes ? <small>{t.notes}</small> : null}
                        {t.due_date ? <em className={due ? `is-${due}` : undefined}>Due {dueLabel(t.due_date)}</em> : null}
                      </button>
                      <div className="a-task__move">
                        <button aria-label="Move left" disabled={i === 0} onClick={() => void move(t.id, COLS[i - 1].id)} type="button">
                          &larr;
                        </button>
                        <button aria-label="Move right" disabled={i === COLS.length - 1} onClick={() => void move(t.id, COLS[i + 1].id)} type="button">
                          &rarr;
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {list.length === 0 ? <p className="a-col__empty">{loading ? "Loading..." : tasks.length === 0 && c.id === "todo" ? "Add your first task. Try \"Call back new enquiries\"." : c.hint}</p> : null}
              <button className="a-col__add" onClick={() => setDraft({ title: "", notes: "", priority: "medium", due_date: "", status: c.id })} type="button">
                <Icon name="plus" size={15} /> Add task
              </button>
            </section>
          );
        })}
      </div>

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
            <TextInput label="Title" onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Call back the Hamilton enquiry" value={draft.title} />
            <TextArea label="Notes" onChange={(v) => setDraft({ ...draft, notes: v })} rows={3} value={draft.notes} />
            <div className="a-two">
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
              <TextInput label="Due date" onChange={(v) => setDraft({ ...draft, due_date: v })} type="date" value={draft.due_date} />
            </div>
            <label className="a-field">
              <span>Column</span>
              <select onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })} value={draft.status}>
                {COLS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
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
