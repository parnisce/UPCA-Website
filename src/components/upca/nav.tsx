import { useEffect, useState } from "react";

import { NAV_LINKS } from "./content";
import { ViewfinderButton } from "./cta";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`u-nav${open ? " is-open" : ""}`}>
      <div className="u-nav__inner">
        <a aria-label="UPCA Real Estate Marketing and Media, home" className="u-logo" href="/">
          <img alt="UPCA Real Estate Marketing and Media" height={64} src="/assets/logo-light.png" width={193} />
        </a>
        <nav aria-label="Primary" className="u-nav__links">
          {NAV_LINKS.map((l) => (
            <a href={l.href} key={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <ViewfinderButton className="u-view--nav" />
        <button
          aria-controls="u-drawer"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="u-burger"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <nav aria-label="Mobile" className="u-drawer" id="u-drawer" inert={!open}>
        {NAV_LINKS.map((l, i) => (
          <a href={l.href} key={l.href} onClick={() => setOpen(false)} style={{ ["--i" as string]: i }}>
            {l.label}
          </a>
        ))}
        <a className="u-drawer__cta" href="#contact" onClick={() => setOpen(false)}>
          Book Free Consultation
        </a>
      </nav>
    </header>
  );
}
