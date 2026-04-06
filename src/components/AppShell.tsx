"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./AppShell.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schools", label: "Schools" },
  { href: "/academic", label: "Academic" },
  { href: "/shadowing", label: "Shadowing" },
  { href: "/certifications", label: "Certs" },
  { href: "/experience", label: "Experience" },
];

const MORE = [
  { href: "/more/letters", label: "Letters of Rec" },
  { href: "/more/essays", label: "Essays" },
  { href: "/more/network", label: "Network" },
  { href: "/more/publications", label: "Publications" },
  { href: "/more/conferences", label: "Conferences" },
  { href: "/more/volunteer", label: "Volunteer" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isMoreActive = pathname.startsWith("/more/");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.logo}>
          Path Tracker
        </Link>

        {/* Desktop tabs */}
        <div className={styles.tabs}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.tab}${pathname.startsWith(item.href) ? ` ${styles.tabActive}` : ""}`}
            >
              {item.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className={styles.moreWrap} ref={moreRef}>
            <button
              className={`${styles.tab}${isMoreActive ? ` ${styles.tabActive}` : ""}`}
              onClick={() => setMoreOpen(!moreOpen)}
            >
              More {moreOpen ? "×" : "+"}
            </button>
            {moreOpen && (
              <div className={styles.moreDropdown}>
                {MORE.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.moreItem}${pathname === item.href ? ` ${styles.moreItemActive}` : ""}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className={styles.signOut} onClick={handleSignOut}>
          Sign out
        </button>

        {/* Mobile burger */}
        <button
          className={styles.burger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            {MORE.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <button onClick={handleSignOut}>Sign out</button>
          </div>
        )}
      </nav>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
