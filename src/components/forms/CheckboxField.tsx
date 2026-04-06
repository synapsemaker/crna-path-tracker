import styles from "./Field.module.css";

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function CheckboxField({ label, checked, onChange }: Props) {
  return (
    <label className={styles.checkbox}>
      <input
        className={styles.checkboxInput}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.checkboxLabel}>{label}</span>
    </label>
  );
}
