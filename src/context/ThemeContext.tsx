import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AppAppearanceMode, AppPalette, AppearanceSettings } from '../types';
import { useApp } from './AppContext';

interface ThemeContextType {
  appearance: AppearanceSettings;
  mode: AppAppearanceMode;
  palette: AppPalette;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: AppAppearanceMode) => void;
  setPalette: (palette: AppPalette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useApp();

  // Load from user settings or fallback to defaults
  const mode: AppAppearanceMode = settings?.appearance?.mode || 'system';
  const palette: AppPalette = settings?.appearance?.palette || 'ocean';

  // State to track system preference
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // State to trigger minute-by-minute updates for auto mode
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Listen to system prefers-color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Update current time every minute to adjust Auto mode (7 AM - 6 PM Light, 6 PM - 7 AM Dark)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate resolved theme ('light' or 'dark')
  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    if (mode === 'system') return systemIsDark ? 'dark' : 'light';
    if (mode === 'auto') {
      const hour = currentTime.getHours();
      // Light: 07:00 AM - 06:00 PM (hour 7 to 17)
      // Dark: 06:00 PM - 07:00 AM (hour 18 to 23 and 0 to 6)
      return hour >= 7 && hour < 18 ? 'light' : 'dark';
    }
    return 'dark';
  }, [mode, systemIsDark, currentTime]);

  // Synchronize CSS variables and root DOM attributes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-palette', palette);
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-resolved-theme', resolvedTheme);

    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [palette, mode, resolvedTheme]);

  const handleSetMode = useCallback(
    (newMode: AppAppearanceMode) => {
      updateSettings({
        appearance: {
          mode: newMode,
          palette,
        },
      });
    },
    [palette, updateSettings]
  );

  const handleSetPalette = useCallback(
    (newPalette: AppPalette) => {
      updateSettings({
        appearance: {
          mode,
          palette: newPalette,
        },
      });
    },
    [mode, updateSettings]
  );

  const value = useMemo(
    () => ({
      appearance: { mode, palette },
      mode,
      palette,
      resolvedTheme,
      setMode: handleSetMode,
      setPalette: handleSetPalette,
    }),
    [mode, palette, resolvedTheme, handleSetMode, handleSetPalette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
