import { useTheme } from '../contexts/ThemeContext';

export const Preferences = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-navy dark:text-beige mb-6">Preferences</h1>
      
      <div className="bg-white dark:bg-navy rounded-lg shadow-md border border-gray-200 dark:border-beige/10 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-navy dark:text-beige mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base font-medium text-navy dark:text-beige mb-1">Theme</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Switch between light and dark mode
              </p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="ml-4 p-4 rounded-full bg-sage/10 dark:bg-sage/20 border-2 border-sage dark:border-sage text-3xl hover:bg-sage/20 dark:hover:bg-sage/30 transition-all transform hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
