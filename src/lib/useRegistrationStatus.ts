"use client";

import { useEffect, useState } from "react";
import {
  computeCountdown,
  getOpensAtMs,
  isRegistrationOpen,
  type Countdown,
  type RegistrationConfig,
} from "./registration";

export function useRegistrationStatus(reg: RegistrationConfig): {
  isOpen: boolean;
  countdown: Countdown | null;
} {
  const opensAt = getOpensAtMs(reg);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!reg.open || opensAt === null) return;
    if (Date.now() >= opensAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [reg.open, opensAt]);

  const isOpen = isRegistrationOpen(reg, now);
  const countdown =
    !reg.open || opensAt === null || now >= opensAt
      ? null
      : computeCountdown(opensAt, now);

  return { isOpen, countdown };
}
