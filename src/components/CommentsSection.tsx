"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CommentEntry,
  COMMENTS_EVENT,
  addComment,
  createCommentId,
  deleteCommentThread,
  readComments,
  toggleCommentLike,
  updateComment,
} from "@/lib/commentsStore";

type CommentsSectionProps = {
  slug: string;
  currentUser?: { id: string; name: string; image?: string | null; role?: string };
  postAuthor?: { id: string; name: string };
};

type CommentGroup = Map<string, CommentEntry[]>;

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function CommentsSection({ slug, currentUser, postAuthor }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    setComments(readComments(slug));

    function handleUpdate(event: Event) {
      const detail = (event as CustomEvent<{ slug: string; commentId?: string }>).detail;
      if (!detail || detail.slug !== slug) return;
      setComments(readComments(slug));
      if (detail.commentId) {
        setHighlightId(detail.commentId);
        setTimeout(() => setHighlightId(null), 2400);
        setTimeout(() => {
          const element = document.getElementById(`comment-${detail.commentId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 50);
      }
    }

    window.addEventListener(COMMENTS_EVENT, handleUpdate);
    return () => window.removeEventListener(COMMENTS_EVENT, handleUpdate);
  }, [slug]);

  useEffect(() => {
    if (currentUser?.name && !replyName) {
      setReplyName(currentUser.name);
    }
  }, [currentUser, replyName]);

  useEffect(() => {
    if (!menuOpenId) return;
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".comment-menu")) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpenId]);

  const isAdmin = currentUser?.role === "ADMIN";

  function canManageComment(comment: CommentEntry) {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (comment.authorId && comment.authorId === currentUser.id) return true;
    return !comment.authorId && comment.author === currentUser.name;
  }

  const groupedComments = useMemo<CommentGroup>(() => {
    const map: CommentGroup = new Map();
    comments.forEach((comment) => {
      const key = comment.parentId ?? "root";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(comment);
    });
    return map;
  }, [comments]);

  function handleReplySubmit(parentId: string) {
    if (!replyMessage.trim()) return;
    const comment: CommentEntry = {
      id: createCommentId(),
      parentId,
      authorId: currentUser?.id ?? null,
      author: currentUser?.name ?? (replyName.trim() || "Guest"),
      authorImage: currentUser?.image ?? null,
      message: replyMessage.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
    };
    addComment(slug, comment);
    setReplyMessage("");
    setReplyName("");
    setReplyToId(null);
  }

  function handleEditStart(comment: CommentEntry) {
    setEditingId(comment.id);
    setEditMessage(comment.message);
    setEditError("");
    setReplyToId(null);
  }

  function handleEditSave(comment: CommentEntry) {
    const nextMessage = editMessage.trim();
    if (!nextMessage) {
      setEditError("Comment cannot be empty.");
      return;
    }
    updateComment(slug, comment.id, nextMessage);
    setEditingId(null);
    setEditMessage("");
    setEditError("");
  }

  function handleDelete(comment: CommentEntry) {
    const confirmed = window.confirm("Delete this comment thread?");
    if (!confirmed) return;
    deleteCommentThread(slug, comment.id);
    if (editingId === comment.id) {
      setEditingId(null);
      setEditMessage("");
      setEditError("");
    }
    if (replyToId === comment.id) {
      setReplyToId(null);
    }
  }

  function toggleReplies(commentId: string) {
    setExpandedReplies((current) => ({
      ...current,
      [commentId]: !current[commentId],
    }));
  }

  function renderThread(parentId: string | null, depth: number) {
    const key = parentId ?? "root";
    const items = groupedComments.get(key) ?? [];
    return items.map((comment) => {
      const isHighlighted = highlightId === comment.id;
      const replyCount = groupedComments.get(comment.id)?.length ?? 0;
      const showReplies = expandedReplies[comment.id];
      const replies = showReplies ? renderThread(comment.id, depth + 1) : null;
      const canManage = canManageComment(comment);
      const isAuthor =
        (postAuthor?.id && comment.authorId === postAuthor.id) ||
        (postAuthor?.name && comment.author === postAuthor.name);
      return (
        <div
          key={comment.id}
          id={`comment-${comment.id}`}
          className={`comment-card ${depth > 0 ? "comment-card--nested" : ""} ${
            isHighlighted ? "is-highlighted" : ""
          }`}
        >
          <div className="comment-card-inner">
            <div className="comment-meta">
              <div className="comment-user">
                {comment.authorImage ? (
                  <img
                    src={comment.authorImage}
                    alt={comment.author}
                    className="comment-avatar"
                  />
                ) : (
                  <div className="comment-avatar comment-avatar-fallback">
                    {comment.author.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="comment-name-row">
                    <p className="comment-name">{comment.author}</p>
                    {isAuthor ? <span className="comment-badge">Author</span> : null}
                  </div>
                  <p className="comment-date">
                    {formatTimestamp(comment.createdAt)}
                    {comment.updatedAt ? " · Edited" : ""}
                  </p>
                </div>
              </div>
              {canManage ? (
                <div className="comment-menu">
                  <button
                    type="button"
                    className="comment-more"
                    onClick={() => setMenuOpenId((value) => (value === comment.id ? null : comment.id))}
                    aria-label="Comment actions"
                  >
                    <span />
                    <span />
                    <span />
                  </button>
                  {menuOpenId === comment.id ? (
                    <div className="comment-menu-panel">
                      <button type="button" onClick={() => handleEditStart(comment)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(comment)}>
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="comment-body">
              {editingId === comment.id ? (
                <div className="comment-edit">
                  <textarea
                    rows={3}
                    value={editMessage}
                    onChange={(event) => setEditMessage(event.target.value)}
                    className="comment-input"
                  />
                  {editError ? <p className="comment-error">{editError}</p> : null}
                  <div className="comment-actions">
                    <button
                      type="button"
                      onClick={() => handleEditSave(comment)}
                      className="comment-action-primary"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditMessage("");
                        setEditError("");
                      }}
                      className="comment-action-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="comment-message">{comment.message}</div>
                  <div className="comment-actions">
                    <button
                      type="button"
                      className={`comment-reaction ${comment.likedByMe ? "is-liked" : ""}`}
                      onClick={() => toggleCommentLike(slug, comment.id)}
                    >
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill={comment.likedByMe ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 12.5V7.6a2 2 0 0 1 2-2h.3a2 2 0 0 1 2 2v4.9" />
                        <path d="M10.3 7.5h.4a2 2 0 0 1 2 2v6.4" />
                        <path d="M12.7 9.4h.3a2 2 0 0 1 2 2v4.2" />
                        <path d="M15 11h.3a2 2 0 0 1 2 2v2.5c0 2.2-1.8 4-4 4H10a4 4 0 0 1-4-4v-3.5c0-.8.7-1.5 1.5-1.5H6" />
                      </svg>
                      {comment.likes > 0 ? <span>{comment.likes}</span> : null}
                    </button>
                    {replyCount > 0 ? (
                      <button
                        type="button"
                        className="comment-replies-toggle"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h5a8 8 0 0 1 8 8Z" />
                        </svg>
                        {showReplies
                          ? "Hide replies"
                          : `${replyCount} reply${replyCount > 1 ? "s" : ""}`}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="comment-reply-link"
                      onClick={() => setReplyToId((value) => (value === comment.id ? null : comment.id))}
                    >
                      Reply
                    </button>
                  </div>
                </>
              )}

              {replyToId === comment.id && (
                <div className="comment-reply-box">
                  {currentUser?.name ? (
                    <div className="comment-reply-user">
                      {currentUser.image ? (
                        <img
                          src={currentUser.image}
                          alt={currentUser.name}
                          className="comment-avatar comment-avatar-sm"
                        />
                      ) : (
                        <div className="comment-avatar comment-avatar-fallback comment-avatar-sm">
                          {currentUser.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span>{currentUser.name}</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={replyName}
                      onChange={(event) => setReplyName(event.target.value)}
                      placeholder="Your name (optional)"
                      className="comment-input"
                    />
                  )}
                  <textarea
                    rows={3}
                    value={replyMessage}
                    onChange={(event) => setReplyMessage(event.target.value)}
                    placeholder="Write a reply..."
                    className="comment-input"
                  />
                  <div className="comment-actions">
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(comment.id)}
                      className="comment-action-primary"
                    >
                      Post reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyToId(null)}
                      className="comment-action-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {replies ? <div className="comment-replies">{replies}</div> : null}
        </div>
      );
    });
  }

  return (
    <section id={`comments-${slug}`} className="comments-panel">
      <div className="comments-header">
        <p className="comments-count">{comments.length} total</p>
      </div>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="comments-empty">
            Be the first to share a thought.
          </div>
        ) : (
          renderThread(null, 0)
        )}
      </div>
    </section>
  );
}
