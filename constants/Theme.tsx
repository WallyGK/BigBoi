// constants/Theme.ts
import React, { createContext, ReactNode, useMemo, useState } from "react";

// Light & dark color palettes
const colorPalettes = {
  light: {
    primary: "#3b82f6",
    secondary: "#10b981",
    background: "#ffffff",
    card: "#f3f4f6",
    text: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    error: "#ef4444",
    tabIconDefault: "#9ca3af",
    tabIconSelected: "#3b82f6",
  },
  dark: {
    primary: "#3b82f6",
    secondary: "#10b981",
    background: "#111827",
    card: "#1f2937",
    text: "#f9fafb",
    textSecondary: "#9ca3af",
    border: "#374151",
    error: "#ef4444",
    tabIconDefault: "#6b7280",
    tabIconSelected: "#3b82f6",
  },
};

// Common layout constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZE = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const SHADOW = {
  default: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
};

// Theme context type
interface ThemeContextType {
  colors: typeof colorPalettes.light;
  darkMode: boolean;
  toggleTheme: () => void;
}

// Context with default dark theme
export const ThemeContext = createContext<ThemeContextType>({
  colors: colorPalettes.dark,
  darkMode: true,
  toggleTheme: () => {},
});

// ThemeProvider to wrap your app
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const value = useMemo(
    () => ({
      colors: darkMode ? colorPalettes.dark : colorPalettes.light,
      darkMode,
      toggleTheme,
    }),
    [darkMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
