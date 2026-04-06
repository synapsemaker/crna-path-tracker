import styles from "./Field.module.css";

type Props = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
};

export default function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  min,
  max,
  step,
}: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}
