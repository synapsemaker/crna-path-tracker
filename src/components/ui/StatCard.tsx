type Props = {
  label: string;
  value: string | number;
};

export default function StatCard({ label, value }: Props) {
  return (
    <div
      style={{
        border: "1px solid var(--warm-rule)",
        background: "var(--cream)",
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          fontWeight: 400,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--taupe)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          fontWeight: 400,
          color: "var(--ink)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
