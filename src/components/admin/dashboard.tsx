import { useMemo, useState } from "react";

import { formatDate, type Enquiry, type Post } from "@/lib/supabase";
import type { View } from "./admin-app";
import { Icon, initials, timeAgo, type IconName } from "./parts";

const DAY = 86_400_000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Stat({ icon, label, value, sub, tone, delay }: { icon: IconName; label: string; value: string | number; sub: string; tone?: "up" | "down" | "flat"; delay: number }) {
  return (
    <div className="a-stat" style={{ ["--d" as string]: `${delay}ms` }}>
      <span className="a-stat__icon">
        <Icon name={icon} size={20} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <em className={tone ? `is-${tone}` : undefined}>{sub}</em>
      </div>
    </div>
  );
}

export function Dashboard({ email, enquiries, posts, loading, go }: { email: string; enquiries: Enquiry[]; posts: Post[]; loading: boolean; go: (v: View, id?: string) => void }) {
  const [range, setRange] = useState<14 | 30>(14);

  const stats = useMemo(() => {
    const now = Date.now();
    const total = enquiries.length;
    const fresh = enquiries.filter((e) => e.status === "new").length;
    const thisWeek = enquiries.filter((e) => now - new Date(e.created_at).getTime() < 7 * DAY).length;
    const lastWeek = enquiries.filter((e) => {
      const age = now - new Date(e.created_at).getTime();
      return age >= 7 * DAY && age < 14 * DAY;
    }).length;
    const published = posts.filter((p) => p.published).length;
    const handled = enquiries.filter((e) => e.status !== "new").length;
    return { total, fresh, thisWeek, lastWeek, published, drafts: posts.length - published, rate: total ? Math.round((handled / total) * 100) : 0 };
  }, [enquiries, posts]);

  const series = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    const days = Array.from({ length: range }, (_, i) => {
      const t = today - (range - 1 - i) * DAY;
      return { t, count: 0 };
    });
    for (const e of enquiries) {
      const day = startOfDay(new Date(e.created_at)).getTime();
      const idx = Math.round((day - days[0].t) / DAY);
      if (idx >= 0 && idx < days.length) days[idx].count++;
    }
    return days;
  }, [enquiries, range]);

  const byPackage = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of enquiries) m.set(e.package || "Not sure yet", (m.get(e.package || "Not sure yet") ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [enquiries]);

  const delta = stats.thisWeek - stats.lastWeek;
  const max = Math.max(1, ...series.map((d) => d.count));
  const W = 640;
  const H = 210;
  const padL = 28;
  const padB = 26;
  const plotW = W - padL - 6;
  const plotH = H - padB - 10;
  const bw = plotW / series.length;
  const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, Math.round(max / 2), max];
  const periodTotal = series.reduce((a, d) => a + d.count, 0);

  const recent = enquiries.slice(0, 5);
  const recentPosts = posts.slice(0, 4);
  const statusTotal = Math.max(1, stats.total);
  const counts = { new: stats.fresh, contacted: enquiries.filter((e) => e.status === "contacted").length, closed: enquiries.filter((e) => e.status === "closed").length };

  return (
    <div className="a-dash">
      <section className="a-hero">
        <div>
          <p className="a-eyebrow">{new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h2>
            {greeting()}, <span>{email.split("@")[0]}</span>
          </h2>
          <p>
            {loading
              ? "Loading your latest numbers..."
              : stats.fresh > 0
                ? `You have ${stats.fresh} new ${stats.fresh === 1 ? "enquiry" : "enquiries"} waiting for a reply.`
                : "You are all caught up. No new enquiries waiting."}
          </p>
        </div>
        <div className="a-hero__actions">
          <button className="a-btn a-btn--gold" onClick={() => go("posts")} type="button">
            <Icon name="plus" size={16} /> New blog post
          </button>
          <button className="a-btn a-btn--ghost" onClick={() => go("content")} type="button">
            <Icon name="content" size={16} /> Edit homepage
          </button>
        </div>
      </section>

      <section aria-label="Key numbers" className="a-stats">
        <Stat delay={0} icon="inbox" label="Total enquiries" sub={`${stats.rate}% followed up`} value={stats.total} />
        <Stat delay={70} icon="spark" label="New, unread" sub={stats.fresh > 0 ? "Needs a reply" : "All handled"} tone={stats.fresh > 0 ? "down" : "up"} value={stats.fresh} />
        <Stat delay={140} icon="users" label="Last 7 days" sub={delta === 0 ? "Same as the week before" : `${delta > 0 ? "+" : ""}${delta} vs the week before`} tone={delta > 0 ? "up" : delta < 0 ? "down" : "flat"} value={stats.thisWeek} />
        <Stat delay={210} icon="posts" label="Published posts" sub={`${stats.drafts} ${stats.drafts === 1 ? "draft" : "drafts"}`} value={stats.published} />
      </section>

      <div className="a-grid">
        <section className="a-card a-card--wide">
          <header className="a-card__head">
            <div>
              <h3>Enquiries over time</h3>
              <p>
                {periodTotal} in the last {range} days
              </p>
            </div>
            <div className="a-seg" role="group" aria-label="Date range">
              {([14, 30] as const).map((r) => (
                <button aria-pressed={range === r} key={r} onClick={() => setRange(r)} type="button">
                  {r} days
                </button>
              ))}
            </div>
          </header>
          <svg aria-label={`Bar chart of enquiries per day for the last ${range} days`} className="a-chart" role="img" viewBox={`0 0 ${W} ${H}`}>
            {ticks.map((t) => {
              const y = 10 + plotH - (t / max) * plotH;
              return (
                <g key={t}>
                  <line className="a-chart__grid" x1={padL} x2={W - 6} y1={y} y2={y} />
                  <text className="a-chart__tick" textAnchor="end" x={padL - 6} y={y + 4}>
                    {t}
                  </text>
                </g>
              );
            })}
            {series.map((d, i) => {
              const h = (d.count / max) * plotH;
              const x = padL + i * bw + bw * 0.18;
              const w = bw * 0.64;
              const label = new Date(d.t).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
              const showLabel = range === 14 ? i % 2 === 0 : i % 5 === 0;
              return (
                <g key={d.t}>
                  <rect className="a-chart__ghost" height={plotH} rx={4} width={w} x={x} y={10} />
                  <rect className={`a-chart__bar${d.count === 0 ? " is-zero" : ""}`} height={Math.max(h, d.count === 0 ? 2 : 4)} rx={4} style={{ ["--i" as string]: i }} width={w} x={x} y={10 + plotH - Math.max(h, d.count === 0 ? 2 : 4)}>
                    <title>{`${label}: ${d.count} ${d.count === 1 ? "enquiry" : "enquiries"}`}</title>
                  </rect>
                  {showLabel ? (
                    <text className="a-chart__tick" textAnchor="middle" x={x + w / 2} y={H - 6}>
                      {label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </section>

        <section className="a-card">
          <header className="a-card__head">
            <div>
              <h3>Pipeline</h3>
              <p>Where enquiries stand</p>
            </div>
          </header>
          <div aria-hidden="true" className="a-stack">
            <i className="is-new" style={{ width: `${(counts.new / statusTotal) * 100}%` }} />
            <i className="is-contacted" style={{ width: `${(counts.contacted / statusTotal) * 100}%` }} />
            <i className="is-closed" style={{ width: `${(counts.closed / statusTotal) * 100}%` }} />
          </div>
          <ul className="a-legend">
            <li>
              <i className="is-new" /> New <b>{counts.new}</b>
            </li>
            <li>
              <i className="is-contacted" /> Contacted <b>{counts.contacted}</b>
            </li>
            <li>
              <i className="is-closed" /> Closed <b>{counts.closed}</b>
            </li>
          </ul>
          <h4 className="a-sub">Popular packages</h4>
          {byPackage.length === 0 ? (
            <p className="a-empty-sm">Package interest shows up here once enquiries arrive.</p>
          ) : (
            <ul className="a-bars">
              {byPackage.map(([name, n]) => (
                <li key={name}>
                  <span>{name}</span>
                  <div>
                    <i style={{ width: `${(n / byPackage[0][1]) * 100}%` }} />
                  </div>
                  <b>{n}</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card a-card--wide">
          <header className="a-card__head">
            <div>
              <h3>Latest enquiries</h3>
              <p>Tap one to reply</p>
            </div>
            <button className="a-link" onClick={() => go("enquiries")} type="button">
              View all
            </button>
          </header>
          {recent.length === 0 ? (
            <p className="a-empty-sm">No enquiries yet. They will appear here the moment someone fills in your contact form.</p>
          ) : (
            <ul className="a-list">
              {recent.map((e) => (
                <li key={e.id}>
                  <button onClick={() => go("enquiries", e.id)} type="button">
                    <span className="a-avatar">{initials(e.name)}</span>
                    <span className="a-list__main">
                      <strong>{e.name}</strong>
                      <small>{e.package || "Package not chosen"}{e.area ? ` · ${e.area}` : ""}</small>
                    </span>
                    <span className={`a-pill is-${e.status}`}>{e.status}</span>
                    <time>{timeAgo(e.created_at)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card">
          <header className="a-card__head">
            <div>
              <h3>Blog</h3>
              <p>Recent posts</p>
            </div>
            <button className="a-link" onClick={() => go("posts")} type="button">
              Manage
            </button>
          </header>
          {recentPosts.length === 0 ? (
            <p className="a-empty-sm">No posts yet. Your first one takes a couple of minutes.</p>
          ) : (
            <ul className="a-list a-list--tight">
              {recentPosts.map((p) => (
                <li key={p.id}>
                  <button onClick={() => go("posts")} type="button">
                    <span className="a-list__main">
                      <strong>{p.title}</strong>
                      <small>{p.published ? `Published ${formatDate(p.published_at)}` : "Draft"}</small>
                    </span>
                    <span className={`a-pill ${p.published ? "is-contacted" : "is-new"}`}>{p.published ? "live" : "draft"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
