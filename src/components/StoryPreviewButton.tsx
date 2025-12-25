"use client";

import { useMemo, useState } from "react";
import { extractPreviewText } from "@/lib/utils";

type StoryPreviewButtonProps = {
  title: string;
  excerpt: string | null;
  content: string;
  readTimeMin: number;
  authorName: string;
};

export function StoryPreviewButton({ title, excerpt, content, readTimeMin, authorName }: StoryPreviewButtonProps) {
  const [open, setOpen] = useState(false);
  const previewText = useMemo(() => {
    if (excerpt && excerpt.trim().length > 0) return excerpt;
    return extractPreviewText(content, 400);
  }, [content, excerpt]);

  return (
    <>
      <button type="button" className="preview-trigger" onClick={() => setOpen(true)}>
        Preview
      </button>
      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-panel modal-panel-light preview-panel" onClick={(event) => event.stopPropagation()}>
            <div className="preview-header">
              <div>
                <p className="preview-eyebrow">Preview</p>
                <h2 className="preview-title" style={{ fontFamily: "var(--font-display)" }}>
                  {title}
                </h2>
                <p className="story-preview-meta">
                  {authorName} • {readTimeMin} min read
                </p>
              </div>
              <button type="button" className="preview-close" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="preview-content">
              <p className="preview-excerpt">{previewText}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
