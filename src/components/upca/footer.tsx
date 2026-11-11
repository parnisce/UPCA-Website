import { CONTACT, CORE_AREAS, SERVICES } from "./content";

export function SiteFooter() {
  return (
    <footer className="u-footer">
      <div className="u-wrap">
        <div className="u-footer__top">
          <a aria-label="UPCA Real Estate Marketing and Media, home" className="u-logo" href="/">
            <img alt="UPCA Real Estate Marketing and Media" height={64} src="/assets/logo-light.png" width={193} />
          </a>
          <div className="u-footer__cols">
            <div>
              <h4>Services</h4>
              <ul>
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <a href={`/services/${s.slug}`}>{s.title}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Areas</h4>
              <ul>
                {CORE_AREAS.slice(0, 8).map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li>
                  <a href="/contact">Contact us</a>
                </li>
                <li>
                  <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
                </li>
                <li>
                  <a href={CONTACT.emailHref}>{CONTACT.email}</a>
                </li>
                {CONTACT.social.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} rel="noopener noreferrer" target="_blank">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="u-footer__legal">UPCA Real Estate Marketing and Media. Niagara and Hamilton.</p>
      </div>
    </footer>
  );
}
