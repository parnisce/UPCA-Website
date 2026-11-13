import { useCallback, useEffect, useMemo, useState } from "react";

import { api, type Enquiry } from "@/lib/supabase";
import { Icon } from "./parts";

type Summary = {
  views: number;
  visitors: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  referrers: { source: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
};

const RANGES = [7, 30, 90] as const;
const TZ = "America/Toronto";
const DAY = 86_400_000;

const ymd = (t: number) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(t));

const PAGE_NAMES: Record<string, string> = { "/": "Homepage", "/contact": "Contact", "/services": "Services", "/blog": "Blog", "/book-free-consultation": "Book a consultation" };
const pageName = (p: string) => PAGE_NAMES[p] ?? p.replace(/^\/services\//, "Service: ").replace(/^\/blog\//, "Post: ").replace(/-/g, " ");

function List({ rows, total, empty }: { rows: [string, number][]; total: number; empty: string }) {
  if (rows.length === 0) return <p className="a-empty-sm">{empty}</p>;
  return (
    <ul className="a-bars">
      {rows.map(([name, n]) => (
        <li key={name}>
          <span title={name}>{name}</span>
          <div>
            <i style={{ width: `${(n / Math.max(1, rows[0][1])) * 100}%` }} />
          </div>
          <b>{total ? `${Math.round((n / total) * 100)}%` : n}</b>
        </li>
      ))}
    </ul>
  );
}

export function Analytics({ enquiries }: { enquiries: Enquiry[] }) {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<Summary | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      setData(await api<Summary>("/rest/v1/rpc/analytics_summary", { method: "POST", body: { days: range }, auth: true }));
      setState("ready");
    } catch {
      setState("missing");
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  const series = useMemo(() => {
    const map = new Map((data?.daily ?? []).map((d) => [d.day, d]));
    const now = Date.now();
    return Array.from({ length: range }, (_, i) => {
      const day = ymd(now - (range - 1 - i) * DAY);
      const hit = map.get(day);
      return { day, views: hit?.views ?? 0, visitors: hit?.visitors ?? 0 };
    });
  }, [data, range]);

  if (state === "missing") {
    return (
      <div className="a-empty a-card">
        <Icon name="chart" size={34} />
        <h3>Analytics needs one more setup step</h3>
        <p>Run supabase/admin-extras.sql in the Supabase SQL Editor. Visits are counted from that moment on.</p>
        <button className="a-btn a-btn--gold" onClick={() => void load()} type="button">
          Try again
        </button>
      </div>
    );
  }

  const views = data?.views ?? 0;
  const visitors = data?.visitors ?? 0;
  const since = Date.now() - range * DAY;
  const leads = enquiries.filter((e) => new Date(e.created_at).getTime() >= since).length;
  const max = Math.max(1, ...series.map((d) => d.views));
  const W = 760;
  const H = 230;
  const padL = 30;
  const padB = 26;
  const plotW = W - padL - 6;
  const plotH = H - padB - 12;
  const bw = plotW / series.length;
  const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, Math.round(max / 2), max];
  const labelEvery = range === 7 ? 1 : range === 30 ? 5 : 14;
  const line = series.map((d, i) => `${padL + i * bw + bw / 2},${12 + plotH - (d.visitors / max) * plotH}`).join(" ");
  const devTotal = (data?.devices ?? []).reduce((a, d) => a + d.visitors, 0);
  const refTotal = (data?.referrers ?? []).reduce((a, d) => a + d.visitors, 0);

  return (
    <div className="a-dash">
      <section className="a-hero">
        <div>
          <p className="a-eyebrow">Website traffic</p>
          <h2>
            Who is visiting <span>your site</span>
          </h2>
          <p>Anonymous visit counts, collected without cookies or personal data. Counting starts from the day you set this up.</p>
        </div>
        <div className="a-seg" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button aria-pressed={range === r} key={r} onClick={() => setRange(r)} type="button">
              {r} days
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Traffic numbers" className="a-stats">
        <div className="a-stat">
          <span className="a-stat__icon"><Icon name="users" size={20} /></span>
          <div><small>Visitors</small><strong>{state === "loading" ? "-" : visitors}</strong><em>Unique visits</em></div>
        </div>
        <div className="a-stat">
          <span className="a-stat__icon"><Icon name="eye" size={20} /></span>
          <div><small>Page views</small><strong>{state === "loading" ? "-" : views}</strong><em>{visitors ? `${(views / visitors).toFixed(1)} pages per visit` : "No visits yet"}</em></div>
        </div>
        <div className="a-stat">
          <span className="a-stat__icon"><Icon name="inbox" size={20} /></span>
          <div><small>Enquiries</small><strong>{leads}</strong><em>In the same period</em></div>
        </div>
        <div className="a-stat">
          <span className="a-stat__icon"><Icon name="spark" size={20} /></span>
          <div><small>Visitor to enquiry</small><strong>{visitors ? `${((leads / visitors) * 100).toFixed(1)}%` : "-"}</strong><em>Share who got in touch</em></div>
        </div>
      </section>

      <div className="a-grid">
        <section className="a-card a-card--wide">
          <header className="a-card__head">
            <div>
              <h3>Traffic over time</h3>
              <p>
                <span className="a-key a-key--bar" /> Page views <span className="a-key a-key--line" /> Visitors
              </p>
            </div>
          </header>
          <svg aria-label={`Chart of page views and visitors per day for the last ${range} days`} className="a-chart" role="img" viewBox={`0 0 ${W} ${H}`}>
            {ticks.map((t) => {
              const y = 12 + plotH - (t / max) * plotH;
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
              const h = (d.views / max) * plotH;
              const w = Math.max(2, bw * 0.66);
              const x = padL + i * bw + (bw - w) / 2;
              const hh = Math.max(h, d.views === 0 ? 2 : 3);
              return (
                <g key={d.day}>
                  <rect className={`a-chart__bar${d.views === 0 ? " is-zero" : ""}`} height={hh} rx={Math.min(4, w / 2)} style={{ ["--i" as string]: Math.min(i, 30) }} width={w} x={x} y={12 + plotH - hh}>
                    <title>{`${d.day}: ${d.views} views, ${d.visitors} visitors`}</title>
                  </rect>
                  {i % labelEvery === 0 ? (
                    <text className="a-chart__tick" textAnchor="middle" x={x + w / 2} y={H - 6}>
                      {d.day.slice(5)}
                    </text>
                  ) : null}
                </g>
              );
            })}
            <polyline className="a-chart__line" fill="none" points={line} />
          </svg>
        </section>

        <section className="a-card">
          <header className="a-card__head"><div><h3>Devices</h3><p>Share of visitors</p></div></header>
          <List empty="No visits recorded yet." rows={(data?.devices ?? []).map((d) => [d.device.charAt(0).toUpperCase() + d.device.slice(1), d.visitors])} total={devTotal} />
          <h4 className="a-sub">Where visitors come from</h4>
          <List empty="No visits recorded yet." rows={(data?.referrers ?? []).map((r) => [r.source, r.visitors])} total={refTotal} />
        </section>

        <section className="a-card a-card--wide">
          <header className="a-card__head"><div><h3>Top pages</h3><p>Most viewed in this period</p></div></header>
          {(data?.pages ?? []).length === 0 ? (
            <p className="a-empty-sm">{state === "loading" ? "Loading..." : "No visits recorded yet. Open your website in another tab and refresh this page."}</p>
          ) : (
            <table className="a-table">
              <thead>
                <tr><th>Page</th><th>Views</th><th>Visitors</th></tr>
              </thead>
              <tbody>
                {data!.pages.map((p) => (
                  <tr key={p.path}>
                    <td><a className="a-link" href={p.path} rel="noopener noreferrer" target="_blank">{pageName(p.path)}</a> <small>{p.path}</small></td>
                    <td>{p.views}</td>
                    <td>{p.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
