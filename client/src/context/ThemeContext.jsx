import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// Ensure clean light mode on initial load
if (typeof document !== "undefined") {
  document.documentElement.classList.remove("dark");
  try {
    if (localStorage.getItem("aarogyaVaaniTheme") === "dark") {
      localStorage.setItem("aarogyaVaaniTheme", "light");
    }
  } catch {}
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("aarogyaVaaniTheme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: "light", toggleTheme: () => {}, isDark: false };
  }
  return context;
}
