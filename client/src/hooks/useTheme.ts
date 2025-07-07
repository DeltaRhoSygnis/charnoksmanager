import { useState, useEffect } from 'react';
import { ThemeManager, Theme } from '@/lib/themeManager';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(ThemeManager.getCurrentTheme());

  useEffect(() => {
    ThemeManager.init();
    setCurrentTheme(ThemeManager.getCurrentTheme());

    const unsubscribe = ThemeManager.addListener((theme) => {
      setCurrentTheme(theme);
    });

    return unsubscribe;
  }, []);

  const setTheme = (themeId: string) => {
    ThemeManager.setTheme(themeId);
  };

  const getAllThemes = () => {
    return ThemeManager.getAllThemes();
  };

  const toggleDarkMode = () => {
    const themes = getAllThemes();
    const currentId = currentTheme.id;
    
    if (currentTheme.isDark) {
      // Switch to light mode
      const lightTheme = themes.find(t => !t.isDark) || themes.find(t => t.id === 'light');
      if (lightTheme) {
        setTheme(lightTheme.id);
      }
    } else {
      // Switch to dark mode
      const darkTheme = themes.find(t => t.isDark && t.id !== currentId) || themes.find(t => t.id === 'charnoks');
      if (darkTheme) {
        setTheme(darkTheme.id);
      }
    }
  };

  return {
    currentTheme,
    setTheme,
    getAllThemes,
    toggleDarkMode,
    isDark: currentTheme.isDark,
  };
}