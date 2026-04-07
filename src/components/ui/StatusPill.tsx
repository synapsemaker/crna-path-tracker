import { type StatusTone, STATUS_TEXT_COLORS, STATUS_BG_COLORS } from "@/lib/statusColors";

type Props = {
  label: string;
  tone: StatusTone;
};

export default function StatusPill({ label, tone }: Props) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        fontWeight: 400,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: STATUS_TEXT_COLORS[tone],
        background: STATUS_BG_COLORS[tone],
        padding: "3px 9px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
