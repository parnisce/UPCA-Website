import type { ReactNode } from "react";

import { SiteFooter } from "./footer";
import { SiteNav } from "./nav";
import { Reveal } from "./reveal";

// Shared frame for the inner pages: fixed nav, scroll reveal, footer.
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <Reveal />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHero({ eyebrow, title, lede, image, crumb }: { eyebrow: string; title: string; lede: string; image: string; crumb?: { href: string; label: string } }) {
  return (
    <section className="u-section u-bgsec u-pagehero" style={{ ["--bg" as string]: `url(${image})` }}>
      <div className="u-wrap">
        {crumb ? (
          <a className="u-crumb" href={crumb.href}>
            <span aria-hidden="true">&larr;</span> {crumb.label}
          </a>
        ) : null}
        <p className="u-eyebrow">{eyebrow}</p>
        <h1 className="u-h2 u-draw u-pagehero__title">{title}</h1>
        <p className="u-lede">{lede}</p>
      </div>
    </section>
  );
}

export function CtaBand({ title, text }: { title: string; text: string }) {
  return (
    <section className="u-ctaband">
      <div className="u-wrap u-ctaband__inner">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <a className="u-callfirst__btn u-ctaband__btn" href="/contact">
          Book Free Consultation
        </a>
      </div>
    </section>
  );
}
