"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "../login/page.module.css";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [loginHref, setLoginHref] = useState("/login");
  const supabase = createClient();

  // Preserve `?next=` so the signup → login link round-trip retains the
  // post-auth destination (e.g. a Finder prefill URL).
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) setLoginHref(`/login?next=${encodeURIComponent(next)}`);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Build a same-origin redirect target for the email confirmation link.
    // Supabase invokes /auth/callback?next=<value> when the user clicks
    // through; the callback route will redirect there after exchanging the
    // code for a session.
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>Path Tracker</div>
        <p className={styles.sub}>Create your account</p>
        {sent ? (
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontStyle: "italic",
                color: "var(--ink)",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Check your email.
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--taupe)",
                textAlign: "center",
              }}
            >
              We sent a confirmation link to {email}.
            </p>
          </div>
        ) : (
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
                minLength={8}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading} className={styles.btn}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}
        <p className={styles.switch}>
          Already have an account? <Link href={loginHref}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
