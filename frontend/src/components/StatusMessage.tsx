"use client";

import styles from "../../app/index.module.css";

export type StatusTone = "success" | "error" | "info" | "warning";

interface StatusMessageProps {
  message: string;
  tone: StatusTone;
  floating?: boolean;
  onDismiss?: () => void;
}

export function StatusMessage({
  message,
  tone,
  floating = false,
  onDismiss,
}: StatusMessageProps) {
  const toneClassName =
    tone === "success"
      ? styles.statusSuccess
      : tone === "error"
        ? styles.statusError
        : tone === "warning"
          ? styles.statusWarning
          : styles.statusInfo;

  return (
    <div
      className={`${styles.statusMessage} ${toneClassName} ${floating ? styles.statusFloating : ""}`}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          className={styles.statusDismiss}
          onClick={onDismiss}
          aria-label="Dismiss status message"
        >
          x
        </button>
      )}
    </div>
  );
}
