import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  resetButton?: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/simulator', label: 'Simulator', icon: '📈' },
  { path: '/history', label: 'History', icon: '📋' },
  { path: '/preferences', label: 'Preferences', icon: '⚙️' },
];

export const Layout = ({ children, resetButton }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-sage dark:bg-slate-900 transition-colors">
      {/* Desktop Sidebar - Hidden on mobile/tablet, visible on desktop */}
      <aside className="hidden lg:flex flex-col w-56 lg-plus:w-64 xl:w-72 bg-white dark:bg-navy border-r border-gray-200 dark:border-beige/10">
        <div className="p-4 lg-plus:p-5 xl:p-6">
          <div className="flex items-center gap-2 lg-plus:gap-3 mb-1">
            <img src="https://firebasestorage.googleapis.com/v0/b/rcbc-debt-tracker-app.firebasestorage.app/o/assets%2Flogo.webp?alt=media&token=41fd0341-26dd-4553-a74c-2992068efe69" alt="Debt Repayment Logo" className="w-7 lg-plus:w-8 object-contain" />
            <h1 className="text-lg lg-plus:text-xl font-bold text-matcha-600 dark:text-cream-100">Debt Tracker</h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pl-9 lg-plus:pl-11">Financial Freedom Journey</p>
        </div>
        <nav className="flex-1 px-3 lg-plus:px-4 space-y-1.5 lg-plus:space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 lg-plus:gap-3 px-3 lg-plus:px-4 py-2.5 lg-plus:py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-matcha-100 dark:bg-matcha-900/50 text-matcha-700 dark:text-cream-100 font-medium shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-matcha-600 dark:hover:text-cream-200'
                  }`}
              >
                <span className="text-lg lg-plus:text-xl">{item.icon}</span>
                <span className="text-sm lg-plus:text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {resetButton && (
          <div className="p-3 lg-plus:p-4 border-t border-gray-200 dark:border-beige/10">
            {resetButton}
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="max-w-sm xxs:max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-navy border-t border-gray-200 dark:border-beige/10 safe-area-inset-bottom z-50">
        <div className="flex justify-around items-center h-14 xxs:h-16 sm:h-[4.5rem] max-w-sm xxs:max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
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
                <span className="text-xl xxs:text-2xl mb-0.5 xxs:mb-1">{item.icon}</span>
                <span className="text-[10px] xxs:text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
