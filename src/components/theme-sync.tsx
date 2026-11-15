"use client";

import { useEffect } from "react";

interface ThemeSyncProps {
  theme: "dark" | "light" | "system";
}

/**
 * Keeps the root `.dark` class synchronized with the persisted user theme
 * preference and listens to OS `prefers-color-scheme` changes when in `system` mode.
 */
export function ThemeSync({ theme }: ThemeSyncProps) {
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const shouldUseDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
      root.classList.toggle("dark", shouldUseDark);
    };

    applyTheme();

    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }

    return undefined;
  }, [theme]);

  return null;
}
