export interface RegistrationConfig {
  open: boolean;
  opensAt?: string | null;
  comingSoon: {
    title: string;
    message: string;
    backButton: { label: string; href: string };
  };
}

export function getOpensAtMs(reg: RegistrationConfig): number | null {
  if (!reg.opensAt) return null;
  const ms = Date.parse(reg.opensAt);
  return Number.isNaN(ms) ? null : ms;
}

export function isRegistrationOpen(reg: RegistrationConfig, nowMs: number = Date.now()): boolean {
  if (!reg.open) return false;
  const opensAt = getOpensAtMs(reg);
  if (opensAt === null) return true;
  return nowMs >= opensAt;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function computeCountdown(targetMs: number, nowMs: number): Countdown {
  const totalMs = Math.max(0, targetMs - nowMs);
  const totalSec = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalMs,
  };
}
