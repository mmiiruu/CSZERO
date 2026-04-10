"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Mounts with no DOM output. While mounted it overrides the global theme to
 * the requested value. When the component unmounts (route navigation away),
 * the override is cleared and the user's stored preference is restored.
 */
export function ForceTheme({ theme }: { theme: "light" | "dark" }) {
  const { setOverride } = useTheme();

  useEffect(() => {
    setOverride(theme);
    return () => {
      setOverride(null);
    };
  }, [theme, setOverride]);

  return null;
}
