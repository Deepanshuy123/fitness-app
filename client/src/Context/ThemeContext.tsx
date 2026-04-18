import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


export function ThemeProvider({ children }: { children: React.ReactNode }) {

  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial = stored || (window.matchMedia("(prefer-color-scheme: dark)").matches ? "dark" : "light");
    console.log('ThemeProvider init: stored=', stored, 'initial=', initial);
    return initial;
  });

  useEffect(() => {
    console.log('Theme changed to', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    console.log('HTML classes:', root.className);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      console.log('toggleTheme called, switching from', prev, 'to', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
