// Semantic status colors for inline text and accents.
// Used by category progress, school pipeline, and stat callouts.

export type StatusTone = "success" | "warn" | "danger" | "neutral" | "info";

export const STATUS_TEXT_COLORS: Record<StatusTone, string> = {
  success: "#3a7d44",
  warn: "#b08d3a",
  danger: "#a05050",
  neutral: "var(--taupe)",
  info: "#4a6c8c",
};

export const STATUS_BG_COLORS: Record<StatusTone, string> = {
  success: "rgba(58, 125, 68, 0.10)",
  warn: "rgba(176, 141, 58, 0.12)",
  danger: "rgba(160, 80, 80, 0.10)",
  neutral: "rgba(140, 123, 107, 0.10)",
  info: "rgba(74, 108, 140, 0.10)",
};

// Map a school status to a tone for badge styling
export function schoolStatusTone(status: string): StatusTone {
  switch (status) {
    case "Accepted":
      return "success";
    case "Interviewed":
    case "Applied":
      return "info";
    case "Planning to Apply":
    case "Waitlisted":
      return "warn";
    case "Declined":
    case "Withdrawn":
      return "danger";
    case "Researching":
    default:
      return "neutral";
  }
}

// Map readiness component status to tone
export function componentTone(
  status: "missing" | "weak" | "ok" | "strong"
): StatusTone {
  switch (status) {
    case "strong":
      return "success";
    case "ok":
      return "info";
    case "weak":
      return "warn";
    case "missing":
      return "danger";
  }
}

// Generate a stable color for a school based on its name
export function schoolAvatarColor(name: string): {
  bg: string;
  fg: string;
} {
  const palette = [
    { bg: "#d8e6d4", fg: "#2d5a3d" }, // soft green
    { bg: "#d6e0eb", fg: "#2d4a6c" }, // soft blue
    { bg: "#e8dfd0", fg: "#5c4a2c" }, // soft tan
    { bg: "#e6d6e0", fg: "#5c2d4a" }, // soft mauve
    { bg: "#dde2d6", fg: "#3d4a2d" }, // soft sage
    { bg: "#ebd9c8", fg: "#6c4a2d" }, // soft peach
    { bg: "#d4dee6", fg: "#2d4a5c" }, // soft slate
    { bg: "#e0d4e0", fg: "#4a2d5c" }, // soft lavender
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

// 2-letter initials for an avatar
export function schoolInitials(name: string): string {
  const words = name
    .replace(/\b(University|College|Health|Medical|Center|of|the)\b/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
