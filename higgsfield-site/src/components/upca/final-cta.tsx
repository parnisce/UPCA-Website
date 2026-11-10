import { useEffect, useState } from "react";

import { BOOK_LABEL, CONTACT, PACKAGES } from "./content";
import { submitInquiry } from "./inquiry.functions";

type Status = "idle" | "sending" | "done" | "error";

export function FinalCTA() {
  const [status, setStatus] = useState<Status>("idle");
  const [pkg, setPkg] = useState("");
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
    try {
      const res = await submitInquiry({
        data: {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          package: String(form.get("package") ?? ""),
          area: String(form.get("area") ?? ""),
          message: String(form.get("message") ?? ""),
          website: String(form.get("website") ?? ""),
        },
      });
      if (res.ok) setStatus("done");
      else {
        setStatus("error");
        setError(res.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Please check your name and email, then try again.");
    }
  }

  return (
    <section className="u-final" id="contact">
      <div className="u-final__gold">
        <div className="u-wrap">
          <h2 className="u-final__title">Turn your next listing into a standout.</h2>
        </div>
      </div>
      <div className="u-final__form">
        <div className="u-wrap u-final__grid">
          <div className="u-final__intro">
            <h3>Tell us about your listing.</h3>
            <p>Book a free 15-minute call. Share a few details and we will reply with the package that fits the property. No obligation.</p>
            <p className="u-final__call">
              Prefer to talk? <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            </p>
          </div>
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
        </div>
      </div>
    </section>
  );
}
