import { useEffect, useMemo, useState } from "react";

import { api, formatDate, type Enquiry, type EnquiryStatus } from "@/lib/supabase";
import { Icon, initials, timeAgo, type Notify } from "./parts";

type Filter = "all" | EnquiryStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "closed", label: "Closed" },
];

function csvCell(v: string) {
  return `"${v.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

export function EnquiriesManager({ enquiries, onChange, notify, focusId }: { enquiries: Enquiry[]; onChange: (next: Enquiry[]) => void; notify: Notify; focusId: string | null }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(focusId);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = enquiries.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    if (focusId) setSelectedId(focusId);
  }, [focusId]);

  useEffect(() => {
    setNotes(selected?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!q) return true;
      return [e.name, e.email, e.phone, e.package, e.area, e.message].some((f) => f.toLowerCase().includes(q));
    });
  }, [enquiries, filter, query]);

  const counts: Record<Filter, number> = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    contacted: enquiries.filter((e) => e.status === "contacted").length,
    closed: enquiries.filter((e) => e.status === "closed").length,
  };

  function replace(updated: Enquiry) {
    onChange(enquiries.map((e) => (e.id === updated.id ? updated : e)));
  }

  async function patch(id: string, body: Partial<Pick<Enquiry, "status" | "notes">>, message: string) {
    setBusy(true);
    try {
      const rows = await api<Enquiry[]>(`/rest/v1/enquiries?id=eq.${id}`, { method: "PATCH", body, auth: true, prefer: "return=representation" });
      if (rows[0]) replace(rows[0]);
      notify(message);
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(e: Enquiry) {
    if (!window.confirm(`Delete the enquiry from ${e.name}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api(`/rest/v1/enquiries?id=eq.${e.id}`, { method: "DELETE", auth: true });
      onChange(enquiries.filter((x) => x.id !== e.id));
      setSelectedId(null);
      notify("Enquiry deleted.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not delete.", "error");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const head = ["Date", "Name", "Email", "Phone", "Package", "Area", "Status", "Message", "Notes"];
    const rows = list.map((e) => [e.created_at, e.name, e.email, e.phone, e.package, e.area, e.status, e.message, e.notes]);
    const csv = [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `upca-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`a-split${selected ? " has-selection" : ""}`}>
      <section className="a-pane a-pane--list">
        <div className="a-toolbar">
          <label className="a-search">
            <Icon name="search" size={16} />
            <input aria-label="Search enquiries" onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, area..." type="search" value={query} />
          </label>
          <button aria-label="Export visible enquiries to CSV" className="a-iconbtn" disabled={list.length === 0} onClick={exportCsv} title="Export CSV" type="button">
            <Icon name="download" />
          </button>
        </div>
        <div className="a-tabs" role="tablist">
          {FILTERS.map((f) => (
            <button aria-selected={filter === f.id} key={f.id} onClick={() => setFilter(f.id)} role="tab" type="button">
              {f.label} <b>{counts[f.id]}</b>
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <div className="a-empty">
            <Icon name="inbox" size={34} />
            <h3>{enquiries.length === 0 ? "No enquiries yet" : "Nothing matches"}</h3>
            <p>{enquiries.length === 0 ? "When someone sends the contact form on your website, it lands here." : "Try a different filter or search."}</p>
          </div>
        ) : (
          <ul className="a-list a-list--rows">
            {list.map((e) => (
              <li key={e.id}>
                <button aria-current={e.id === selectedId} className={e.status === "new" ? "is-unread" : undefined} onClick={() => setSelectedId(e.id)} type="button">
                  <span className="a-avatar">{initials(e.name)}</span>
                  <span className="a-list__main">
                    <strong>{e.name}</strong>
                    <small>{e.message || e.package || e.email}</small>
                  </span>
                  <span className="a-list__meta">
                    <time>{timeAgo(e.created_at)}</time>
                    <span className={`a-dot is-${e.status}`} title={e.status} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="a-pane a-pane--detail">
        {!selected ? (
          <div className="a-empty">
            <Icon name="mail" size={34} />
            <h3>Select an enquiry</h3>
            <p>Pick one from the list to read the message and reply.</p>
          </div>
        ) : (
          <article className="a-detail">
            <button className="a-link a-detail__back" onClick={() => setSelectedId(null)} type="button">
              &larr; Back to list
            </button>
            <header className="a-detail__head">
              <span className="a-avatar a-avatar--lg">{initials(selected.name)}</span>
              <div>
                <h2>{selected.name}</h2>
                <p>
                  Received {formatDate(selected.created_at, true)} · {timeAgo(selected.created_at)}
                </p>
              </div>
              <span className={`a-pill is-${selected.status}`}>{selected.status}</span>
            </header>

            <div className="a-actions">
              <a className="a-btn a-btn--gold" href={`mailto:${selected.email}?subject=${encodeURIComponent("Your UPCA consultation request")}`}>
                <Icon name="mail" size={16} /> Reply by email
              </a>
              {selected.phone ? (
                <a className="a-btn a-btn--ghost" href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}>
                  <Icon name="phone" size={16} /> Call
                </a>
              ) : null}
            </div>

            <dl className="a-facts">
              <div>
                <dt>Email</dt>
                <dd>{selected.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{selected.phone || "Not given"}</dd>
              </div>
              <div>
                <dt>Package</dt>
                <dd>{selected.package || "Not sure yet"}</dd>
              </div>
              <div>
                <dt>Property or area</dt>
                <dd>{selected.area || "Not given"}</dd>
              </div>
            </dl>

            <h3 className="a-sub">Message</h3>
            <p className="a-message">{selected.message || "No message was added."}</p>

            <h3 className="a-sub">Status</h3>
            <div className="a-seg a-seg--wide" role="group" aria-label="Status">
              {(["new", "contacted", "closed"] as const).map((s) => (
                <button aria-pressed={selected.status === s} disabled={busy} key={s} onClick={() => selected.status !== s && patch(selected.id, { status: s }, `Marked as ${s}.`)} type="button">
                  {s}
                </button>
              ))}
            </div>

            <h3 className="a-sub">Private notes</h3>
            <label className="a-field">
              <span className="a-sr">Private notes</span>
              <textarea onChange={(e) => setNotes(e.target.value)} placeholder="Call back Tuesday, wants Pro Plus, has a drone shoot in mind..." rows={4} value={notes} />
            </label>
            <div className="a-actions">
              <button className="a-btn a-btn--ghost" disabled={busy || notes === selected.notes} onClick={() => patch(selected.id, { notes }, "Notes saved.")} type="button">
                <Icon name="save" size={16} /> Save notes
              </button>
              <button className="a-btn a-btn--danger" disabled={busy} onClick={() => remove(selected)} type="button">
                <Icon name="trash" size={16} /> Delete
              </button>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
