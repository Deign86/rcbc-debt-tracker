import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, TrendingUp, History, Settings } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  resetButton?: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/simulator', label: 'Simulator', icon: TrendingUp },
  { path: '/history', label: 'History', icon: History },
  { path: '/preferences', label: 'Preferences', icon: Settings },
];

export const Layout = ({ children, resetButton }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-cream-50 dark:bg-matcha-950 transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-matcha-200 dark:border-matcha-800 bg-cream-100 dark:bg-matcha-900">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/rcbc-debt-tracker-app.firebasestorage.app/o/assets%2Flogo.webp?alt=media&token=41fd0341-26dd-4553-a74c-2992068efe69" 
              alt="Debt Repayment Logo" 
              className="w-12 h-12 object-contain flex-shrink-0" 
            />
            <div>
              <h1 className="text-xl font-bold text-matcha-800 dark:text-cream-100">Debt Tracker</h1>
              <p className="text-xs text-matcha-600 dark:text-matcha-400">Financial Freedom Journey</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "font-medium bg-matcha-200 dark:bg-matcha-700 text-matcha-800 dark:text-cream-100",
                  !isActive && "text-matcha-700 dark:text-matcha-300 hover:bg-matcha-100 dark:hover:bg-matcha-800"
                )}
              >
                <Link to={item.path}>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
        
        {resetButton && (
          <>
            <Separator className="bg-matcha-300 dark:bg-matcha-700" />
            <div className="p-4">
              {resetButton}
            </div>
          </>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="max-w-sm xxs:max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-cream-100 dark:bg-matcha-900 border-t border-matcha-200 dark:border-matcha-800 z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                asChild
                variant="ghost"
                className={cn(
                  "flex-col h-full gap-1 rounded-none flex-1",
                  isActive && "text-matcha-700 dark:text-matcha-300",
                  !isActive && "text-matcha-600 dark:text-matcha-400"
                )}
              >
                <Link to={item.path}>
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
