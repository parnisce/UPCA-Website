import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CtaBand, PageHero, PageShell } from "@/components/upca/page-shell";
import { api, formatDate, type Post } from "@/lib/supabase";

const DESC = "Real estate marketing tips, photography and video advice, and news from UPCA in Niagara, Hamilton and Burlington.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | UPCA Real Estate Marketing and Media" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Blog | UPCA Real Estate Marketing and Media" },
      { property: "og:description", content: DESC },
    ],
  }),
  component: BlogPage,
});

type Card = Pick<Post, "id" | "slug" | "title" | "excerpt" | "cover_url" | "published_at">;

function BlogPage() {
  const [posts, setPosts] = useState<Card[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api<Card[]>("/rest/v1/posts?select=id,slug,title,excerpt,cover_url,published_at&published=eq.true&order=published_at.desc.nullslast")
      .then(setPosts)
      .catch(() => setFailed(true));
  }, []);

  return (
    <PageShell>
      <PageHero
        eyebrow="Blog"
        image="/assets/img/interior.jpg"
        lede="Tips and news on real estate photography, video, drone and marketing."
        title="Ideas to help your listings sell."
      />
      <section className="u-section u-blog u-bgsec" style={{ ["--bg" as string]: "url(/assets/world/scene-01-poster.jpg)" }}>
        <div className="u-wrap">
          {posts === null && !failed ? <p className="u-blog__state">Loading posts...</p> : null}
          {failed ? <p className="u-blog__state">Posts could not be loaded right now. Please try again soon.</p> : null}
          {posts && posts.length === 0 ? <p className="u-blog__state">New posts are on the way. Check back soon.</p> : null}
          {posts && posts.length > 0 ? (
            <ul className="u-posts">
              {posts.map((p) => (
                <li key={p.id}>
                  <a className="u-post" href={`/blog/${p.slug}`}>
                    <span className="u-post__img">{p.cover_url ? <img alt="" height={540} loading="lazy" src={p.cover_url} width={960} /> : <i aria-hidden="true">UPCA</i>}</span>
                    <small>{formatDate(p.published_at)}</small>
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                    <span className="u-svc__go">Read more</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
      <CtaBand text="Book a free 15-minute call and we will recommend the package that fits your listing." title="Ready to market your next listing?" />
    </PageShell>
  );
}
