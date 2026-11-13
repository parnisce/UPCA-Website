import { useEffect, useState } from "react";

import { api, formatDate, type Post } from "@/lib/supabase";

type Card = Pick<Post, "id" | "slug" | "title" | "excerpt" | "cover_url" | "published_at">;

// Home page strip. Renders nothing until at least one post is published.
export function LatestPosts() {
  const [posts, setPosts] = useState<Card[]>([]);

  useEffect(() => {
    api<Card[]>("/rest/v1/posts?select=id,slug,title,excerpt,cover_url,published_at&published=eq.true&order=published_at.desc.nullslast&limit=3")
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  if (posts.length === 0) return null;
  return (
    <section className="u-section u-blog u-bgsec" id="blog" style={{ ["--bg" as string]: "url(/assets/world/scene-03-poster.jpg)" }}>
      <div className="u-wrap">
        <div className="u-blog__head">
          <div>
            <p className="u-eyebrow">From the blog</p>
            <h2 className="u-h2 u-h2--sm u-draw">Ideas to help your listings sell.</h2>
          </div>
          <a className="u-route" href="/blog">
            <span className="u-route__label">All posts</span>
          </a>
        </div>
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
      </div>
    </section>
  );
}
