import { schoolAvatarColor, schoolInitials } from "@/lib/statusColors";

type Props = {
  name: string;
  size?: number;
};

export default function SchoolAvatar({ name, size = 40 }: Props) {
  const { bg, fg } = schoolAvatarColor(name);
  const initials = schoolInitials(name);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: size * 0.32,
        fontWeight: 500,
        letterSpacing: "0.05em",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
