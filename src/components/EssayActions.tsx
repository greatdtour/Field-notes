"use client";

import { useState } from "react";

type EssayActionsProps = {
  postId: string;
  slug: string;
  initialLikes: number;
  canLike: boolean;
};

export function EssayActions({ postId, slug, initialLikes, canLike }: EssayActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [error, setError] = useState("");

  async function handleLike() {
    setError("");
    const response = await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Unable to like");
      return;
    }

    const data = await response.json();
    setLikes(data.likes ?? likes + 1);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setError("Link copied to clipboard");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <button
          onClick={handleLike}
          disabled={!canLike}
          className="border border-[color:var(--border)] px-4 py-2 rounded-full text-xs uppercase tracking-[0.3em]"
        >
          {canLike ? "Like" : "Login to like"}
        </button>
        <button
          onClick={handleShare}
          className="border border-[color:var(--border)] px-4 py-2 rounded-full text-xs uppercase tracking-[0.3em]"
        >
          Share
        </button>
        <a
          href={`#comments-${slug}`}
          className="border border-[color:var(--border)] px-4 py-2 rounded-full text-xs uppercase tracking-[0.3em]"
        >
          Comment
        </a>
      </div>
      <p className="text-xs text-[color:var(--muted)]">{likes} likes</p>
      {error ? <p className="text-xs text-[color:var(--accent)]">{error}</p> : null}
    </div>
  );
}
