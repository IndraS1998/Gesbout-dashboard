import styles from "./component.module.css";

type LoadingOverlayProps = {
  show: boolean;
  text?: string;
};

export default function LoadingOverlay({
  show,
  text = "Chargement...",
}: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.loaderBox}>
        <div className={styles.spinner} />

        <p className={styles.text}>
          {text}
        </p>
      </div>
    </div>
  );
}