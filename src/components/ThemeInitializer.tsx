"use client";

import { useEffect } from "react";

const storageKey = "theme-mode";

function resolveThemeMode(): "dark" | "light" {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = localStorage.getItem(storageKey);
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeInitializer() {
  useEffect(() => {
    const mode = resolveThemeMode();
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem(storageKey, mode);
  }, []);
  return null;
}
