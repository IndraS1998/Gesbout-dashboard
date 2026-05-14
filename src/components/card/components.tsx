"use client";

import { ReactNode, useState } from "react";
import styles from "./component.module.css";

type CardProps = {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

export default function Card({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = true,
}: CardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader} onClick={() => setOpen(!open)}>
        <div className={styles.cardHeaderLeft}>
          <div className={`${styles.cardIcon} ${styles.icBlue}`}>
            {icon}
          </div>

          <div>
            <div className={styles.cardTitle}>
              {title}
            </div>

            {subtitle && (
              <div className={styles.cardSubtitle}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className={styles.toggleBtn}

        >
          {open ? (
            // UP ARROW
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          ) : (
            // DOWN ARROW
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`${styles.cardBodyWrapper} ${
          open ? styles.open : styles.closed
        }`}
      >
        <div className={styles.cardBody}>
          {children}
        </div>
      </div>
    </div>
  );
}