type Props = {
  title: string;
  action?: React.ReactNode;
};

export default function PageHeader({ title, action }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 28,
        flexWrap: "wrap",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          fontWeight: 400,
          fontStyle: "italic",
          color: "var(--ink)",
        }}
      >
        {title}
      </h1>
      {action}
    </div>
  );
}
