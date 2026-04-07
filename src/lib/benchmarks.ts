// CRNA program admissions benchmarks (typical / competitive / strong)
// Used for context labels on dashboard stats.

export type BenchmarkLevel = "low" | "ok" | "good" | "strong" | "none";

export function gpaLevel(gpa: number | null): BenchmarkLevel {
  if (gpa === null) return "none";
  if (gpa >= 3.7) return "strong";
  if (gpa >= 3.5) return "good";
  if (gpa >= 3.0) return "ok";
  return "low";
}

export function scienceGpaLevel(gpa: number | null): BenchmarkLevel {
  if (gpa === null) return "none";
  if (gpa >= 3.7) return "strong";
  if (gpa >= 3.5) return "good";
  if (gpa >= 3.0) return "ok";
  return "low";
}

export function greVerbalLevel(score: number | null): BenchmarkLevel {
  if (score === null) return "none";
  if (score >= 155) return "strong";
  if (score >= 150) return "good";
  if (score >= 145) return "ok";
  return "low";
}

export function greQuantLevel(score: number | null): BenchmarkLevel {
  if (score === null) return "none";
  if (score >= 155) return "strong";
  if (score >= 150) return "good";
  if (score >= 145) return "ok";
  return "low";
}

export function greWritingLevel(score: number | null): BenchmarkLevel {
  if (score === null) return "none";
  if (score >= 4.5) return "strong";
  if (score >= 4.0) return "good";
  if (score >= 3.5) return "ok";
  return "low";
}

export function shadowingLevel(hours: number): BenchmarkLevel {
  if (hours === 0) return "none";
  if (hours >= 40) return "strong";
  if (hours >= 20) return "good";
  if (hours >= 8) return "ok";
  return "low";
}

export function icuMonthsLevel(months: number): BenchmarkLevel {
  if (months === 0) return "none";
  if (months >= 24) return "strong";
  if (months >= 18) return "good";
  if (months >= 12) return "ok";
  return "low";
}

export const BENCHMARK_LABELS: Record<BenchmarkLevel, string> = {
  none: "Not started",
  low: "Below typical",
  ok: "Meets minimum",
  good: "Competitive",
  strong: "Strong",
};

export const BENCHMARK_COLORS: Record<BenchmarkLevel, string> = {
  none: "var(--taupe)",
  low: "#a05050",
  ok: "#b08d3a",
  good: "#3a7d44",
  strong: "#3a7d44",
};

// Benchmark text shown next to each stat
export const BENCHMARK_TARGETS = {
  gpa: "Competitive: 3.5+",
  scienceGpa: "Competitive: 3.5+",
  greVerbal: "Competitive: 150+",
  greQuant: "Competitive: 150+",
  greWriting: "Competitive: 4.0+",
  shadowing: "Target: 20–40 hrs",
  icu: "Target: 1–2+ years",
  ccrn: "Most programs require it",
};
