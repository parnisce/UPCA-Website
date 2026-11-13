import { useMemo, useRef, useState } from "react";

import { Markdown } from "@/components/upca/markdown";
import { api, formatDate, slugify, uploadMedia, type Post } from "@/lib/supabase";
import { Icon, TextArea, TextInput, type Notify } from "./parts";

type Draft = {
  id?: string;
  title: string;
  slug: string;
  slugTouched: boolean;
  excerpt: string;
  body: string;
  cover_url: string;
  published: boolean;
  date: string;
};

const BLANK: Draft = { title: "", slug: "", slugTouched: false, excerpt: "", body: "", cover_url: "", published: false, date: "" };

function toDraft(p: Post): Draft {
  return { id: p.id, title: p.title, slug: p.slug, slugTouched: true, excerpt: p.excerpt, body: p.body, cover_url: p.cover_url ?? "", published: p.published, date: (p.published_at ?? "").slice(0, 10) };
}

export function PostsManager({ posts, onChange, notify }: { posts: Post[]; onChange: (next: Post[]) => void; notify: Notify }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "draft">("all");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => (filter === "all" || (filter === "live") === p.published) && (!q || p.title.toLowerCase().includes(q)));
  }, [posts, query, filter]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function setTitle(title: string) {
    setDraft((d) => (d ? { ...d, title, slug: d.slugTouched ? d.slug : slugify(title) } : d));
  }

  function wrap(before: string, after = "", placeholder = "text") {
    const el = bodyRef.current;
    if (!el || !draft) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const chosen = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + chosen + after + value.slice(e);
    set("body", next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + chosen.length);
    });
  }

  async function onCover(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 6 * 1024 * 1024) {
      notify("Choose an image under 6 MB.", "error");
      return;
    }
    setUploading(true);
    try {
      set("cover_url", await uploadMedia(file));
      notify("Image uploaded.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function save(publishNow?: boolean) {
    if (!draft) return;
    const title = draft.title.trim();
    const slug = slugify(draft.slug || draft.title);
    if (!title || !slug) {
      notify("Add a title first.", "error");
      return;
    }
    const published = publishNow ?? draft.published;
    const published_at = published ? (draft.date ? new Date(`${draft.date}T12:00:00`).toISOString() : new Date().toISOString()) : null;
    const body = {
      title,
      slug,
      excerpt: draft.excerpt.trim(),
      body: draft.body,
      cover_url: draft.cover_url.trim() || null,
      published,
      published_at,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    try {
      let saved: Post;
      if (draft.id) {
        const rows = await api<Post[]>(`/rest/v1/posts?id=eq.${draft.id}`, { method: "PATCH", body, auth: true, prefer: "return=representation" });
        saved = rows[0];
        onChange(posts.map((p) => (p.id === saved.id ? saved : p)));
      } else {
        const rows = await api<Post[]>("/rest/v1/posts", { method: "POST", body, auth: true, prefer: "return=representation" });
        saved = rows[0];
        onChange([saved, ...posts]);
      }
      setDraft(toDraft(saved));
      notify(published ? "Post saved and live." : "Draft saved.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save.";
      notify(/duplicate|unique/i.test(msg) ? "That web address is already used by another post. Change the slug." : msg, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft?.id) return;
    if (!window.confirm(`Delete "${draft.title}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await api(`/rest/v1/posts?id=eq.${draft.id}`, { method: "DELETE", auth: true });
      onChange(posts.filter((p) => p.id !== draft.id));
      setDraft(null);
      notify("Post deleted.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not delete.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (draft) {
    return (
      <div className="a-editor">
        <div className="a-editor__bar">
          <button className="a-link" onClick={() => { setDraft(null); setPreview(false); }} type="button">
            &larr; All posts
          </button>
          <div className="a-editor__actions">
            {draft.id && draft.published ? (
              <a className="a-btn a-btn--ghost" href={`/blog/${draft.slug}`} rel="noopener noreferrer" target="_blank">
                <Icon name="external" size={16} /> View
              </a>
            ) : null}
            <button className="a-btn a-btn--ghost" disabled={saving} onClick={() => save(false)} type="button">
              <Icon name="save" size={16} /> {draft.published ? "Unpublish and save" : "Save draft"}
            </button>
            <button className="a-btn a-btn--gold" disabled={saving} onClick={() => save(true)} type="button">
              {saving ? "Saving..." : draft.published ? "Update live post" : "Publish"}
            </button>
          </div>
        </div>

        <div className="a-editor__grid">
          <section className="a-card">
            <TextInput label="Title" onChange={setTitle} placeholder="5 ways great photos help a listing sell faster" value={draft.title} />
            <TextArea hint="One or two sentences. Shown on the blog list and in search results." label="Summary" onChange={(v) => set("excerpt", v)} rows={3} value={draft.excerpt} />

            <div className="a-field">
              <span>Article</span>
              <div className="a-md">
                <div className="a-md__bar">
                  <button disabled={preview} onClick={() => wrap("## ", "", "Heading")} type="button">
                    H2
                  </button>
                  <button disabled={preview} onClick={() => wrap("**", "**", "bold")} type="button">
                    <b>B</b>
                  </button>
                  <button disabled={preview} onClick={() => wrap("*", "*", "italic")} type="button">
                    <i>I</i>
                  </button>
                  <button disabled={preview} onClick={() => wrap("\n- ", "", "List item")} type="button">
                    List
                  </button>
                  <button disabled={preview} onClick={() => wrap("[", "](https://)", "link text")} type="button">
                    Link
                  </button>
                  <button disabled={preview} onClick={() => wrap("\n![", "](https://)\n", "describe the image")} type="button">
                    Image
                  </button>
                  <span />
                  <button aria-pressed={preview} onClick={() => setPreview((v) => !v)} type="button">
                    <Icon name="eye" size={15} /> {preview ? "Edit" : "Preview"}
                  </button>
                </div>
                {preview ? (
                  <div className="a-md__preview">{draft.body.trim() ? <Markdown source={draft.body} /> : <p className="a-empty-sm">Nothing to preview yet.</p>}</div>
                ) : (
                  <textarea aria-label="Article body" onChange={(e) => set("body", e.target.value)} placeholder={"Write your article here.\n\nUse a blank line between paragraphs."} ref={bodyRef} rows={18} value={draft.body} />
                )}
              </div>
            </div>
          </section>

          <aside className="a-editor__side">
            <section className="a-card">
              <h3>Publishing</h3>
              <p className="a-hint">{draft.published ? "This post is live on your website." : "This post is a draft. Only you can see it."}</p>
              <TextInput hint="The web address: /blog/your-slug" label="Slug" onChange={(v) => { set("slug", slugify(v)); set("slugTouched", true); }} value={draft.slug} />
              <TextInput label="Publish date" onChange={(v) => set("date", v)} type="date" value={draft.date} />
            </section>
            <section className="a-card">
              <h3>Cover image</h3>
              {draft.cover_url ? <img alt="" className="a-cover" src={draft.cover_url} /> : <div className="a-cover a-cover--empty"><Icon name="image" size={28} /></div>}
              <label className="a-btn a-btn--ghost a-btn--block a-upload">
                <Icon name="image" size={16} /> {uploading ? "Uploading..." : "Upload image"}
                <input accept="image/*" disabled={uploading} onChange={(e) => { void onCover(e.target.files?.[0]); e.target.value = ""; }} type="file" />
              </label>
              <TextInput hint="Or paste an image link" label="Image URL" onChange={(v) => set("cover_url", v)} placeholder="https://" value={draft.cover_url} />
              {draft.cover_url ? (
                <button className="a-link" onClick={() => set("cover_url", "")} type="button">
                  Remove image
                </button>
              ) : null}
            </section>
            {draft.id ? (
              <button className="a-btn a-btn--danger a-btn--block" disabled={saving} onClick={remove} type="button">
                <Icon name="trash" size={16} /> Delete post
              </button>
            ) : null}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="a-posts">
      <div className="a-toolbar">
        <label className="a-search">
          <Icon name="search" size={16} />
          <input aria-label="Search posts" onChange={(e) => setQuery(e.target.value)} placeholder="Search posts..." type="search" value={query} />
        </label>
        <div className="a-seg" role="group" aria-label="Filter">
          {(["all", "live", "draft"] as const).map((f) => (
            <button aria-pressed={filter === f} key={f} onClick={() => setFilter(f)} type="button">
              {f}
            </button>
          ))}
        </div>
        <button className="a-btn a-btn--gold" onClick={() => setDraft({ ...BLANK })} type="button">
          <Icon name="plus" size={16} /> New post
        </button>
      </div>

      {list.length === 0 ? (
        <div className="a-empty a-card">
          <Icon name="posts" size={34} />
          <h3>{posts.length === 0 ? "Write your first post" : "No posts match"}</h3>
          <p>{posts.length === 0 ? "Share tips for agents, show a recent shoot, or announce news. Posts appear on your blog and homepage once published." : "Try a different search or filter."}</p>
          {posts.length === 0 ? (
            <button className="a-btn a-btn--gold" onClick={() => setDraft({ ...BLANK })} type="button">
              <Icon name="plus" size={16} /> New post
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="a-postgrid">
          {list.map((p) => (
            <li key={p.id}>
              <button onClick={() => setDraft(toDraft(p))} type="button">
                <span className="a-postgrid__img">{p.cover_url ? <img alt="" loading="lazy" src={p.cover_url} /> : <Icon name="image" size={26} />}</span>
                <span className={`a-pill ${p.published ? "is-contacted" : "is-new"}`}>{p.published ? "live" : "draft"}</span>
                <strong>{p.title}</strong>
                <small>{p.published ? `Published ${formatDate(p.published_at)}` : `Edited ${formatDate(p.updated_at)}`}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
