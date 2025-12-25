import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeTab = resolvedSearchParams?.tab ?? "drafts";

  const [draftCount, pendingCount, approvedCount, needsChangesCount] = await Promise.all([
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.count({ where: { status: "PENDING" } }),
    prisma.post.count({ where: { status: "APPROVED" } }),
    prisma.post.count({ where: { status: "NEEDS_CHANGES" } }),
  ]);
  const submissionsCount = pendingCount + needsChangesCount;

  const pendingPosts = await prisma.post.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { author: true },
  });

  return (
    <main className="page-shell pb-16">
      <section className="section-card p-10">
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Admin</p>
        <h2 className="text-3xl font-semibold mt-4" style={{ fontFamily: "var(--font-display)", color: 'var(--text-primary)' }}>
          Dashboard
        </h2>
        <div className="admin-tabs mt-8">
          {[
            { id: "drafts", label: "Drafts", count: draftCount },
            { id: "scheduled", label: "Scheduled", count: 0 },
            { id: "published", label: "Published", count: approvedCount },
            { id: "unlisted", label: "Unlisted", count: 0 },
            { id: "submissions", label: "Submissions", count: submissionsCount },
          ].map((tab) => (
            <Link
              key={tab.id}
              href={`/admin?tab=${tab.id}`}
              className={`admin-tab ${activeTab === tab.id ? "admin-tab-active" : ""}`}
            >
              <span>{tab.label}</span>
              <span className="admin-tab-count">{tab.count}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Pending approvals: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pendingPosts.length}</span>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link className="section-card p-6 transition hover:opacity-80" href="/admin/moderation">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Moderation</h3>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Review and approve essays.</p>
          </Link>
          <Link className="section-card p-6 transition hover:opacity-80" href="/admin/layout">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Layout Builder</h3>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Drag and drop page sections.</p>
          </Link>
          <Link className="section-card p-6 transition hover:opacity-80" href="/editor">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Create Essay</h3>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Post as admin.</p>
          </Link>
        </div>
        <div className="mt-10">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Awaiting approval</h3>
          <div className="mt-4 grid gap-3">
            {pendingPosts.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pending essays right now.</p>
            ) : (
              pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="border rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                  style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-white)' }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{post.title}</p>
                    <p className="text-xs uppercase tracking-[0.3em] mt-1" style={{ color: 'var(--text-muted)' }}>
                      {post.author.name}
                    </p>
                  </div>
                  <Link
                    href={`/essay/${post.slug}?review=1`}
                    className="text-xs uppercase tracking-[0.3em] transition hover:opacity-70"
                    style={{ color: 'var(--text-accent)' }}
                  >
                    Review →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
