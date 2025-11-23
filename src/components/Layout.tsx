import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/simulator', label: 'Simulator', icon: '📈' },
  { path: '/history', label: 'History', icon: '📋' },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col h-screen bg-sage dark:bg-slate-900 transition-colors">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-navy shadow-lg border border-gray-200 dark:border-beige/10 text-gray-700 dark:text-beige hover:bg-gray-100 dark:hover:bg-navy/80 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-navy border-t border-gray-200 dark:border-beige/10 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                  ? 'text-sage dark:text-sage'
                  : 'text-grey dark:text-grey active:text-sage dark:active:text-sage'
                  }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
