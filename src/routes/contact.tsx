import { createFileRoute } from "@tanstack/react-router";

import { ContactForm } from "@/components/upca/contact-form";
import { CONTACT, CORE_AREAS, CALL_FIRST_AREAS } from "@/components/upca/content";
import { PageHero, PageShell } from "@/components/upca/page-shell";

const DESC = "Book a free 15-minute consultation with UPCA Real Estate Marketing and Media. Call, email or send a request for your Niagara, Hamilton or Burlington listing.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | UPCA Real Estate Marketing and Media" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Contact Us | UPCA Real Estate Marketing and Media" },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Contact us"
        image="/assets/world/scene-01-poster.jpg"
        lede="Book a free 15-minute call. Tell us about the property and we will recommend the package that fits. No obligation."
        title="Let's plan your next listing."
      />
      <section className="u-section u-contact">
        <div className="u-wrap u-contact__grid">
          <aside className="u-contact__info">
            <h2 className="u-areas__sub">Reach us directly</h2>
            <ul className="u-contact__list">
              <li>
                <span>Phone</span>
                <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
              </li>
              <li>
                <span>Email</span>
                <a href={CONTACT.emailHref}>{CONTACT.email}</a>
              </li>
              <li>
                <span>Service area</span>
                <p>{CORE_AREAS.join(", ")}.</p>
                <p className="u-contact__note">Call first for {CALL_FIRST_AREAS.join(", ")}.</p>
              </li>
            </ul>
            <h2 className="u-areas__sub">Follow along</h2>
            <ul className="u-callfirst__tags">
              {CONTACT.social.map((l) => (
                <li key={l.label}>
                  <a href={l.href} rel="noopener noreferrer" target="_blank">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
          <div className="u-contact__form">
            <h2 className="u-contact__formtitle">Tell us about your listing.</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
