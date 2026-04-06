import styles from "./Field.module.css";

type Props = {
  saving?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
};

export default function FormActions({
  saving,
  submitLabel = "Save",
  onCancel,
}: Props) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className={styles.input}
          style={{
            width: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--taupe)",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={saving}
        style={{
          background: "var(--ink)",
          color: "var(--cream)",
          border: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          fontWeight: 400,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "10px 20px",
          cursor: saving ? "wait" : "pointer",
          opacity: saving ? 0.5 : 1,
          transition: "background 0.2s",
        }}
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
