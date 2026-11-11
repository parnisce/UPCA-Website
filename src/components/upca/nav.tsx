import { NAV_LINKS } from "./content";
import { ViewfinderButton } from "./cta";

export function SiteNav() {
  return (
    <header className="u-nav">
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
        <ViewfinderButton />
      </div>
    </header>
  );
}
