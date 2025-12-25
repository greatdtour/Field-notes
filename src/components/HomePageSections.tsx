"use client";

import Link from "next/link";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  readTimeMin: number;
  createdAt: string;
  author: { name: string; image?: string | null };
  categories: string;
  mediaId?: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function EditorialPicksSection({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1232px] px-6">
        <div className="flex items-center justify-between">
          <h2
            className="text-[26px] font-semibold md:text-[30px] md:leading-[36px]"
            style={{ fontFamily: "var(--font-display)", color: 'var(--text-primary)' }}
          >
            Editorial Picks
          </h2>
          <Link href="/field-notes" className="text-[16px]" style={{ color: 'var(--text-tertiary)' }}>
            View all -&gt;
          </Link>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/essay/${post.slug}`}
              className="group"
            >
              <p className="text-[12px] uppercase tracking-[0.6px]" style={{ color: 'var(--accent)' }}>
                {post.categories}
              </p>
              <h3 className="mt-2 text-[20px] font-semibold leading-[28px] transition group-hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                {post.title}
              </h3>
              {post.mediaId ? (
                <div
                  className="story-cover mt-3 h-[220px] w-full rounded-[10px]"
                  style={{ backgroundImage: `url(/api/media/${post.mediaId})` }}
                  role="img"
                  aria-label={post.title}
                />
              ) : null}
              <p className="mt-3 text-[16px] leading-[24px] line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                {post.excerpt ?? "Discover this travel story."}
              </p>
              <div className="mt-3 flex items-center gap-3 text-[14px] tracking-[-0.15px]" style={{ color: 'var(--text-muted)' }}>
                <span className="inline-flex items-center gap-2">
                  {post.author.image ? (
                    <img
                      src={post.author.image}
                      alt={post.author.name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold" style={{ background: 'var(--bg-gray-200)', color: 'var(--text-tertiary)' }}>
                      {getInitials(post.author.name)}
                    </span>
                  )}
                  <span>{post.author.name}</span>
                </span>
                <span aria-hidden>&middot;</span>
                <span>{post.readTimeMin} min read</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FieldNotesSection({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1232px] px-6">
        <div className="flex items-center justify-between">
          <h2
            className="text-[26px] font-semibold md:text-[30px] md:leading-[36px]"
            style={{ fontFamily: "var(--font-display)", color: 'var(--text-primary)' }}
          >
            Field Notes
          </h2>
          <Link href="/field-notes" className="text-[16px]" style={{ color: 'var(--text-tertiary)' }}>
            View all -&gt;
          </Link>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/essay/${post.slug}`}
              className="group"
            >
              <p className="text-[12px] uppercase tracking-[0.6px]" style={{ color: 'var(--accent)' }}>
                {post.categories}
              </p>
              <h3 className="mt-2 text-[20px] font-semibold leading-[28px] transition group-hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                {post.title}
              </h3>
              {post.mediaId ? (
                <div
                  className="story-cover mt-3 h-[220px] w-full rounded-[10px]"
                  style={{ backgroundImage: `url(/api/media/${post.mediaId})` }}
                  role="img"
                  aria-label={post.title}
                />
              ) : null}
              <p className="mt-3 text-[16px] leading-[24px] line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                {post.excerpt ?? "Discover this travel story."}
              </p>
              <div className="mt-3 flex items-center gap-3 text-[14px] tracking-[-0.15px]" style={{ color: 'var(--text-muted)' }}>
                <span className="inline-flex items-center gap-2">
                  {post.author.image ? (
                    <img
                      src={post.author.image}
                      alt={post.author.name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold" style={{ background: 'var(--bg-gray-200)', color: 'var(--text-tertiary)' }}>
                      {getInitials(post.author.name)}
                    </span>
                  )}
                  <span>{post.author.name}</span>
                </span>
                <span aria-hidden>&middot;</span>
                <span>{post.readTimeMin} min read</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
