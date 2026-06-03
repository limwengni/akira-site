"use client";

import { useEffect, useRef, useState } from "react";
import type { StatusTone } from "@/src/components/StatusMessage";

interface StatusState {
  message: string;
  tone: StatusTone;
}

const DEFAULT_TIMEOUT_MS = 4000;

export function useStatusMessage(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const [status, setStatus] = useState<StatusState | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearStatus = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus(null);
  };

  const showStatus = (message: string, tone: StatusTone) => {
    clearStatus();
    setStatus({ message, tone });
    timeoutRef.current = window.setTimeout(() => {
      setStatus(null);
      timeoutRef.current = null;
    }, timeoutMs);
  };

  useEffect(() => clearStatus, []);

  return { status, showStatus, clearStatus };
}
