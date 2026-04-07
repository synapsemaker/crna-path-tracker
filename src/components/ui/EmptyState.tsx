type Props = {
  title: string;
  body: string;
  action?: React.ReactNode;
};

export default function EmptyState({ title, body, action }: Props) {
  return (
    <div
      style={{
        padding: "48px 32px",
        border: "1px solid var(--warm-rule)",
        background: "var(--cream)",
        maxWidth: 560,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 400,
          fontStyle: "italic",
          color: "var(--ink)",
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--ink-mid)",
          lineHeight: 1.7,
          marginBottom: action ? 24 : 0,
        }}
      >
        {body}
      </p>
      {action}
    </div>
  );
}
