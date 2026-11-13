import { useEffect, useState } from "react";

import { api } from "@/lib/supabase";
import { useContact } from "@/lib/site-content";
import { BOOK_LABEL, PACKAGES } from "./content";

type Status = "idle" | "sending" | "done" | "error";

export function ContactForm({ defaultPackage = "" }: { defaultPackage?: string }) {
  const CONTACT = useContact();
  const [status, setStatus] = useState<Status>("idle");
  const [pkg, setPkg] = useState(defaultPackage);
  const [error, setError] = useState("");

  useEffect(() => {
    const on = (e: Event) => setPkg(String((e as CustomEvent).detail ?? ""));
    window.addEventListener("upca:package", on);
    return () => window.removeEventListener("upca:package", on);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    const get = (k: string) => String(form.get(k) ?? "").trim();
    if (get("website")) { setStatus("done"); return; }
    if (!get("name") || !/^\S+@\S+\.\S+$/.test(get("email"))) {
      setStatus("error");
      setError("Please check your name and email, then try again.");
      return;
    }
    const record = {
      name: get("name").slice(0, 200),
      email: get("email").slice(0, 320),
      phone: get("phone").slice(0, 60),
      package: get("package").slice(0, 100),
      area: get("area").slice(0, 300),
      message: get("message").slice(0, 5000),
      source: window.location.pathname.slice(0, 100) || "website",
    };
    try {
      await api("/rest/v1/enquiries", { method: "POST", body: record, prefer: "return=minimal" });
    } catch {
      // Database unreachable: fall back to the visitor's email app so the request is not lost.
      const body = [`Name: ${record.name}`, `Email: ${record.email}`, `Phone: ${record.phone}`, `Package: ${record.package}`, `Area: ${record.area}`, "", record.message].join("\n");
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Consultation request")}&body=${encodeURIComponent(body)}`;
    }
    setStatus("done");
  }

  return (
    <>
      {status === "done" ? (
        <div className="u-sent" role="status">
          <h3>Request received.</h3>
          <p>Thank you. We will be in touch about your listing shortly.</p>
        </div>
      ) : (
        <form className="u-form" noValidate onSubmit={onSubmit}>
          <div className="u-form__row">
            <label>
              <span>Name</span>
              <input autoComplete="name" name="name" required type="text" />
            </label>
            <label>
              <span>Email</span>
              <input autoComplete="email" name="email" required type="email" />
            </label>
          </div>
          <div className="u-form__row">
            <label>
              <span>Phone (optional)</span>
              <input autoComplete="tel" name="phone" type="tel" />
            </label>
            <label>
              <span>Package</span>
              <select name="package" onChange={(e) => setPkg(e.target.value)} value={pkg}>
                <option value="">Not sure yet</option>
                {PACKAGES.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>Property address or area</span>
            <input name="area" type="text" />
          </label>
          <label>
            <span>Anything we should know (optional)</span>
            <textarea name="message" rows={3} />
          </label>
          <input aria-hidden="true" autoComplete="off" className="u-hp" name="website" tabIndex={-1} type="text" />
          {error ? (
            <p className="u-form__error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="u-frame-btn" disabled={status === "sending"} type="submit">
            <span className="u-frame-btn__a">{status === "sending" ? "Sending" : BOOK_LABEL}</span>
            <span aria-hidden="true" className="u-frame-btn__b">
              {status === "sending" ? "Sending" : BOOK_LABEL}
            </span>
          </button>
        </form>
      )}
    </>
  );
}
