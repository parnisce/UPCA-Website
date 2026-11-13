import { useEffect, useState } from "react";

import { SUPABASE_KEY, SUPABASE_URL, checkAdmin, getSession, sendRecovery, signIn, signOut } from "@/lib/supabase";
import { Icon } from "./parts";

type Mode = "signin" | "forgot" | "newpass";

// Supabase recovery links arrive as #access_token=...&type=recovery
function readRecovery(): string | null {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const p = new URLSearchParams(hash);
  return p.get("type") === "recovery" ? p.get("access_token") : null;
}

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    const token = readRecovery();
    if (token) {
      setRecoveryToken(token);
      setMode("newpass");
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    if (getSession()) {
      checkAdmin().then((ok) => {
        if (ok) window.location.replace("/admin");
      });
    }
  }, []);

  async function finish(): Promise<void> {
    const ok = await checkAdmin();
    if (ok) {
      window.location.replace("/admin");
      return;
    }
    await signOut();
    setError("This account does not have admin access. Ask the site owner to add your email as an admin.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signin") {
        if (!email.trim() || !password) throw new Error("Enter your email and password.");
        await signIn(email.trim(), password);
        await finish();
      } else if (mode === "forgot") {
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) throw new Error("Enter the email you use to sign in.");
        await sendRecovery(email.trim());
        setNotice("If that email has an account, a reset link is on its way. Check your inbox.");
      } else {
        if (password.length < 8) throw new Error("Use at least 8 characters.");
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: "PUT",
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${recoveryToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (!res.ok) throw new Error("That reset link has expired. Request a new one.");
        setNotice("Password updated. Sign in with your new password.");
        setPassword("");
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "signin" ? "Welcome back" : mode === "forgot" ? "Reset your password" : "Choose a new password";
  const lede = mode === "signin" ? "Sign in to manage your website, blog and enquiries." : mode === "forgot" ? "Enter your email and we will send you a reset link." : "Pick a strong password you have not used elsewhere.";

  return (
    <div className="a-login">
      <aside className="a-login__art" aria-hidden="true">
        <div className="a-login__brand">
          <img alt="" height={64} src="/assets/logo-light.png" width={193} />
        </div>
        <div className="a-login__quote">
          <p>Every listing, every enquiry, one calm place to run it from.</p>
          <ul>
            <li>Edit your homepage</li>
            <li>Publish blog posts</li>
            <li>Follow up on enquiries</li>
          </ul>
        </div>
      </aside>
      <main className="a-login__panel">
        <form className="a-login__card" noValidate onSubmit={onSubmit}>
          <a className="a-login__back" href="/">
            <span aria-hidden="true">&larr;</span> Back to website
          </a>
          <span className="a-login__lock">
            <Icon name="lock" size={22} />
          </span>
          <h1>{title}</h1>
          <p className="a-login__lede">{lede}</p>

          {mode !== "newpass" ? (
            <label className="a-field">
              <span>Email</span>
              <input autoComplete="email" autoFocus inputMode="email" name="email" onChange={(e) => setEmail(e.target.value)} type="email" value={email} />
            </label>
          ) : null}
          {mode !== "forgot" ? (
            <label className="a-field">
              <span>{mode === "newpass" ? "New password" : "Password"}</span>
              <div className="a-pass">
                <input autoComplete={mode === "newpass" ? "new-password" : "current-password"} name="password" onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} value={password} />
                <button aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((v) => !v)} type="button">
                  <Icon name="eye" size={18} />
                </button>
              </div>
            </label>
          ) : null}

          {error ? (
            <p className="a-alert a-alert--error" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="a-alert a-alert--ok" role="status">
              {notice}
            </p>
          ) : null}

          <button className="a-btn a-btn--gold a-btn--block" disabled={busy} type="submit">
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Save password"}
          </button>

          {mode === "signin" ? (
            <button className="a-link" onClick={() => { setMode("forgot"); setError(""); setNotice(""); }} type="button">
              Forgot your password?
            </button>
          ) : (
            <button className="a-link" onClick={() => { setMode("signin"); setError(""); setNotice(""); }} type="button">
              Back to sign in
            </button>
          )}
        </form>
      </main>
    </div>
  );
}
