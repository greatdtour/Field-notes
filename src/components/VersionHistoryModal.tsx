"use client";

import { useEffect, useState } from "react";

type RevisionEntry = {
  id: string;
  revision: number;
  createdAt: string;
};

type VersionHistoryModalProps = {
  revisions: RevisionEntry[];
  currentRevision: number;
  restoreAction: (formData: FormData) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function VersionHistoryModal({
  revisions,
  currentRevision,
  restoreAction,
}: VersionHistoryModalProps) {
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

  if (!revisions.length) return null;

  return (
    <>
      <button type="button" className="feedback-button-outline" onClick={() => setOpen(true)}>
        Version history
      </button>
      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-panel modal-panel-light feedback-panel" onClick={(event) => event.stopPropagation()}>
            <div className="feedback-header">
              <div>
                <p className="feedback-eyebrow">Version history</p>
                <h3 className="feedback-title">Restore a previous version</h3>
              </div>
              <button type="button" className="feedback-close" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="feedback-list">
              {revisions.map((revision) => {
                const isCurrent = revision.revision === currentRevision;
                return (
                  <div key={revision.id} className="feedback-card">
                    <div className="feedback-card-header">
                      <div>
                        <p className="feedback-card-title">
                          Version {revision.revision}
                          {isCurrent ? " (current)" : ""}
                        </p>
                        <p className="feedback-card-meta">{formatDate(revision.createdAt)}</p>
                      </div>
                      {!isCurrent ? (
                        <form action={restoreAction}>
                          <input type="hidden" name="revisionId" value={revision.id} />
                          <button type="submit" className="feedback-card-link">
                            Restore
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
