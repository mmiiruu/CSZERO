"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
  setOverride: (theme: Theme | null) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  mounted: false,
  toggleTheme: () => {},
  setOverride: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Both server and client start with "light" — no mismatch on hydration.
  const [theme, setTheme] = useState<Theme>("light");
  // null = no override, Theme = a page is forcing a specific theme
  const [override, setOverrideState] = useState<Theme | null>(null);
  const overrideRef = useRef<Theme | null>(null);
  // False on server and during initial client render; true only after mount.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const resolved: Theme =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    setTheme(resolved);
    // Only apply to html if no page-level override is already active.
    if (overrideRef.current === null) {
      document.documentElement.classList.toggle("dark", resolved === "dark");
    }
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      // Only touch the html class when no override is suppressing the global theme.
      if (overrideRef.current === null) {
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return next;
    });
  }, []);

  const setOverride = useCallback((value: Theme | null) => {
    overrideRef.current = value;
    setOverrideState(value);

    if (value !== null) {
      // Force the html class to the overridden theme immediately.
      document.documentElement.classList.toggle("dark", value === "dark");
    } else {
      // Override cleared — restore the user's stored preference.
      const stored = localStorage.getItem("theme") as Theme | null;
      const resolved: Theme =
        stored ??
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      document.documentElement.classList.toggle("dark", resolved === "dark");
      setTheme(resolved);
    }
  }, []);

  // Pages consuming the context see the override while it is active.
  const effectiveTheme: Theme = override ?? theme;

  return (
    <ThemeContext.Provider
      value={{ theme: effectiveTheme, mounted, toggleTheme, setOverride }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
