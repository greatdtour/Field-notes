"use client";

import { useEffect } from "react";

export function AdvancedEditorShell() {
  useEffect(() => {
    document.body.classList.add("advanced-editor-body");
    return () => {
      document.body.classList.remove("advanced-editor-body");
    };
  }, []);

  return null;
}
