"use client";

import { useEffect, useMemo, useState } from "react";
import { addComment, createCommentId } from "@/lib/commentsStore";

const LIKE_KEY = "gdt-liked";

type EssayActionIconsProps = {
  postId: string;
  slug: string;
  canLike: boolean;
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  currentUser?: { id: string; name: string; image?: string | null; role?: string };
};

function readLikes() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const stored = window.localStorage.getItem(LIKE_KEY);
    if (!stored) return [] as string[];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as string[]) : ([] as string[]);
  } catch {
    return [] as string[];
  }
}

function writeLikes(next: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LIKE_KEY, JSON.stringify(next));
}

export function EssayActionIcons({
  postId,
  slug,
  canLike,
  title,
  excerpt,
  imageUrl,
  currentUser,
}: EssayActionIconsProps) {
  const [liked, setLiked] = useState(false);
  const [status, setStatus] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentMounted, setCommentMounted] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    const items = readLikes();
    setLiked(items.includes(slug));
  }, [slug]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.name && !commentName) {
      setCommentName(currentUser.name);
    }
  }, [currentUser, commentName]);

  useEffect(() => {
    if (commentOpen) {
      setCommentMounted(true);
      requestAnimationFrame(() => setCommentVisible(true));
      return;
    }
    setCommentVisible(false);
    const timer = setTimeout(() => setCommentMounted(false), 180);
    return () => clearTimeout(timer);
  }, [commentOpen]);

  async function handleLike() {
    setStatus("");
    if (!canLike) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });

    if (!response.ok) {
      setStatus("Unable to like right now.");
      return;
    }

    const nextLiked = !liked;
    const items = readLikes();
    const next = nextLiked ? [...items, slug] : items.filter((item) => item !== slug);
    writeLikes(next);
    setLiked(nextLiked);
  }

  function handleShareOpen() {
    setStatus("");
    setShareOpen(true);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("Link copied to clipboard.");
    } catch {
      setStatus("Unable to copy link.");
    }
  }

  function handleCommentSubmit() {
    if (!commentMessage.trim()) {
      setCommentError("Add a comment before posting.");
      return;
    }
    const comment = {
      id: createCommentId(),
      parentId: null,
      authorId: currentUser?.id ?? null,
      author: currentUser?.name ?? (commentName.trim() || "Guest"),
      authorImage: currentUser?.image ?? null,
      message: commentMessage.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
    };
    addComment(slug, comment);
    setCommentMessage("");
    setCommentName("");
    setCommentError("");
    setCommentOpen(false);
    setStatus("Comment posted.");
  }

  const shareLinks = useMemo(() => {
    const safeUrl = encodeURIComponent(shareUrl);
    const shareTitle = title || (typeof document !== "undefined" ? document.title : "Field Note");
    const shareText = excerpt || "Read this field note.";
    const encodedText = encodeURIComponent(`${shareTitle} - ${shareText}`);
    return [
      {
        label: "Facebook",
        url: `https://www.facebook.com/sharer/sharer.php?u=${safeUrl}`,
      },
      {
        label: "X",
        url: `https://twitter.com/intent/tweet?url=${safeUrl}&text=${encodedText}`,
      },
      {
        label: "LinkedIn",
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${safeUrl}`,
      },
      {
        label: "WhatsApp",
        url: `https://wa.me/?text=${encodedText}%20${safeUrl}`,
      },
    ];
  }, [shareUrl, title, excerpt]);

  const baseClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[#e1e5ea] bg-white text-[#101828] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d0d5dd] hover:bg-[#f8fafc] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f54900]/40";

  return (
    <div className="flex items-center gap-3">
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
      <button
        type="button"
        onClick={handleLike}
        aria-label={canLike ? "Like" : "Login to like"}
        aria-pressed={liked}
        className={`${baseClass} ${liked ? "text-[#f54900]" : ""}`}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setCommentOpen(true)}
        aria-label="Comment"
        className={baseClass}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h5a8 8 0 0 1 8 8Z" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleShareOpen}
        aria-label="Share"
        className={baseClass}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.4 11l6.9-3.8" />
          <path d="M8.4 13l6.9 3.8" />
        </svg>
      </button>

      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-[440px] rounded-2xl p-6 shadow-xl"
            style={{ background: 'var(--bg-white)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>Share this story</p>
                <p className="mt-1 text-[14px]" style={{ color: 'var(--text-muted)' }}>Choose a channel to post this field note.</p>
              </div>
              <button
                type="button"
                className="rounded-full border px-3 py-1 text-[12px] transition hover:opacity-70"
                style={{ borderColor: 'var(--border-gray)', color: 'var(--text-tertiary)' }}
                onClick={() => setShareOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-gray-50)' }}>
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-32 w-full object-cover" />
              ) : (
                <div className="h-32 w-full bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0]" />
              )}
              <div className="p-4">
                <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title || "Field Note"}</p>
                <p className="mt-1 text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  {excerpt || "A quick snapshot from the latest field note."}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {shareLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
                  className="rounded-full border px-4 py-2 text-[13px] font-semibold transition hover:opacity-80"
                  style={{ borderColor: 'var(--border-gray)', color: 'var(--text-primary)' }}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-11 flex-1 items-center rounded-full border px-4 text-[12px]" style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-gray-50)', color: 'var(--text-muted)' }}>
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-11 rounded-full px-6 text-[12px] font-semibold text-white transition hover:opacity-90"
                style={{ background: 'var(--button-primary)' }}
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      )}

      {commentMounted && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 transition-opacity duration-200 ${
            commentVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setCommentOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className={`w-full max-w-[420px] rounded-2xl p-6 shadow-xl transition duration-200 ${
              commentVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-95"
            }`}
            style={{ background: 'var(--bg-white)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>Add a comment</p>
                <p className="mt-1 text-[14px]" style={{ color: 'var(--text-muted)' }}>Share your thoughts with the community.</p>
              </div>
              <button
                type="button"
                className="rounded-full border px-3 py-1 text-[12px] transition hover:opacity-70"
                style={{ borderColor: 'var(--border-gray)', color: 'var(--text-tertiary)' }}
                onClick={() => setCommentOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {currentUser?.name ? (
                <div className="flex items-center gap-3 rounded-xl border px-3 py-2 text-[14px]" style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
                  {currentUser.image ? (
                    <img
                      src={currentUser.image}
                      alt={currentUser.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold" style={{ background: 'var(--bg-gray-200)', color: 'var(--text-tertiary)' }}>
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                      Signed in
                    </p>
                    <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</p>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={commentName}
                  onChange={(event) => setCommentName(event.target.value)}
                  placeholder="Your name (optional)"
                  className="h-11 rounded-xl border px-3 text-[14px]"
                  style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}
                />
              )}
              <textarea
                rows={4}
                value={commentMessage}
                onChange={(event) => {
                  setCommentMessage(event.target.value);
                  setCommentError("");
                }}
                placeholder="Write your comment..."
                className="rounded-xl border px-3 py-2 text-[14px]"
                style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}
              />
              {commentError && <p className="text-[12px] text-[#d92d20]">{commentError}</p>}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCommentSubmit}
                className="rounded-full px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
                style={{ background: 'var(--button-primary)' }}
              >
                Post comment
              </button>
              <button
                type="button"
                onClick={() => setCommentOpen(false)}
                className="rounded-full border px-5 py-2 text-[13px] font-semibold transition hover:opacity-70"
                style={{ borderColor: 'var(--border-gray)', color: 'var(--text-tertiary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
