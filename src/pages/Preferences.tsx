import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Settings } from 'lucide-react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";

export const Preferences = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="glass-primary p-3 rounded-xl">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground">Preferences</h1>
      </div>
      
      <GlassCard variant="default">
        <GlassCardHeader>
          <GlassCardTitle className="text-xl font-semibold text-foreground">Appearance</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base font-medium text-foreground mb-1">Theme</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="ml-4 p-4 rounded-2xl glass-primary transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-6 w-6 text-primary" /> : <Sun className="h-6 w-6 text-primary" />}
            </button>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
};
