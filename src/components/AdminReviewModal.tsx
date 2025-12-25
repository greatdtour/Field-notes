"use client";

import { useEffect, useState } from "react";

type AdminReviewModalProps = {
  postId: string;
  postTitle: string;
  action: (formData: FormData) => void;
};

export function AdminReviewModal({ postId, postTitle, action }: AdminReviewModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" className="edit-story-link" onClick={() => setOpen(true)}>
        Review
      </button>
      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className="modal-panel modal-panel-light review-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="review-header">
              <div>
                <p className="review-eyebrow">Admin review</p>
                <h3 className="review-title">{postTitle}</h3>
                <p className="review-subtitle">
                  Add feedback for the author, then publish or send it back.
                </p>
              </div>
              <button type="button" className="review-close" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <form action={action} className="review-form">
              <input type="hidden" name="postId" value={postId} />
              <label className="review-label" htmlFor="review-note">
                Comment (required when sending back)
              </label>
              <textarea
                id="review-note"
                name="note"
                rows={4}
                placeholder="Add a comment for the author..."
                className="review-textarea"
              />
              <div className="review-actions">
                <button
                  type="submit"
                  name="status"
                  value="NEEDS_CHANGES"
                  className="review-secondary"
                >
                  Send back to pending
                </button>
                <button type="submit" name="status" value="APPROVED" className="review-primary">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
