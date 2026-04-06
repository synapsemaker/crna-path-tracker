export default function DashboardPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          fontWeight: 400,
          fontStyle: "italic",
          color: "var(--ink)",
          marginBottom: 24,
        }}
      >
        Dashboard
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--taupe)" }}>
        Your CRNA path at a glance. Add schools, log shadowing hours, and track your progress.
      </p>
    </div>
  );
}
