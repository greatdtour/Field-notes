"use client";

import { useState } from "react";

type NotificationItem = {
  id: string;
  postTitle: string;
  note: string;
  createdAt: string;
  postId: string;
};

type NotificationsBellProps = {
  items: NotificationItem[];
};

export function NotificationsBell({ items }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const count = items.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="header-icon-button"
        aria-label="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-5 w-5"
        >
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {count > 0 ? <span className="header-icon-badge">{count}</span> : null}
      </button>
      {open ? (
        <div className="header-popover">
          <p className="header-popover-title">Admin comments</p>
          {count === 0 ? (
            <p className="header-popover-empty">No new updates yet.</p>
          ) : (
            <div className="mt-3 grid gap-3">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`/editor/edit/${item.postId}`}
                  className="header-popover-item"
                >
                  <p className="font-semibold">{item.postTitle}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{item.note}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {item.createdAt}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
