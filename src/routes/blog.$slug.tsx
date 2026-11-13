import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Markdown } from "@/components/upca/markdown";
import { CtaBand, PageShell } from "@/components/upca/page-shell";
import { api, formatDate, type Post } from "@/lib/supabase";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [{ title: "Blog | UPCA Real Estate Marketing and Media" }],
  }),
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [state, setState] = useState<"loading" | "missing" | "ready">("loading");

  useEffect(() => {
    let live = true;
    api<Post[]>(`/rest/v1/posts?select=*&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`)
      .then((rows) => {
        if (!live) return;
        if (rows.length) {
          setPost(rows[0]);
          setState("ready");
          document.title = `${rows[0].title} | UPCA Real Estate Marketing and Media`;
        } else setState("missing");
      })
      .catch(() => live && setState("missing"));
    return () => {
      live = false;
    };
  }, [slug]);

  return (
    <PageShell>
      <section className="u-section u-article u-bgsec" style={{ ["--bg" as string]: `url(${post?.cover_url ?? "/assets/img/interior.jpg"})` }}>
        <div className="u-wrap u-article__wrap">
          <a className="u-crumb" href="/blog">
            <span aria-hidden="true">&larr;</span> All posts
          </a>
          {state === "loading" ? <p className="u-blog__state">Loading...</p> : null}
          {state === "missing" ? (
            <>
              <h1 className="u-h2 u-pagehero__title">Post not found.</h1>
              <p className="u-lede">This post may have been moved or is not published yet.</p>
            </>
          ) : null}
          {state === "ready" && post ? (
            <article>
              <p className="u-eyebrow">{formatDate(post.published_at)}</p>
              <h1 className="u-h2 u-draw u-pagehero__title">{post.title}</h1>
              {post.excerpt ? <p className="u-lede">{post.excerpt}</p> : null}
              {post.cover_url ? <img alt="" className="u-article__cover" height={540} src={post.cover_url} width={960} /> : null}
              <Markdown source={post.body} />
            </article>
          ) : null}
        </div>
      </section>
      <CtaBand text="Share a few details and we will reply with the package that fits the property." title="Need help marketing a listing?" />
    </PageShell>
  );
}
