import { ContactForm } from "./contact-form";
import { useContact } from "@/lib/site-content";

export function FinalCTA() {
  const CONTACT = useContact();
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
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
