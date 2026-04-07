"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./AppShell.module.css";

type NavItem = { href: string; label: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "",
    items: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    label: "Schools",
    items: [{ href: "/schools", label: "All schools" }],
  },
  {
    label: "Profile",
    items: [{ href: "/academic", label: "Academic" }],
  },
  {
    label: "Application",
    items: [
      { href: "/more/letters", label: "Letters of Rec" },
      { href: "/more/essays", label: "Essays" },
      { href: "/more/network", label: "Network" },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/experience", label: "Experience" },
      { href: "/shadowing", label: "Shadowing" },
      { href: "/certifications", label: "Certifications" },
      { href: "/more/publications", label: "Publications" },
      { href: "/more/conferences", label: "Conferences" },
      { href: "/more/volunteer", label: "Volunteer" },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className={styles.shell}>
      {/* Mobile top bar */}
      <header className={styles.mobileBar}>
        <Link href="/dashboard" className={styles.logo}>
          Path Tracker
        </Link>
        <button
          className={styles.burger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar}${mobileOpen ? ` ${styles.sidebarOpen}` : ""}`}
      >
        <Link href="/dashboard" className={styles.sidebarLogo}>
          Path Tracker
        </Link>

        <nav className={styles.nav}>
          {NAV.map((group, i) => (
            <div key={i} className={styles.group}>
              {group.label && (
                <div className={styles.groupLabel}>{group.label}</div>
              )}
              <div className={styles.groupItems}>
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.item}${active ? ` ${styles.itemActive}` : ""}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button className={styles.signOut} onClick={handleSignOut}>
          Sign out
        </button>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
