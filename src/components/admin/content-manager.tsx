import { useState, type ReactNode } from "react";

import { scrollScrubScenes } from "@/scroll-scrub-scenes";
import { DEFAULTS, applyContent, useSiteContent, type AboutContent, type ContactInfo, type Faq, type HeroCopy, type ServiceCopy, type SiteContent, type Testimonial } from "@/lib/site-content";
import { api } from "@/lib/supabase";
import { Icon, RowTools, TextArea, TextInput, moveItem, type Notify } from "./parts";

type Key = keyof SiteContent;

const BLOCKS: { id: Key; label: string; hint: string; anchor: string }[] = [
  { id: "hero", label: "Hero chapters", hint: "The six headlines that play over the film at the top.", anchor: "" },
  { id: "services", label: "Services", hint: "Titles and short descriptions on the service cards.", anchor: "#services" },
  { id: "about", label: "About us", hint: "Your story and the three headline facts.", anchor: "#about" },
  { id: "testimonials", label: "Testimonials", hint: "Client reviews. Replace the samples with real ones.", anchor: "#testimonials" },
  { id: "faqs", label: "FAQ", hint: "Questions and answers near the bottom of the page.", anchor: "#faq" },
  { id: "contact", label: "Contact details", hint: "Phone and email shown across the site.", anchor: "#contact" },
];

const HERO_DEFAULT: HeroCopy[] = scrollScrubScenes.map((s) => ({ title: s.title, body: s.body, tag: s.tags?.[0] ?? "" }));

function Frame({ title, hint, custom, busy, dirty, onSave, onReset, anchor, children }: { title: string; hint: string; custom: boolean; busy: boolean; dirty: boolean; onSave: () => void; onReset: () => void; anchor: string; children: ReactNode }) {
  return (
    <section className="a-card a-frame">
      <header className="a-frame__head">
        <div>
          <h2>
            {title} {custom ? <span className="a-pill is-contacted">customised</span> : <span className="a-pill is-closed">default</span>}
          </h2>
          <p>{hint}</p>
        </div>
        <a className="a-link" href={`/${anchor}`} rel="noopener noreferrer" target="_blank">
          Open on site <Icon name="external" size={14} />
        </a>
      </header>
      <div className="a-frame__body">{children}</div>
      <footer className="a-frame__foot">
        <button className="a-btn a-btn--gold" disabled={busy || !dirty} onClick={onSave} type="button">
          <Icon name="save" size={16} /> {busy ? "Saving..." : dirty ? "Save changes" : "Saved"}
        </button>
        <button className="a-btn a-btn--ghost" disabled={busy || !custom} onClick={onReset} type="button">
          Restore default
        </button>
      </footer>
    </section>
  );
}

function useDraft<T>(initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const dirty = JSON.stringify(draft) !== saved;
  return { draft, setDraft, dirty, markSaved: (v: T) => setSaved(JSON.stringify(v)) };
}

type EditorProps<T> = { initial: T; custom: boolean; busy: boolean; onSave: (v: T) => Promise<boolean>; onReset: () => Promise<T | null>; block: (typeof BLOCKS)[number] };

function useEditor<T>({ initial, onSave, onReset }: EditorProps<T>) {
  const d = useDraft<T>(initial);
  return {
    ...d,
    save: async () => {
      if (await onSave(d.draft)) d.markSaved(d.draft);
    },
    reset: async () => {
      const next = await onReset();
      if (next) {
        d.setDraft(next);
        d.markSaved(next);
      }
    },
  };
}

function HeroEditor(p: EditorProps<HeroCopy[]>) {
  const e = useEditor(p);
  const upd = (i: number, patch: Partial<HeroCopy>) => e.setDraft(e.draft.map((h, n) => (n === i ? { ...h, ...patch } : h)));
  return (
    <Frame anchor={p.block.anchor} busy={p.busy} custom={p.custom} dirty={e.dirty} hint={p.block.hint} onReset={e.reset} onSave={e.save} title={p.block.label}>
      {e.draft.map((h, i) => (
        <div className="a-item" key={i}>
          <p className="a-item__n">Chapter {i + 1}</p>
          <TextInput label="Headline" onChange={(v) => upd(i, { title: v })} value={h.title} />
          <TextArea label="Supporting text" onChange={(v) => upd(i, { body: v })} rows={2} value={h.body} />
          <TextInput label="Small label above the headline" onChange={(v) => upd(i, { tag: v })} value={h.tag} />
        </div>
      ))}
    </Frame>
  );
}

function AboutEditor(p: EditorProps<AboutContent>) {
  const e = useEditor(p);
  const d = e.draft;
  return (
    <Frame anchor={p.block.anchor} busy={p.busy} custom={p.custom} dirty={e.dirty} hint={p.block.hint} onReset={e.reset} onSave={e.save} title={p.block.label}>
      <TextInput label="Heading" onChange={(v) => e.setDraft({ ...d, title: v })} value={d.title} />
      {d.paragraphs.map((t, i) => (
        <div className="a-item" key={i}>
          <RowTools count={d.paragraphs.length} index={i} onMove={(to) => e.setDraft({ ...d, paragraphs: moveItem(d.paragraphs, i, to) })} onRemove={() => e.setDraft({ ...d, paragraphs: d.paragraphs.filter((_, n) => n !== i) })} />
          <TextArea label={`Paragraph ${i + 1}`} onChange={(v) => e.setDraft({ ...d, paragraphs: d.paragraphs.map((x, n) => (n === i ? v : x)) })} rows={3} value={t} />
        </div>
      ))}
      <button className="a-btn a-btn--ghost" onClick={() => e.setDraft({ ...d, paragraphs: [...d.paragraphs, ""] })} type="button">
        <Icon name="plus" size={16} /> Add paragraph
      </button>
      <h3 className="a-sub">Headline facts</h3>
      <div className="a-facts-edit">
        {d.facts.map((f, i) => (
          <div className="a-item" key={i}>
            <TextInput label="Number" onChange={(v) => e.setDraft({ ...d, facts: d.facts.map((x, n) => (n === i ? { ...x, value: v } : x)) })} value={f.value} />
            <TextInput label="Label" onChange={(v) => e.setDraft({ ...d, facts: d.facts.map((x, n) => (n === i ? { ...x, label: v } : x)) })} value={f.label} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

function ServicesEditor(p: EditorProps<ServiceCopy[]>) {
  const e = useEditor(p);
  const upd = (i: number, patch: Partial<ServiceCopy>) => e.setDraft(e.draft.map((s, n) => (n === i ? { ...s, ...patch } : s)));
  return (
    <Frame anchor={p.block.anchor} busy={p.busy} custom={p.custom} dirty={e.dirty} hint={p.block.hint} onReset={e.reset} onSave={e.save} title={p.block.label}>
      {e.draft.map((s, i) => (
        <div className="a-item" key={s.slug}>
          <p className="a-item__n">Service {i + 1}</p>
          <TextInput label="Title" onChange={(v) => upd(i, { title: v })} value={s.title} />
          <TextArea label="Description" onChange={(v) => upd(i, { text: v })} rows={2} value={s.text} />
        </div>
      ))}
    </Frame>
  );
}

function TestimonialsEditor(p: EditorProps<Testimonial[]>) {
  const e = useEditor(p);
  const d = e.draft;
  const upd = (i: number, patch: Partial<Testimonial>) => e.setDraft(d.map((t, n) => (n === i ? { ...t, ...patch } : t)));
  return (
    <Frame anchor={p.block.anchor} busy={p.busy} custom={p.custom} dirty={e.dirty} hint={p.block.hint} onReset={e.reset} onSave={e.save} title={p.block.label}>
      {d.map((t, i) => (
        <div className="a-item" key={i}>
          <RowTools count={d.length} index={i} onMove={(to) => e.setDraft(moveItem(d, i, to))} onRemove={() => e.setDraft(d.filter((_, n) => n !== i))} />
          <div className="a-two">
            <TextInput label="Client name" onChange={(v) => upd(i, { name: v })} value={t.name} />
            <TextInput label="Role and place" onChange={(v) => upd(i, { role: v })} value={t.role} />
          </div>
          <TextArea label="Review" onChange={(v) => upd(i, { text: v })} rows={3} value={t.text} />
          <label className="a-check">
            <input checked={Boolean(t.sample)} onChange={(ev) => upd(i, { sample: ev.target.checked })} type="checkbox" />
            <span>Sample review (shows a "Sample review" label)</span>
          </label>
        </div>
      ))}
      <button className="a-btn a-btn--ghost" onClick={() => e.setDraft([...d, { name: "", role: "", text: "" }])} type="button">
        <Icon name="plus" size={16} /> Add review
      </button>
    </Frame>
  );
}

function FaqEditor(p: EditorProps<Faq[]>) {
  const e = useEditor(p);
  const d = e.draft;
  const upd = (i: number, patch: Partial<Faq>) => e.setDraft(d.map((f, n) => (n === i ? { ...f, ...patch } : f)));
  return (
    <Frame anchor={p.block.anchor} busy={p.busy} custom={p.custom} dirty={e.dirty} hint={p.block.hint} onReset={e.reset} onSave={e.save} title={p.block.label}>
      {d.map((f, i) => (
        <div className="a-item" key={i}>
          <RowTools count={d.length} index={i} onMove={(to) => e.setDraft(moveItem(d, i, to))} onRemove={() => e.setDraft(d.filter((_, n) => n !== i))} />
          <TextInput label="Question" onChange={(v) => upd(i, { q: v })} value={f.q} />
          <TextArea label="Answer" onChange={(v) => upd(i, { a: v })} rows={3} value={f.a} />
        </div>
      ))}
      <button className="a-btn a-btn--ghost" onClick={() => e.setDraft([...d, { q: "", a: "" }])} type="button">
        <Icon name="plus" size={16} /> Add question
      </button>
    </Frame>
  );
}

function ContactEditor(p: EditorProps<ContactInfo>) {
  const e = useEditor(p);
  return (
    <Frame anchor={p.block.anchor} busy={p.busy} custom={p.custom} dirty={e.dirty} hint={p.block.hint} onReset={e.reset} onSave={e.save} title={p.block.label}>
      <div className="a-two">
        <TextInput hint="Include the area code, for example +1 (289) 366-9999" label="Phone" onChange={(v) => e.setDraft({ ...e.draft, phone: v })} value={e.draft.phone} />
        <TextInput label="Email" onChange={(v) => e.setDraft({ ...e.draft, email: v })} type="email" value={e.draft.email} />
      </div>
    </Frame>
  );
}

export function ContentManager({ notify }: { notify: Notify }) {
  const content = useSiteContent();
  const [active, setActive] = useState<Key>("hero");
  const [busy, setBusy] = useState(false);
  const block = BLOCKS.find((b) => b.id === active) ?? BLOCKS[0];

  const initial: Record<Key, unknown> = {
    hero: content.hero ?? HERO_DEFAULT,
    about: content.about ?? DEFAULTS.about,
    services: content.services ?? DEFAULTS.services,
    testimonials: content.testimonials ?? DEFAULTS.testimonials,
    faqs: content.faqs ?? DEFAULTS.faqs,
    contact: content.contact ?? DEFAULTS.contact,
  };

  function clone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v)) as T;
  }

  const common = <T,>(key: Key, fallback: T) => ({
    block,
    busy,
    custom: content[key] !== undefined,
    initial: clone(initial[key] as T),
    onSave: async (value: T) => {
      setBusy(true);
      try {
        await api("/rest/v1/site_content?on_conflict=key", { method: "POST", body: { key, value, updated_at: new Date().toISOString() }, auth: true, prefer: "resolution=merge-duplicates,return=minimal" });
        applyContent(key, value);
        notify("Saved. Your website is updated.");
        return true;
      } catch (err) {
        notify(err instanceof Error ? err.message : "Could not save.", "error");
        return false;
      } finally {
        setBusy(false);
      }
    },
    onReset: async () => {
      if (!window.confirm("Restore the original text for this section? Your edits will be removed.")) return null;
      setBusy(true);
      try {
        await api(`/rest/v1/site_content?key=eq.${key}`, { method: "DELETE", auth: true });
        applyContent(key, null);
        notify("Restored the default text.");
        return clone(fallback);
      } catch (err) {
        notify(err instanceof Error ? err.message : "Could not restore.", "error");
        return null;
      } finally {
        setBusy(false);
      }
    },
  });

  return (
    <div className="a-content-grid">
      <nav aria-label="Homepage sections" className="a-blocks">
        {BLOCKS.map((b) => (
          <button aria-current={active === b.id} key={b.id} onClick={() => setActive(b.id)} type="button">
            <strong>{b.label}</strong>
            <small>{content[b.id] !== undefined ? "Customised" : "Default"}</small>
          </button>
        ))}
      </nav>
      <div className="a-blocks__editor" key={active}>
        {active === "hero" ? <HeroEditor {...common<HeroCopy[]>("hero", HERO_DEFAULT)} /> : null}
        {active === "services" ? <ServicesEditor {...common<ServiceCopy[]>("services", DEFAULTS.services)} /> : null}
        {active === "about" ? <AboutEditor {...common<AboutContent>("about", DEFAULTS.about)} /> : null}
        {active === "testimonials" ? <TestimonialsEditor {...common<Testimonial[]>("testimonials", DEFAULTS.testimonials)} /> : null}
        {active === "faqs" ? <FaqEditor {...common<Faq[]>("faqs", DEFAULTS.faqs)} /> : null}
        {active === "contact" ? <ContactEditor {...common<ContactInfo>("contact", DEFAULTS.contact)} /> : null}
      </div>
    </div>
  );
}
