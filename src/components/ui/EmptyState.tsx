type Props = {
  message: string;
  action?: React.ReactNode;
};

export default function EmptyState({ message, action }: Props) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        border: "1px solid var(--border)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--taupe)",
          marginBottom: action ? 16 : 0,
        }}
      >
        {message}
      </p>
      {action}
    </div>
  );
}
