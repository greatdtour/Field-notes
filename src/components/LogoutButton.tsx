"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";

type LogoutButtonProps = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function LogoutButton({ className, style, children }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = "/home";
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
      style={style}
      aria-busy={loading}
    >
      {children ?? (loading ? "Signing out..." : "Logout")}
    </button>
  );
}
