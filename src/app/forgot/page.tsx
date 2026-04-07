"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "../login/page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
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
        <p className={styles.sub}>Reset your password</p>
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
              We sent a reset link to {email}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.fieldLast}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading} className={styles.btn}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
        <p className={styles.switch}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
