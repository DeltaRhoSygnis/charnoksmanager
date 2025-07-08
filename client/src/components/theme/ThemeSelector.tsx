import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Sun, 
  Moon, 
  Check, 
  Brush,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  showTitle?: boolean;
  compact?: boolean;
}

export const ThemeSelector = ({ showTitle = true, compact = false }: ThemeSelectorProps) => {
  const { currentTheme, setTheme, getAllThemes, toggleDarkMode, isDark } = useTheme();
  const [isChanging, setIsChanging] = useState(false);

  const handleThemeChange = async (themeId: string) => {
    setIsChanging(true);
    setTheme(themeId);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      setIsChanging(false);
    }, 300);
  };

  const themes = getAllThemes();

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="text-white hover:bg-white/10"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        
        <div className="flex space-x-1">
          {themes.filter(t => ['charnoks', 'modernTeal', 'darkModern', 'navyProfessional']).map((theme) => (
            <Button
              key={theme.id}
              variant="ghost"
              size="sm"
              onClick={() => handleThemeChange(theme.id)}
              className={cn(
                "w-8 h-8 p-0 rounded-full transition-all duration-200",
                currentTheme.id === theme.id && "ring-2 ring-white/50"
              )}
              style={{
                background: theme.gradient,
              }}
              title={theme.name}
            >
              {currentTheme.id === theme.id && (
                <Check className="h-3 w-3 text-white drop-shadow-lg" />
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="card-enhanced">
      {showTitle && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Palette className="h-5 w-5" />
            <span>Theme Settings</span>
            {isChanging && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        {/* Dark/Light Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isDark ? <Moon className="h-4 w-4 text-white" /> : <Sun className="h-4 w-4 text-white" />}
            <span className="text-white font-medium">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Theme Grid */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-white">
            <Brush className="h-4 w-4" />
            <span className="font-medium">Color Themes</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {themes.map((theme) => (
              <Button
                key={theme.id}
                variant="ghost"
                onClick={() => handleThemeChange(theme.id)}
                className={cn(
                  "h-auto p-3 flex flex-col items-center space-y-2 transition-all duration-200 hover:scale-105",
                  currentTheme.id === theme.id 
                    ? "bg-white/20 border-2 border-white/40" 
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}
              >
                {/* Theme Preview */}
                <div 
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg",
                    theme.isDark ? "shadow-black/50" : "shadow-gray-400/30"
                  )}
                  style={{ background: theme.gradient }}
                >
                  {currentTheme.id === theme.id && (
                    <Check className="h-6 w-6 text-white drop-shadow-lg z-10" />
                  )}
                  {theme.isDark && (
                    <Moon className="absolute top-1 right-1 h-3 w-3 text-white/70" />
                  )}
                  {!theme.isDark && (
                    <Sun className="absolute top-1 right-1 h-3 w-3 text-yellow-500" />
                  )}
                </div>
                
                {/* Theme Name */}
                <div className="text-center">
                  <p className="text-xs font-medium text-white">{theme.name}</p>
                  {theme.id === 'charnoks' && (
                    <Badge className="text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/30 mt-1">
                      <Sparkles className="h-2 w-2 mr-1" />
                      Default
                    </Badge>
                  )}
                  {theme.id === 'smartHome' && (
                    <Badge className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30 mt-1">
                      <Sparkles className="h-2 w-2 mr-1" />
                      New
                    </Badge>
                  )}
                  {theme.id === 'cyberpunk' && (
                    <Badge className="text-[10px] bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mt-1">
                      <Sparkles className="h-2 w-2 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {(theme.id === 'modernTeal' || theme.id === 'navyProfessional') && (
                    <Badge className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30 mt-1">
                      <Sparkles className="h-2 w-2 mr-1" />
                      Pro
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Current Theme</p>
              <p className="text-xs text-white/70">{currentTheme.name}</p>
            </div>
            <div 
              className="w-8 h-8 rounded-full"
              style={{ background: currentTheme.gradient }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};