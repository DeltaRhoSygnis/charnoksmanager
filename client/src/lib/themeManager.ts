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
  modernTeal: {
    id: 'modernTeal',
    name: 'Modern Teal',
    colors: {
      primary: 'hsl(174, 72%, 42%)',
      secondary: 'hsl(186, 60%, 50%)',
      accent: 'hsl(38, 92%, 50%)',
      background: 'hsl(0, 0%, 98%)',
      surface: 'hsl(0, 0%, 100%)',
      text: 'hsl(213, 14%, 12%)',
      textSecondary: 'hsl(215, 16%, 47%)',
      border: 'hsl(214, 32%, 91%)',
      success: 'hsl(145, 63%, 42%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 72%, 51%)',
      info: 'hsl(188, 78%, 41%)',
    },
    gradient: 'linear-gradient(135deg, hsl(174, 72%, 42%), hsl(186, 60%, 50%), hsl(174, 72%, 56%))',
    isDark: false,
  },
  navyProfessional: {
    id: 'navyProfessional',
    name: 'Navy Professional',
    colors: {
      primary: 'hsl(234, 62%, 26%)',
      secondary: 'hsl(234, 32%, 46%)',
      accent: 'hsl(340, 82%, 52%)',
      background: 'hsl(0, 0%, 100%)',
      surface: 'hsl(0, 0%, 98%)',
      text: 'hsl(234, 62%, 26%)',
      textSecondary: 'hsl(234, 16%, 50%)',
      border: 'hsl(234, 32%, 91%)',
      success: 'hsl(145, 63%, 42%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(340, 82%, 52%)',
      info: 'hsl(234, 62%, 26%)',
    },
    gradient: 'linear-gradient(135deg, hsl(234, 62%, 26%), hsl(234, 32%, 46%), hsl(340, 82%, 52%))',
    isDark: false,
  },
  darkModern: {
    id: 'darkModern',
    name: 'Dark Modern',
    colors: {
      primary: 'hsl(210, 100%, 56%)',
      secondary: 'hsl(154, 69%, 48%)',
      accent: 'hsl(340, 82%, 52%)',
      background: 'hsl(222, 47%, 11%)',
      surface: 'hsl(223, 44%, 16%)',
      text: 'hsl(0, 0%, 100%)',
      textSecondary: 'hsl(215, 16%, 67%)',
      border: 'hsl(223, 44%, 24%)',
      success: 'hsl(154, 69%, 48%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(340, 82%, 52%)',
      info: 'hsl(210, 100%, 56%)',
    },
    gradient: 'linear-gradient(135deg, hsl(222, 47%, 11%), hsl(223, 44%, 16%), hsl(210, 100%, 56%))',
    isDark: true,
  },
  orangeVibrant: {
    id: 'orangeVibrant',
    name: 'Orange Vibrant',
    colors: {
      primary: 'hsl(30, 100%, 50%)',
      secondary: 'hsl(45, 100%, 51%)',
      accent: 'hsl(15, 100%, 55%)',
      background: 'hsl(0, 0%, 100%)',
      surface: 'hsl(30, 100%, 98%)',
      text: 'hsl(0, 0%, 13%)',
      textSecondary: 'hsl(0, 0%, 46%)',
      border: 'hsl(30, 35%, 88%)',
      success: 'hsl(145, 63%, 42%)',
      warning: 'hsl(45, 100%, 51%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(210, 100%, 56%)',
    },
    gradient: 'linear-gradient(135deg, hsl(30, 100%, 50%), hsl(45, 100%, 51%), hsl(15, 100%, 55%))',
    isDark: false,
  },
  purpleGradient: {
    id: 'purpleGradient',
    name: 'Purple Gradient',
    colors: {
      primary: 'hsl(267, 87%, 62%)',
      secondary: 'hsl(273, 85%, 70%)',
      accent: 'hsl(280, 84%, 76%)',
      background: 'hsl(0, 0%, 100%)',
      surface: 'hsl(267, 87%, 98%)',
      text: 'hsl(267, 87%, 20%)',
      textSecondary: 'hsl(267, 20%, 50%)',
      border: 'hsl(267, 30%, 90%)',
      success: 'hsl(145, 63%, 42%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(340, 82%, 52%)',
      info: 'hsl(267, 87%, 62%)',
    },
    gradient: 'linear-gradient(135deg, hsl(267, 87%, 62%), hsl(273, 85%, 70%), hsl(280, 84%, 76%))',
    isDark: false,
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: {
      primary: 'hsl(180, 100%, 50%)',
      secondary: 'hsl(300, 100%, 50%)',
      accent: 'hsl(60, 100%, 50%)',
      background: 'hsl(240, 20%, 4%)',
      surface: 'hsl(240, 20%, 8%)',
      text: 'hsl(0, 0%, 100%)',
      textSecondary: 'hsl(180, 100%, 75%)',
      border: 'hsl(300, 100%, 25%)',
      success: 'hsl(120, 100%, 50%)',
      warning: 'hsl(60, 100%, 50%)',
      error: 'hsl(0, 100%, 50%)',
      info: 'hsl(180, 100%, 50%)',
    },
    gradient: 'linear-gradient(135deg, hsl(180, 100%, 50%), hsl(300, 100%, 50%), hsl(60, 100%, 50%))',
    isDark: true,
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