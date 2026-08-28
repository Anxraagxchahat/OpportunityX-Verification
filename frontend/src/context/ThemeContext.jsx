import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'opportunityx_verify_theme';
const VALID_THEMES = ['dark', 'light', 'monochromatic'];

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Backward compatibility: migrate old 'amoled' label to 'dark'
    if (saved === 'amoled') return 'dark';
    if (saved && VALID_THEMES.includes(saved)) {
      return saved;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  cycleTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    try {
      const root = document.documentElement;
      const body = document.body;

      root.setAttribute('data-theme', theme);

      // Clean old classes
      root.classList.remove('dark', 'light-mode', 'monochromatic-mode');
      body.classList.remove('dark', 'light-mode', 'monochromatic-mode');

      if (theme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.add('light-mode');
        body.classList.add('light-mode');
      } else if (theme === 'monochromatic') {
        root.classList.add('monochromatic-mode');
        body.classList.add('monochromatic-mode');
      }

      localStorage.setItem(STORAGE_KEY, theme);

      // Dynamically sync browser chrome meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          theme === 'dark' ? '#000000' : '#FFFFFF'
        );
      }

      // Favicon is locked permanently to the primary dark brand logo mark
      const faviconLink = document.querySelector('link[rel="icon"]');
      if (faviconLink && faviconLink.getAttribute('href') !== '/favicon.png') {
        faviconLink.setAttribute('href', '/favicon.png');
      }
    } catch (e) {
      console.warn('Failed to apply theme settings:', e);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    if (VALID_THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const cycleTheme = () => {
    setThemeState((prev) => {
      const nextIndex = (VALID_THEMES.indexOf(prev) + 1) % VALID_THEMES.length;
      return VALID_THEMES[nextIndex];
    });
  };

  const toggleTheme = () => {
    cycleTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
