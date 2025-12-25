"use client";

import { useEffect, useMemo, useState } from "react";

const storageKey = "theme-mode";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(storageKey);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  const icon = useMemo(
    () =>
      theme === "dark" ? (
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
          <path
            d="M12 3a9 9 0 0 1 0 18c-4.493 0-8.365-3.177-9.223-7.5C3.318 9.371 7.507 5.442 12 3z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    [theme],
  );

  useEffect(() => {
    setMounted(true);
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(storageKey, theme);
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <button
        type="button"
        className="theme-toggle-btn"
        aria-label="Toggle dark mode"
        disabled
      >
        <span className="sr-only">Toggle dark mode</span>
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 opacity-50">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      aria-pressed={theme === "dark"}
      onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
    >
      <span className="sr-only">Toggle dark mode</span>
      {icon}
    </button>
  );
}
