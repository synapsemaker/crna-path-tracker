"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupHref, setSignupHref] = useState("/signup");
  const router = useRouter();
  const supabase = createClient();

  // Carry the ?next= query through to signup so unauthenticated users sent
  // by the Meridian Finder can sign up and still land on the prefilled form.
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) setSignupHref(`/signup?next=${encodeURIComponent(next)}`);
  }, []);

  // Read the destination from `?next=` and only allow same-origin paths.
  // Anything that doesn't start with "/" (or starts with "//" — protocol-relative)
  // is rejected to avoid open-redirect vulns.
  function getSafeNext(): string {
    if (typeof window === "undefined") return "/";
    const next = new URLSearchParams(window.location.search).get("next");
    if (!next) return "/";
    if (!next.startsWith("/") || next.startsWith("//")) return "/";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(getSafeNext());
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>Path Tracker</div>
        <p className={styles.sub}>Anesthesia Meridian</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.fieldLast}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className={styles.switch}>
          <Link href="/forgot">Forgot password?</Link>
        </p>
        <p className={styles.switch}>
          No account? <Link href={signupHref}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
