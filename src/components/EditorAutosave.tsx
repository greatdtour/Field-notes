"use client";

import { useEffect, useState } from "react";

type EditorAutosaveProps = {
  draftKey: string;
  fallbackDraftKeys?: string[];
};

export function EditorAutosave({ draftKey, fallbackDraftKeys = [] }: EditorAutosaveProps) {
  const storageKey = `gdt-draft-${draftKey}`;
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    let saved = localStorage.getItem(storageKey);
    if (!saved && fallbackDraftKeys.length > 0) {
      for (const key of fallbackDraftKeys) {
        const legacy = localStorage.getItem(`gdt-draft-${key}`);
        if (legacy) {
          saved = legacy;
          localStorage.setItem(storageKey, legacy);
          break;
        }
      }
    }
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      Object.entries(data.values || {}).forEach(([key, value]) => {
        const field = document.querySelector(`[data-autosave="${key}"]`) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | null;
        if (field && typeof value === "string") {
          field.value = value;
          field.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
      if (data.lastSaved) {
        setLastSaved(new Date(data.lastSaved).toLocaleTimeString());
      }
    } catch {
      // ignore invalid cache
    }

    const handler = () => {
      const values: Record<string, string> = {};
      document.querySelectorAll("[data-autosave]").forEach((node) => {
        const element = node as HTMLInputElement | HTMLTextAreaElement;
        const key = element.getAttribute("data-autosave");
        if (key) {
          values[key] = element.value;
        }
      });
      const payload = { values, lastSaved: Date.now() };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setLastSaved(new Date(payload.lastSaved).toLocaleTimeString());
    };

    const interval = window.setInterval(handler, 10000);
    document.addEventListener("input", handler);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("input", handler);
    };
  }, [storageKey, fallbackDraftKeys.join("|")]);

  return (
    <div className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
      {lastSaved ? `Saved ${lastSaved}` : "Autosave enabled"}
    </div>
  );
}
