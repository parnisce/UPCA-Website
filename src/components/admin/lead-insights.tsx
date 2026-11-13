import { useMemo } from "react";

import type { Enquiry, Post } from "@/lib/supabase";
import type { View } from "./admin-app";
import { Icon, timeAgo, type IconName } from "./parts";

const DAY = 86_400_000;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Tip = { icon: IconName; title: string; text: string; go?: { view: View; label: string } };

function bookingTime(e: Enquiry): number | null {
  if (!e.source.startsWith("book:")) return null;
  const t = new Date(e.source.slice(5)).getTime();
  return Number.isNaN(t) ? null : t;
}

function sourceLabel(s: string) {
  if (s.startsWith("book:") || s === "/book-free-consultation") return "Booking page";
  if (s === "/contact") return "Contact page";
  if (s === "/" || s === "website" || s === "") return "Homepage";
  if (s.startsWith("/services")) return "Service pages";
  return "Other";
}

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}

function Bars({ rows, empty }: { rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  if (rows.every((r) => r[1] === 0)) return <p className="a-empty-sm">{empty}</p>;
  return (
    <ul className="a-bars">
      {rows.map(([name, n]) => (
        <li key={name}>
          <span>{name}</span>
          <div>
            <i style={{ width: `${(n / max) * 100}%` }} />
          </div>
          <b>{n}</b>
        </li>
      ))}
    </ul>
  );
}

export function LeadInsights({ enquiries, posts, go }: { enquiries: Enquiry[]; posts: Post[]; go: (v: View, id?: string) => void }) {
  const d = useMemo(() => {
    const now = Date.now();
    const total = enquiries.length;
    const byDay = Array.from({ length: 7 }, () => 0);
    const byBlock: Record<string, number> = { "Morning (6am-12pm)": 0, "Afternoon (12pm-5pm)": 0, "Evening (5pm-10pm)": 0, "Night (10pm-6am)": 0 };
    const pkg = new Map<string, number>();
    const src = new Map<string, number>();
    const areas = new Map<string, number>();
    for (const e of enquiries) {
      const t = new Date(e.created_at);
      byDay[t.getDay()]++;
      const h = t.getHours();
      byBlock[h >= 6 && h < 12 ? "Morning (6am-12pm)" : h >= 12 && h < 17 ? "Afternoon (12pm-5pm)" : h >= 17 && h < 22 ? "Evening (5pm-10pm)" : "Night (10pm-6am)"]++;
      const p = e.package && e.package !== "Free consultation" ? e.package : "";
      if (p) pkg.set(p, (pkg.get(p) ?? 0) + 1);
      src.set(sourceLabel(e.source), (src.get(sourceLabel(e.source)) ?? 0) + 1);
      const a = e.area.trim().toLowerCase();
      if (a) areas.set(a.charAt(0).toUpperCase() + a.slice(1, 40), (areas.get(a.charAt(0).toUpperCase() + a.slice(1, 40)) ?? 0) + 1);
    }
    const upcoming = enquiries
      .map((e) => ({ e, at: bookingTime(e) }))
      .filter((x): x is { e: Enquiry; at: number } => x.at !== null && x.at >= now - 15 * 60_000)
      .sort((a, b) => a.at - b.at);
    const stale = enquiries.filter((e) => e.status === "new" && now - new Date(e.created_at).getTime() > DAY && bookingTime(e) === null);
    const fresh30 = enquiries.filter((e) => now - new Date(e.created_at).getTime() < 30 * DAY);
    const prev30 = enquiries.filter((e) => {
      const a = now - new Date(e.created_at).getTime();
      return a >= 30 * DAY && a < 60 * DAY;
    });
    const contacted = enquiries.filter((e) => e.status !== "new").length;
    const closed = enquiries.filter((e) => e.status === "closed").length;
    const bookings = enquiries.filter((e) => bookingTime(e) !== null).length;
    const topDay = byDay.indexOf(Math.max(...byDay));
    const topPkg = [...pkg.entries()].sort((a, b) => b[1] - a[1])[0];
    const topSrc = [...src.entries()].sort((a, b) => b[1] - a[1])[0];
    const topBlock = Object.entries(byBlock).sort((a, b) => b[1] - a[1])[0];
    return { total, byDay, byBlock, pkg: [...pkg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6), src: [...src.entries()].sort((a, b) => b[1] - a[1]), areas: [...areas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6), upcoming, stale, fresh30: fresh30.length, prev30: prev30.length, contacted, closed, bookings, topDay, topPkg, topSrc, topBlock };
  }, [enquiries]);

  const live = posts.filter((p) => p.published).length;
  const lastPost = posts.filter((p) => p.published && p.published_at).sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))[0];
  const daysSincePost = lastPost?.published_at ? Math.floor((Date.now() - new Date(lastPost.published_at).getTime()) / DAY) : null;

  const tips: Tip[] = [];
  if (d.stale.length > 0)
    tips.push({ icon: "mail", title: `${d.stale.length} ${d.stale.length === 1 ? "enquiry has" : "enquiries have"} waited over a day`, text: "Fast replies win listings. Follow up with these first.", go: { view: "enquiries", label: "Open enquiries" } });
  if (d.upcoming.length > 0)
    tips.push({ icon: "phone", title: `${d.upcoming.length} consultation${d.upcoming.length === 1 ? "" : "s"} coming up`, text: "Check the schedule below so you are ready to call at the booked time." });
  if (d.total >= 5 && d.byDay[d.topDay] > 0)
    tips.push({ icon: "spark", title: `${WEEKDAYS[d.topDay]} is your busiest day`, text: `${pct(d.byDay[d.topDay], d.total)}% of enquiries arrive on ${WEEKDAYS[d.topDay]}. Keep that day clear for replies.` });
  if (d.total >= 5 && d.topBlock[1] > 0)
    tips.push({ icon: "users", title: `Most people reach out in the ${d.topBlock[0].split(" ")[0].toLowerCase()}`, text: "Schedule your inbox check around then, or offer more consultation slots at that time." });
  if (d.topPkg) tips.push({ icon: "inbox", title: `${d.topPkg[0]} is the most requested package`, text: `${d.topPkg[1]} enquir${d.topPkg[1] === 1 ? "y mentions" : "ies mention"} it. Feature it first on your pages.` });
  if (d.prev30 > 0 && d.fresh30 !== d.prev30)
    tips.push({ icon: "chart", title: d.fresh30 > d.prev30 ? "Enquiries are up on last month" : "Enquiries are down on last month", text: `${d.fresh30} in the last 30 days against ${d.prev30} in the 30 days before.` });
  if (daysSincePost === null || daysSincePost > 21)
    tips.push({ icon: "posts", title: daysSincePost === null ? "No blog posts published yet" : `Your last post was ${daysSincePost} days ago`, text: "A fresh post every few weeks keeps the site active for search and gives you something to share with agents.", go: { view: "posts", label: "Write a post" } });
  if (tips.length === 0) tips.push({ icon: "spark", title: "Insights appear as data comes in", text: "Once enquiries and bookings arrive, patterns about timing, packages and follow-up show up here." });

  const funnel = [
    { label: "Enquiries", n: d.total, w: 100 },
    { label: "Followed up", n: d.contacted, w: pct(d.contacted, d.total) },
    { label: "Closed", n: d.closed, w: pct(d.closed, d.total) },
  ];

  return (
    <div className="a-dash a-insights">
      <section aria-label="Highlights" className="a-stats">
        <div className="a-stat">
          <span className="a-stat__icon"><Icon name="inbox" size={20} /></span>
          <div><small>Last 30 days</small><strong>{d.fresh30}</strong><em className={d.fresh30 >= d.prev30 ? "is-up" : "is-down"}>{d.prev30 ? `${d.fresh30 - d.prev30 >= 0 ? "+" : ""}${d.fresh30 - d.prev30} vs the 30 before` : "New enquiries"}</em></div>
        </div>
        <div className="a-stat">
          <span className="a-stat__icon"><Icon name="phone" size={20} /></span>
          <div><small>Consultations booked</small><strong>{d.bookings}</strong><em>{d.upcoming.length} upcoming</em></div>
        </div>
        <div className="a-stat">
          <span className="a-stat__icon"><Icon name="check" size={20} /></span>
          <div><small>Follow-up rate</small><strong>{pct(d.contacted, d.total)}%</strong><em>{d.contacted} of {d.total} handled</em></div>
        </div>
        <div className="a-stat">
          <span className="a-stat__icon"><Icon name="posts" size={20} /></span>
          <div><small>Published posts</small><strong>{live}</strong><em>{daysSincePost === null ? "None yet" : `Last one ${daysSincePost}d ago`}</em></div>
        </div>
      </section>

      <section className="a-card">
        <header className="a-card__head"><div><h3>What we noticed</h3><p>Plain-language takeaways from your data</p></div></header>
        <ul className="a-tips">
          {tips.map((t) => (
            <li key={t.title}>
              <span className="a-stat__icon"><Icon name={t.icon} size={18} /></span>
              <div>
                <strong>{t.title}</strong>
                <p>{t.text}</p>
                {t.go ? <button className="a-link" onClick={() => go(t.go!.view)} type="button">{t.go.label}</button> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="a-grid a-grid--two">
        <section className="a-card">
          <header className="a-card__head"><div><h3>Upcoming consultations</h3><p>Booked through the website, Toronto time</p></div></header>
          {d.upcoming.length === 0 ? (
            <p className="a-empty-sm">No upcoming consultations. They appear here when someone books a time.</p>
          ) : (
            <ul className="a-list">
              {d.upcoming.slice(0, 8).map(({ e, at }) => (
                <li key={e.id}>
                  <button onClick={() => go("enquiries", e.id)} type="button">
                    <span className="a-list__main">
                      <strong>{e.name}</strong>
                      <small>
                        {new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(at))}
                        {e.phone ? ` · ${e.phone}` : ""}
                      </small>
                    </span>
                    <span className={`a-pill is-${e.status}`}>{e.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card">
          <header className="a-card__head"><div><h3>Needs a reply</h3><p>New enquiries waiting more than a day</p></div></header>
          {d.stale.length === 0 ? (
            <p className="a-empty-sm">Nothing is overdue. Nice work.</p>
          ) : (
            <ul className="a-list">
              {d.stale.slice(0, 8).map((e) => (
                <li key={e.id}>
                  <button onClick={() => go("enquiries", e.id)} type="button">
                    <span className="a-list__main"><strong>{e.name}</strong><small>{e.package || e.email}</small></span>
                    <time>{timeAgo(e.created_at)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card">
          <header className="a-card__head"><div><h3>Enquiry funnel</h3><p>From first contact to closed</p></div></header>
          <ul className="a-funnel">
            {funnel.map((f) => (
              <li key={f.label}>
                <span>{f.label}</span>
                <div><i style={{ width: `${Math.max(f.w, f.n > 0 ? 4 : 0)}%` }} /></div>
                <b>{f.n}</b>
              </li>
            ))}
          </ul>
        </section>

        <section className="a-card">
          <header className="a-card__head"><div><h3>Where enquiries come from</h3><p>Which page the visitor used</p></div></header>
          <Bars empty="Sources show up once enquiries arrive." rows={d.src} />
        </section>

        <section className="a-card">
          <header className="a-card__head"><div><h3>Busiest days</h3><p>Enquiries by day of the week</p></div></header>
          <Bars empty="Not enough enquiries yet." rows={WEEKDAYS.map((w, i) => [w.slice(0, 3), d.byDay[i]] as [string, number])} />
        </section>

        <section className="a-card">
          <header className="a-card__head"><div><h3>Time of day</h3><p>When people get in touch</p></div></header>
          <Bars empty="Not enough enquiries yet." rows={Object.entries(d.byBlock)} />
        </section>

        <section className="a-card">
          <header className="a-card__head"><div><h3>Package interest</h3><p>What people ask about</p></div></header>
          <Bars empty="Package interest shows up here." rows={d.pkg} />
        </section>

        <section className="a-card">
          <header className="a-card__head"><div><h3>Properties and areas</h3><p>As typed in the form</p></div></header>
          <Bars empty="Areas show up here." rows={d.areas} />
        </section>
      </div>
    </div>
  );
}
