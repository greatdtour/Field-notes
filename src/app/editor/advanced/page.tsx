import Link from "next/link";
import { redirect } from "next/navigation";
import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { estimateReadTimeMinutes, extractPreviewText, slugify } from "@/lib/utils";
import { BlockEditor } from "@/components/BlockEditor";
import { AdvancedEditorShell } from "@/components/AdvancedEditorShell";
import { SeoFields } from "@/components/SeoFields";
import { EditorAutosave } from "@/components/EditorAutosave";
import { PreSubmitChecklist } from "@/components/PreSubmitChecklist";
import { EditorPreview } from "@/components/EditorPreview";

async function createPost(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const metaTitle = String(formData.get("metaTitle") || "").trim();
  const metaDesc = String(formData.get("metaDesc") || "").trim();
  const tagsRaw = String(formData.get("tags") || "").trim();
  const categoriesRaw = String(formData.get("categories") || "").trim();
  const altTextRaw = String(formData.get("altText") || "").trim();
  const statusRaw = String(formData.get("status") || "").trim();

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  const slugBase = slugify(title);
  const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;
  const resolvedExcerpt = excerpt || extractPreviewText(content, 160);
  const readTimeMin = estimateReadTimeMinutes(content);
  const status = (user.role === "ADMIN" && statusRaw ? statusRaw : "DRAFT") as PostStatus;

  const tagNames = tagsRaw
    ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];
  const categoryNames = categoriesRaw
    ? categoriesRaw.split(",").map((cat) => cat.trim()).filter(Boolean)
    : [];

  const altTexts = altTextRaw ? altTextRaw.split("\n").map((line) => line.trim()) : [];
  const files = formData.getAll("mediaFiles");

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      title,
      slug,
      excerpt: resolvedExcerpt,
      content,
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
      status,
      readTimeMin,
    },
  });

  await prisma.postRevision.create({
    data: {
      postId: post.id,
      revision: 1,
      title,
      excerpt: resolvedExcerpt,
      content,
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
    },
  });

  for (const [index, file] of files.entries()) {
    if (!(file instanceof File)) continue;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await prisma.media.create({
      data: {
        postId: post.id,
        type: file.type.startsWith("video") ? "VIDEO" : "PHOTO",
        data: buffer,
        fileName: file.name,
        mimeType: file.type,
        altText: altTexts[index] || file.name,
        sortOrder: index,
      },
    });
  }

  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    await prisma.postTag.create({ data: { postId: post.id, tagId: tag.id } });
  }

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    await prisma.postCategory.create({
      data: { postId: post.id, categoryId: category.id },
    });
  }

  if (status === "APPROVED") {
    redirect(`/essay/${post.slug}`);
  }

  redirect("/editor?submitted=1");
}

export default async function AdvancedEditorPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen pb-20" style={{ background: "var(--page-gradient)" }}>
      <AdvancedEditorShell />
      <section className="mx-auto max-w-[760px] px-6 pt-16">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <EditorPreview formId="editor-form" />
          <Link
            href="/editor"
            className="rounded-full border border-[color:var(--border)] px-5 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            Use basic editor
          </Link>
        </div>

        <form id="editor-form" action={createPost} className="mt-10 grid gap-10">
          <EditorAutosave draftKey={`new-${user.id}`} fallbackDraftKeys={[`advanced-${user.id}`]} />
          <div className="grid gap-10">
            <div className="editor-main">
              <input
                type="text"
                name="title"
                placeholder="Title"
                required
                className="w-full bg-transparent text-[44px] font-semibold leading-[1.1] text-[color:var(--text-primary)] placeholder:text-[color:var(--muted)] focus:outline-none"
                id="editor-title"
                data-autosave="title"
                style={{ fontFamily: "var(--font-display)" }}
              />
              <BlockEditor variant="advanced" />
            </div>
            <details className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
              <summary className="cursor-pointer text-sm font-semibold text-[color:var(--foreground)]">
                Post details
              </summary>
              <div className="mt-6 grid gap-6">
                <div className="editor-panel-card">
                  <p className="editor-panel-title">Details</p>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        Tags
                      </label>
                      <input
                        type="text"
                        name="tags"
                        placeholder="Adventure, Coast, Culture"
                        className="editor-input"
                        id="editor-tags"
                        data-autosave="tags"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        Categories
                      </label>
                      <input
                        type="text"
                        name="categories"
                        placeholder="Nature, Mountains, City"
                        className="editor-input"
                        id="editor-categories"
                        data-autosave="categories"
                      />
                    </div>
                  </div>
                </div>
                <div className="editor-panel-card">
                  <p className="editor-panel-title">SEO</p>
                  <SeoFields />
                </div>
                {user.role === "ADMIN" ? (
                  <div className="editor-panel-card">
                    <p className="editor-panel-title">Publish</p>
                    <select name="status" className="editor-input" defaultValue="DRAFT">
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="NEEDS_CHANGES">Needs Changes</option>
                    </select>
                  </div>
                ) : null}
                <PreSubmitChecklist formId="editor-form" />
              </div>
            </details>
          </div>
        </form>
      </section>
    </main>
  );
}
