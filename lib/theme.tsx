"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export type CanvasTheme = {
  labelBg: string;
  labelBgDimmed: string;
  labelText: string;
  labelTextDimmed: string;
  hoverBg: string;
  hoverStroke: string;
  hoverText: string;
  nodeDimmed: string;
  edgeModeColors: {
    read_write: string;
    read: string;
    write: string;
  };
  dashedEdge: string;
};

export const CANVAS_THEMES: Record<Theme, CanvasTheme> = {
  dark: {
    labelBg: "rgba(8, 8, 13, 0.85)",
    labelBgDimmed: "rgba(8, 8, 13, 0.22)",
    labelText: "#e8e8ed",
    labelTextDimmed: "rgba(232, 232, 237, 0.15)",
    hoverBg: "rgba(8, 8, 13, 0.95)",
    hoverStroke: "rgba(255,255,255,0.1)",
    hoverText: "#ffffff",
    nodeDimmed: "rgba(100,100,120,0.10)",
    edgeModeColors: {
      read_write: "#22916a",
      read: "#4a7ec0",
      write: "#b8891a",
    },
    dashedEdge: "rgba(255,255,255,0.12)",
  },
  light: {
    labelBg: "rgba(232, 232, 244, 0.85)",
    labelBgDimmed: "rgba(232, 232, 244, 0.35)",
    labelText: "#1a1a2e",
    labelTextDimmed: "rgba(26, 26, 46, 0.2)",
    hoverBg: "rgba(232, 232, 244, 0.95)",
    hoverStroke: "rgba(0,0,0,0.08)",
    hoverText: "#0a0a1a",
    nodeDimmed: "rgba(100,100,120,0.08)",
    edgeModeColors: {
      read_write: "#16a06e",
      read: "#3b72b8",
      write: "#c4920e",
    },
    dashedEdge: "rgba(0,0,0,0.15)",
  },
};
