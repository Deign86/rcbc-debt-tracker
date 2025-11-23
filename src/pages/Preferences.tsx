import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const Preferences = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-matcha-800 dark:text-cream-100 mb-6">Preferences</h1>
      
      <div className="bg-cream-50 dark:bg-matcha-800 rounded-ios-xl shadow-lg border-2 border-matcha-300 dark:border-matcha-700 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-matcha-800 dark:text-cream-100 mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base font-medium text-matcha-800 dark:text-cream-100 mb-1">Theme</p>
              <p className="text-sm text-matcha-600 dark:text-matcha-300">
                Switch between light and dark mode
              </p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="ml-4 p-4 rounded-full bg-matcha-100 dark:bg-matcha-700 border-2 border-matcha-300 dark:border-matcha-600 hover:bg-matcha-200 dark:hover:bg-matcha-600 transition-all transform hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-6 w-6 text-matcha-700 dark:text-matcha-300" /> : <Sun className="h-6 w-6 text-matcha-700 dark:text-matcha-300" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
