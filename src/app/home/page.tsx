import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCategoryLabel(categories: { category: { name: string } }[]) {
  return categories[0]?.category.name ?? "Field Notes";
}

function getPhotoId(media: { id: string; type: "PHOTO" | "VIDEO" }[]) {
  return media.find((item) => item.type === "PHOTO")?.id;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function FieldNotesPage() {
  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    readTimeMin: number;
    createdAt: Date;
    author: { name: string; image?: string | null };
    categories: { category: { name: string } }[];
    media: { id: string; type: "PHOTO" | "VIDEO" }[];
  }> = [];

  try {
    posts = await prisma.post.findMany({
      where: { status: "APPROVED" },
      include: {
        categories: { include: { category: true } },
        author: true,
        media: { select: { id: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }

  const featured = posts[0];
  const editorialPicks = posts.slice(1, 4);
  const fieldNotes = posts.slice(4, 7);

  return (
    <main style={{ background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
      <section
        className="relative"
        style={{
          background: "var(--hero-gradient)",
        }}
      >
        <div className="mx-auto max-w-[1232px] px-6 py-24 text-center md:py-32">
          <h1
            className="text-[48px] leading-[1.1] tracking-[0.12px] md:text-[72px] md:leading-[72px]"
            style={{ fontFamily: "var(--font-display)", color: 'var(--text-primary)' }}
          >
            Stories from the Road
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-[18px] leading-[30px] md:text-[24px] md:leading-[39px] md:tracking-[0.07px]" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold italic">Field Notes</span> is Great D&apos;Tour&apos;s editorial
            journal capturing travel experiences, cultural encounters, and moments of wonder from
            explorers, exploring identity, experience, and meaning beyond destinations and deals.
          </p>
          <a
            href="#featured"
            className="btn-primary mt-10 inline-flex h-[60px] min-w-[204px] items-center justify-center gap-[6px] rounded-full px-8 text-[18px] font-medium tracking-[-0.44px] transition"
          >
            Start Reading
            <img src="/assets/figma/hero-arrow.svg" alt="" className="h-5 w-5" />
          </a>
        </div>
      </section>

      {featured ? (
        <section id="featured" className="py-16">
          <div className="mx-auto max-w-[1232px] px-6">
            <p className="text-[14px] uppercase tracking-[0.55px]" style={{ color: 'var(--text-muted)' }}>
              Featured Essay
            </p>
            <Link
              href={`/essay/${featured.slug}`}
              className="mt-8 grid gap-8 pb-16 md:grid-cols-2"
              style={{ borderBottom: '1px solid var(--border-gray)' }}
            >
              <div className="order-2 md:order-1">
                {getPhotoId(featured.media) ? (
                  <img
                    src={`/api/media/${getPhotoId(featured.media)}`}
                    alt={featured.title}
                    className="h-[320px] w-full rounded-[10px] object-cover md:h-[375px]"
                  />
                ) : (
                  <div className="h-[320px] w-full rounded-[10px] bg-gradient-to-br from-[#fef3c7] to-[#fde68a] md:h-[375px]" />
                )}
              </div>
              <div className="order-1 md:order-2">
                <p className="text-[14px] uppercase tracking-[0.55px] text-[#f54900]">
                  {getCategoryLabel(featured.categories)}
                </p>
                <h2
                  className="mt-3 text-[28px] font-semibold leading-[32px] md:text-[36px] md:leading-[40px]"
                  style={{ fontFamily: "var(--font-display)", color: 'var(--text-primary)' }}
                >
                  {featured.title}
                </h2>
                <p className="mt-4 text-[16px] leading-[26px] md:text-[18px] md:leading-[29px]" style={{ color: 'var(--text-tertiary)' }}>
                  {featured.excerpt ??
                    "An unforgettable journey through one of the world's most dramatic landscapes, where towering peaks meet endless glaciers and the wind carries stories of ancient explorers."}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-[14px] tracking-[-0.15px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="inline-flex items-center gap-2">
                    {featured.author.image ? (
                      <img
                        src={featured.author.image}
                        alt={featured.author.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold" style={{ background: 'var(--bg-gray-200)', color: 'var(--text-tertiary)' }}>
                        {getInitials(featured.author.name)}
                      </span>
                    )}
                    <span>{featured.author.name}</span>
                  </span>
                  <span aria-hidden>&middot;</span>
                  <span>{formatDate(featured.createdAt)}</span>
                  <span aria-hidden>&middot;</span>
                  <span>{featured.readTimeMin} min read</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      {editorialPicks.length ? (
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
              {editorialPicks.map((post) => {
                const mediaId = getPhotoId(post.media);
                return (
                  <Link
                    key={post.id}
                    href={`/essay/${post.slug}`}
                    className="group"
                  >
                    <p className="text-[12px] uppercase tracking-[0.6px]" style={{ color: 'var(--text-accent)' }}>
                      {getCategoryLabel(post.categories)}
                    </p>
                    <h3 className="mt-2 text-[20px] font-semibold leading-[28px] transition group-hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                      {post.title}
                    </h3>
                    {mediaId ? (
                      <div
                        className="story-cover mt-3 h-[220px] w-full rounded-[10px]"
                        style={{ backgroundImage: `url(/api/media/${mediaId})` }}
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
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12">
        <div className="mx-auto max-w-[1232px] px-6">
          <div
            className="rounded-[28px] px-6 py-12 text-center text-white md:px-12 md:py-16"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, #ff9d2b 0%, #f06a00 38%, #c6451f 58%, #6b1f6b 78%, #2a0a6d 100%)",
            }}
          >
            <div className="mx-auto inline-flex h-[40px] items-center gap-2 rounded-full px-5 text-[14px] font-medium" style={{ background: 'rgba(15, 23, 42, 0.9)', color: '#ffffff' }}>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
              </svg>
              Coming Soon
            </div>
            <h2
              className="mt-8 text-[32px] font-semibold md:text-[48px] md:leading-[56px]"
              style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.35)" }}
            >
              Introducing Great D&apos;Tour
            </h2>
            <p
              className="mx-auto mt-4 max-w-3xl text-[16px] leading-[26px] text-white md:text-[20px] md:leading-[32.5px]"
              style={{ textShadow: "0 2px 12px rgba(0, 0, 0, 0.35)" }}
            >
              A new platform for discovering and booking niche travel experiences. From hidden
              culinary gems to off-the-beaten-path adventures, Great D&apos;Tour connects you with
              extraordinary journeys curated by local experts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="flex h-12 w-[154px] items-center justify-center rounded-full text-[16px] font-semibold tracking-[-0.31px] transition hover:opacity-90"
                style={{ background: 'var(--bg-white)', color: 'var(--text-accent)' }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>

      {fieldNotes.length ? (
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
              {fieldNotes.map((post) => {
                const mediaId = getPhotoId(post.media);
                return (
                  <Link
                    key={post.id}
                    href={`/essay/${post.slug}`}
                    className="group"
                  >
                    <p className="text-[12px] uppercase tracking-[0.6px]" style={{ color: 'var(--text-accent)' }}>
                      {getCategoryLabel(post.categories)}
                    </p>
                    <h3 className="mt-2 text-[20px] font-semibold leading-[28px] transition group-hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                      {post.title}
                    </h3>
                    {mediaId ? (
                      <div
                        className="story-cover mt-3 h-[220px] w-full rounded-[10px]"
                        style={{ backgroundImage: `url(/api/media/${mediaId})` }}
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
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[#b54a1a] dark:bg-[#101828] text-white">
        <div className="mx-auto max-w-[1232px] px-6 py-16">
          <div className="mx-auto max-w-[896px] text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <span className="relative h-8 w-8">
                <span className="absolute" style={{ inset: "16.67% 8.33%" }}>
                  <img
                    src="/assets/figma/subscribe-vector-1.svg"
                    alt=""
                    className="block h-full w-full"
                  />
                </span>
                <span className="absolute" style={{ inset: "29.17% 8.33% 45.85% 8.33%" }}>
                  <img
                    src="/assets/figma/subscribe-vector-2.svg"
                    alt=""
                    className="block h-full w-full"
                  />
                </span>
              </span>
            </div>
            <h2
              className="mt-6 text-[32px] font-semibold md:text-[48px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Subscribe to Field Notes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-[1.6] text-white md:text-[20px]">
              Get our latest stories delivered to your inbox. Join thousands of travelers
              discovering the world through authentic experiences.
            </p>
            <form
              action="/api/subscribe"
              method="post"
              className="mx-auto mt-8 flex w-full max-w-[576px] flex-col gap-4 md:flex-row"
              suppressHydrationWarning
            >
              <label className="flex-1">
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email address"
                  className="h-[58px] w-full rounded-full border border-white/20 bg-white/10 px-6 text-[16px] text-white placeholder:text-[#99a1af]"
                  autoComplete="off"
                  data-keeper-ignore="true"
                  data-keeper-lock="false"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  suppressHydrationWarning
                />
              </label>
              <button
                type="submit"
                className="flex h-[58px] items-center justify-center gap-2 rounded-full bg-white px-8 text-[16px] font-medium text-[#101828]"
              >
                Subscribe
                <img src="/assets/figma/subscribe-arrow.svg" alt="" className="h-5 w-5" />
              </button>
            </form>
            <p className="mt-4 text-[14px] text-white/80">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-8 border-t border-white/10 pt-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[16px] italic text-white">
                Follow our journey as we curate India&apos;s most unique travel stories.
              </p>
              <div className="mt-4 flex items-center gap-4 text-white/80">
                <a
                  href="https://www.facebook.com/profile.php?id=61583154056838"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="/assets/figma/social-facebook.svg" alt="" className="h-6 w-6" />
                </a>
                <a
                  href="https://www.instagram.com/greatdtour/"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="/assets/figma/social-instagram.svg" alt="" className="h-6 w-6" />
                </a>
                <a
                  href="https://www.linkedin.com/company/greatdtour"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="/assets/figma/social-linkedin.svg" alt="" className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div className="text-sm text-white/80 md:text-right">
              <p>
                Contact Us :
                <a className="ml-2 text-white" href="mailto:hello@greatdtour.com">
                  hello@greatdtour.com
                </a>
              </p>
              <p className="mt-2 text-xs text-white/60">
                All Rights Reserved by Chomps Innovation Labs LLP, Bengaluru, India
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
