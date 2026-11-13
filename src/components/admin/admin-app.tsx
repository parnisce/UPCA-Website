import { useCallback, useEffect, useRef, useState } from "react";

import { api, checkAdmin, getSession, signOut, type Enquiry, type Post } from "@/lib/supabase";
import { Analytics } from "./analytics";
import { ContentManager } from "./content-manager";
import { Dashboard } from "./dashboard";
import { EnquiriesManager } from "./enquiries-manager";
import { Insights } from "./insights";
import { LeadInsights } from "./lead-insights";
import { TasksBoard } from "./tasks-board";
import { Icon, type IconName, type Notify, type ToastKind } from "./parts";
import { PostsManager } from "./posts-manager";

export type View = "dashboard" | "analytics" | "insights" | "tasks" | "content" | "posts" | "enquiries";

const NAV: { id: View; label: string; icon: IconName; group: "Manage" | "Website" }[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", group: "Manage" },
  { id: "tasks", label: "Tasks", icon: "tasks", group: "Manage" },
  { id: "insights", label: "Insights", icon: "chart", group: "Manage" },
  { id: "content", label: "Homepage", icon: "content", group: "Website" },
  { id: "posts", label: "Blog posts", icon: "posts", group: "Website" },
  { id: "enquiries", label: "Enquiries", icon: "mail", group: "Website" },
  { id: "analytics", label: "Analytics", icon: "trend", group: "Website" },
];

function viewFromHash(): View {
  const h = window.location.hash.replace(/^#\/?/, "") as View;
  return NAV.some((n) => n.id === h) ? h : "dashboard";
}

type Toast = { id: number; message: string; kind: ToastKind };

export function AdminApp() {
  const [phase, setPhase] = useState<"checking" | "denied" | "ready">("checking");
  const [email, setEmail] = useState("");
  const [view, setView] = useState<View>("dashboard");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [focusEnquiry, setFocusEnquiry] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const notify: Notify = useCallback((message, kind = "ok") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [e, p] = await Promise.all([
        api<Enquiry[]>("/rest/v1/enquiries?select=*&order=created_at.desc&limit=1000", { auth: true }),
        api<Post[]>("/rest/v1/posts?select=*&order=created_at.desc", { auth: true }),
      ]);
      setEnquiries(e);
      setPosts(p);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.replace("/login");
      return;
    }
    setEmail(session.email);
    setView(viewFromHash());
    checkAdmin().then((ok) => {
      if (!ok) {
        setPhase(getSession() ? "denied" : "checking");
        if (!getSession()) window.location.replace("/login");
        return;
      }
      setPhase("ready");
      void load();
    });
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [load]);

  const go = useCallback((next: View, enquiryId?: string) => {
    setFocusEnquiry(enquiryId ?? null);
    setMenuOpen(false);
    window.location.hash = `/${next}`;
    setView(next);
    window.scrollTo({ top: 0 });
  }, []);

  async function logout() {
    await signOut();
    window.location.replace("/login");
  }

  if (phase === "checking") {
    return (
      <div className="a-boot">
        <span className="a-spinner" />
        <p>Opening your dashboard...</p>
      </div>
    );
  }

  if (phase === "denied") {
    return (
      <div className="a-boot">
        <span className="a-login__lock">
          <Icon name="lock" size={22} />
        </span>
        <h1>No admin access</h1>
        <p>{email} is signed in, but is not on the admin list. Add this email to the admins table in Supabase, then sign in again.</p>
        <button className="a-btn a-btn--gold" onClick={logout} type="button">
          Sign out
        </button>
      </div>
    );
  }

  const newCount = enquiries.filter((e) => e.status === "new").length;

  return (
    <div className="a-shell">
      <aside className={`a-side${menuOpen ? " is-open" : ""}`}>
        <a className="a-side__logo" href="/admin">
          <img alt="UPCA" height={48} src="/assets/logo-light.png" width={145} />
        </a>
        <nav aria-label="Admin">
          {(["Manage", "Website"] as const).map((g) => (
            <div className="a-side__group" key={g}>
              <p className="a-side__label">{g}</p>
              {NAV.filter((n) => n.group === g).map((n) => (
                <button aria-current={view === n.id ? "page" : undefined} className="a-nav" key={n.id} onClick={() => go(n.id)} type="button">
                  <Icon name={n.icon} />
                  <span>{n.label}</span>
                  {n.id === "enquiries" && newCount > 0 ? <b className="a-badge">{newCount}</b> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="a-side__foot">
          <a className="a-live" href="/" rel="noopener noreferrer" target="_blank">
            <Icon name="external" size={16} />
            <span>View live site</span>
          </a>
          <div className="a-user">
            <span className="a-avatar">{(email[0] ?? "A").toUpperCase()}</span>
            <div>
              <strong>Admin</strong>
              <small>{email}</small>
            </div>
            <button aria-label="Sign out" className="a-user__out" onClick={logout} title="Sign out" type="button">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>
      {menuOpen ? <button aria-label="Close menu" className="a-scrim" onClick={() => setMenuOpen(false)} type="button" /> : null}

      <div className="a-main">
        <header className="a-top">
          <button aria-label="Open menu" className="a-iconbtn a-burger" onClick={() => setMenuOpen(true)} type="button">
            <Icon name="menu" />
          </button>
          <h1>{NAV.find((n) => n.id === view)?.label}</h1>
          <div className="a-top__right">
            <button className="a-btn a-btn--ghost" disabled={loading} onClick={() => void load()} type="button">
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {loadError ? (
          <div className="a-alert a-alert--error a-alert--page" role="alert">
            <strong>Could not load your data.</strong> {loadError}. If this is the first setup, run supabase/schema.sql in the Supabase SQL editor.
          </div>
        ) : null}

        <div className="a-content">
          {view === "dashboard" ? <Dashboard email={email} enquiries={enquiries} go={go} loading={loading} posts={posts} /> : null}
          {view === "analytics" ? (
            <>
              <Analytics enquiries={enquiries} />
              <h2 className="a-section-title">Enquiry insights</h2>
              <LeadInsights enquiries={enquiries} go={go} posts={posts} />
            </>
          ) : null}
          {view === "insights" ? <Insights notify={notify} /> : null}
          {view === "tasks" ? <TasksBoard notify={notify} /> : null}
          {view === "enquiries" ? <EnquiriesManager enquiries={enquiries} focusId={focusEnquiry} notify={notify} onChange={setEnquiries} /> : null}
          {view === "posts" ? <PostsManager notify={notify} onChange={setPosts} posts={posts} /> : null}
          {view === "content" ? <ContentManager notify={notify} /> : null}
        </div>
      </div>

      <div aria-live="polite" className="a-toasts">
        {toasts.map((t) => (
          <div className={`a-toast a-toast--${t.kind}`} key={t.id}>
            <Icon name={t.kind === "ok" ? "check" : "x"} size={16} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
