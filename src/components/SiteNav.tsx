"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SiteNavProps = {
  className?: string;
  linkClassName?: string;
};

type NavKey = "home" | "field-notes" | "story" | "none";

export function SiteNav({ className, linkClassName }: SiteNavProps) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const isHomeRoute = pathname === "/" || pathname === "/home";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  const activeKey: NavKey = isHomeRoute
    ? hash === "#about"
      ? "story"
      : "home"
    : pathname.startsWith("/field-notes")
      ? "field-notes"
      : "none";

  const buildClass = (key: NavKey) =>
    `site-nav-link${activeKey === key ? " is-active" : ""}${linkClassName ? ` ${linkClassName}` : ""}`;

  return (
    <nav className={className}>
      <Link href="/home" className={buildClass("home")} aria-current={activeKey === "home" ? "page" : undefined}>
        Home
      </Link>
      <Link
        href="/field-notes"
        className={buildClass("field-notes")}
        aria-current={activeKey === "field-notes" ? "page" : undefined}
      >
        Field Notes
      </Link>
      <Link href="/#about" className={buildClass("story")} aria-current={activeKey === "story" ? "page" : undefined}>
        Our Story
      </Link>
    </nav>
  );
}
