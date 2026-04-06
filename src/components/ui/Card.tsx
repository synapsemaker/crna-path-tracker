import styles from "./Card.module.css";

type Props = {
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
};

export default function Card({ children, hover, onClick }: Props) {
  return (
    <div
      className={hover ? styles.cardHover : styles.card}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
