import { prisma } from "@/lib/db";
import { FieldNotesGrid } from "@/components/FieldNotesGrid";

export const dynamic = "force-dynamic";

export default async function FieldNotesIndexPage() {
  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    readTimeMin: number;
    createdAt: Date;
    author: { name: string; image?: string | null };
    categories: { category: { id: string; name: string } }[];
    tags: { tag: { name: string } }[];
    media: { id: string; type: "PHOTO" | "VIDEO" }[];
    _count: { likes: number; comments: number };
  }> = [];
  let categories: Array<{ id: string; name: string }> = [];
  let tags: Array<{ id: string; name: string }> = [];

  try {
    [posts, categories, tags] = await Promise.all([
      prisma.post.findMany({
        where: { status: "APPROVED" },
        include: {
          categories: { include: { category: { select: { id: true, name: true } } } },
          tags: { include: { tag: true } },
          author: true,
          media: { select: { id: true, type: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.tag.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch (error) {
    console.error("Database connection error:", error);
  }

  return (
    <main style={{ background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
      <FieldNotesGrid posts={posts} categories={categories} tags={tags} />
    </main>
  );
}
