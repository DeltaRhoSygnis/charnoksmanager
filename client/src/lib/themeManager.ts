// Theme Management System for Charnoks POS
export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradient: string;
  isDark: boolean;
}

export const themes: Record<string, Theme> = {
  charnoks: {
    id: 'charnoks',
    name: 'Charnoks Classic',
    colors: {
      primary: 'hsl(14, 100%, 50%)', // Orange
      secondary: 'hsl(45, 100%, 50%)', // Yellow
      accent: 'hsl(0, 100%, 50%)', // Red
      background: 'hsl(222, 84%, 5%)',
      surface: 'hsl(222, 84%, 10%)',
      text: 'hsl(0, 0%, 98%)',
      textSecondary: 'hsl(0, 0%, 70%)',
      border: 'hsl(0, 0%, 20%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(199, 89%, 48%)',
    },
    gradient: 'linear-gradient(135deg, hsl(0, 100%, 50%), hsl(14, 100%, 50%), hsl(45, 100%, 50%))',
    isDark: true,
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      primary: 'hsl(199, 89%, 48%)',
      secondary: 'hsl(187, 85%, 53%)',
      accent: 'hsl(172, 66%, 50%)',
      background: 'hsl(220, 26%, 6%)',
      surface: 'hsl(220, 26%, 12%)',
      text: 'hsl(0, 0%, 98%)',
      textSecondary: 'hsl(0, 0%, 70%)',
      border: 'hsl(0, 0%, 20%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(199, 89%, 48%)',
    },
    gradient: 'linear-gradient(135deg, hsl(220, 26%, 6%), hsl(199, 89%, 48%), hsl(187, 85%, 53%))',
    isDark: true,
  },
  forest: {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      primary: 'hsl(142, 76%, 36%)',
      secondary: 'hsl(120, 60%, 50%)',
      accent: 'hsl(88, 50%, 53%)',
      background: 'hsl(160, 20%, 8%)',
      surface: 'hsl(160, 20%, 14%)',
      text: 'hsl(0, 0%, 98%)',
      textSecondary: 'hsl(0, 0%, 70%)',
      border: 'hsl(0, 0%, 20%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(199, 89%, 48%)',
    },
    gradient: 'linear-gradient(135deg, hsl(160, 20%, 8%), hsl(142, 76%, 36%), hsl(120, 60%, 50%))',
    isDark: true,
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Purple',
    colors: {
      primary: 'hsl(271, 81%, 56%)',
      secondary: 'hsl(294, 72%, 52%)',
      accent: 'hsl(316, 73%, 52%)',
      background: 'hsl(260, 20%, 8%)',
      surface: 'hsl(260, 20%, 14%)',
      text: 'hsl(0, 0%, 98%)',
      textSecondary: 'hsl(0, 0%, 70%)',
      border: 'hsl(0, 0%, 20%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(199, 89%, 48%)',
    },
    gradient: 'linear-gradient(135deg, hsl(260, 20%, 8%), hsl(271, 81%, 56%), hsl(294, 72%, 52%))',
    isDark: true,
  },
  light: {
    id: 'light',
    name: 'Light Mode',
    colors: {
      primary: 'hsl(14, 100%, 50%)',
      secondary: 'hsl(45, 100%, 50%)',
      accent: 'hsl(0, 100%, 50%)',
      background: 'hsl(0, 0%, 98%)',
      surface: 'hsl(0, 0%, 95%)',
      text: 'hsl(222, 84%, 5%)',
      textSecondary: 'hsl(0, 0%, 30%)',
      border: 'hsl(0, 0%, 85%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(199, 89%, 48%)',
    },
    gradient: 'linear-gradient(135deg, hsl(0, 0%, 98%), hsl(14, 100%, 95%), hsl(45, 100%, 95%))',
    isDark: false,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Gray',
    colors: {
      primary: 'hsl(0, 0%, 20%)',
      secondary: 'hsl(0, 0%, 40%)',
      accent: 'hsl(0, 0%, 60%)',
      background: 'hsl(0, 0%, 98%)',
      surface: 'hsl(0, 0%, 95%)',
      text: 'hsl(0, 0%, 10%)',
      textSecondary: 'hsl(0, 0%, 40%)',
      border: 'hsl(0, 0%, 85%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(199, 89%, 48%)',
    },
    gradient: 'linear-gradient(135deg, hsl(0, 0%, 98%), hsl(0, 0%, 95%), hsl(0, 0%, 92%))',
    isDark: false,
  },
};

export class ThemeManager {
  private static currentTheme: Theme = themes.charnoks;
  private static listeners: ((theme: Theme) => void)[] = [];

  static init() {
    const savedTheme = localStorage.getItem('charnoks-theme');
    if (savedTheme && themes[savedTheme]) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('charnoks');
    }
  }

  static setTheme(themeId: string) {
    const theme = themes[themeId];
    if (!theme) return;

    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('charnoks-theme', themeId);
    this.notifyListeners(theme);
  }

  static getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  static getAllThemes(): Theme[] {
    return Object.values(themes);
  }

  static addListener(listener: (theme: Theme) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private static applyTheme(theme: Theme) {
    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.kebabCase(key)}`, value);
    });

    // Apply gradient
    root.style.setProperty('--gradient-primary', theme.gradient);

    // Toggle dark class
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update meta theme color for PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.primary);
    }
  }

  private static notifyListeners(theme: Theme) {
    this.listeners.forEach(listener => listener(theme));
  }

  private static kebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }
}