import { type BenchmarkLevel, BENCHMARK_LABELS, BENCHMARK_COLORS } from "@/lib/benchmarks";

type Props = {
  label: string;
  value: string | number;
  level: BenchmarkLevel;
  benchmark?: string;
  tooltip?: string;
};

export default function BenchmarkStat({ label, value, level, benchmark, tooltip }: Props) {
  const color = BENCHMARK_COLORS[level];
  const status = BENCHMARK_LABELS[level];

  return (
    <div
      style={{
        border: "1px solid var(--warm-rule)",
        background: "var(--cream)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 400,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--taupe)",
          }}
        >
          {label}
        </span>
        {tooltip && (
          <span
            title={tooltip}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "1px solid var(--taupe)",
              color: "var(--taupe)",
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              cursor: "help",
            }}
            aria-label={tooltip}
          >
            ?
          </span>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          fontWeight: 400,
          color: "var(--ink)",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: benchmark ? 4 : 0,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color,
          }}
        >
          {status}
        </span>
      </div>
      {benchmark && (
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            color: "var(--taupe)",
            lineHeight: 1.4,
          }}
        >
          {benchmark}
        </div>
      )}
    </div>
  );
}
