"use client";

import { useMemo, useState } from "react";
import { extractPreviewText } from "@/lib/utils";

type MediaItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
};

type Category = {
  id: string;
  name: string;
};

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: string;
  author: { name: string };
  media: MediaItem[];
  categories: { category: Category }[];
};

type AdminModerationPanelProps = {
  posts: Post[];
  action: (formData: FormData) => void;
};

function renderContent(content: string, expanded: boolean) {
  const maxLength = expanded ? 2000 : 420;
  return extractPreviewText(content, maxLength);
}

export function AdminModerationPanel({ posts, action }: AdminModerationPanelProps) {
  const [selected, setSelected] = useState<Post | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "NEEDS_CHANGES">("ALL");

  const categoryLabel = useMemo(() => {
    if (!selected) return "";
    return selected.categories.map((item) => item.category.name).join(" / ");
  }, [selected]);

  const filteredPosts = useMemo(() => {
    if (filter === "ALL") return posts;
    return posts.filter((post) => post.status === filter);
  }, [filter, posts]);

  return (
    <div className="grid gap-6">
      <div className="moderation-filters">
        {["ALL", "PENDING", "NEEDS_CHANGES"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item as "ALL" | "PENDING" | "NEEDS_CHANGES")}
            className={`moderation-filter ${filter === item ? "active" : ""}`}
          >
            {item.replace("_", " ").toLowerCase()}
          </button>
        ))}
      </div>
      <div className="moderation-grid">
        {filteredPosts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => {
              setSelected(post);
              setExpanded(false);
              setActiveMediaId(null);
            }}
            className="moderation-card moderation-card--list"
          >
            <div className="moderation-thumb">
              {post.media[0] ? (
                post.media[0].type === "VIDEO" ? (
                  <video className="w-full h-full object-cover" muted>
                    <source src={`/api/media/${post.media[0].id}`} />
                  </video>
                ) : (
                  <img src={`/api/media/${post.media[0].id}`} alt="" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="moderation-thumb-placeholder" />
              )}
            </div>
            <div className="moderation-card-body">
              <div className="moderation-card-header">
                <span className="moderation-badge">{post.status.replace("_", " ")}</span>
                <span className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
                  {post.author.name}
                </span>
              </div>
              <h3 className="text-lg font-semibold mt-3" style={{ fontFamily: "var(--font-display)", color: 'var(--text-primary)' }}>
                {post.title}
              </h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                {post.excerpt ?? extractPreviewText(post.content, 160)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected ? (
        <div
          className="modal-backdrop"
          onClick={() => {
            setSelected(null);
            setExpanded(false);
            setActiveMediaId(null);
          }}
        >
          <div
            className={`modal-panel modal-panel-light ${expanded ? "modal-panel-expanded" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
                  {categoryLabel || "Field Notes"}
                </p>
                <h3 className="text-2xl font-semibold mt-2" style={{ fontFamily: "var(--font-display)", color: 'var(--text-primary)' }}>
                  {selected.title}
                </h3>
                <p className="text-xs uppercase tracking-[0.3em] mt-2" style={{ color: 'var(--text-muted)' }}>
                  {selected.author.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setExpanded(false);
                  setActiveMediaId(null);
                }}
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: 'var(--text-muted)' }}
              >
                Close
              </button>
            </div>

            <div className="mt-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {renderContent(selected.content, expanded)}
            </div>

            {selected.media.length > 0 ? (
              <div className="mt-6 grid gap-3">
                <div className="media-gallery">
                  <div className="media-gallery-thumbs">
                    {selected.media.map((media) => (
                      <button
                        key={media.id}
                        type="button"
                        className={`media-thumb ${activeMediaId === media.id ? "active" : ""}`}
                        onClick={() => setActiveMediaId(media.id)}
                      >
                        {media.type === "VIDEO" ? (
                          <video className="w-full h-full object-cover" muted>
                            <source src={`/api/media/${media.id}`} />
                          </video>
                        ) : (
                          <img src={`/api/media/${media.id}`} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="media-gallery-stage">
                    {(() => {
                      const activeId = activeMediaId ?? selected.media[0]?.id;
                      const active = selected.media.find((item) => item.id === activeId);
                      if (!active) return null;
                      return active.type === "VIDEO" ? (
                        <video controls className="w-full h-full object-cover rounded-2xl">
                          <source src={`/api/media/${active.id}`} />
                        </video>
                      ) : (
                        <img
                          src={`/api/media/${active.id}`}
                          alt=""
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : null}

            <form action={action} className="mt-6 grid gap-3">
              <input type="hidden" name="postId" value={selected.id} />
              <select
                name="status"
                className="border rounded-lg px-3 py-2"
                style={{ 
                  backgroundColor: 'var(--bg-gray-50)', 
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-gray)'
                }}
                defaultValue={selected.status}
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
                <option value="NEEDS_CHANGES">Needs Changes</option>
              </select>
              <textarea
                name="note"
                placeholder="Admin comment (required for changes)"
                className="border rounded-lg px-3 py-2 min-h-[100px]"
                style={{ 
                  backgroundColor: 'var(--bg-gray-50)', 
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-gray)'
                }}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="border px-4 py-2 rounded-full text-xs uppercase tracking-[0.3em]"
                  style={{ 
                    borderColor: 'var(--border-gray)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {expanded ? "Collapse preview" : "Expand preview"}
                </button>
                <button 
                  className="px-4 py-2 rounded-full text-xs uppercase tracking-[0.3em] text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
