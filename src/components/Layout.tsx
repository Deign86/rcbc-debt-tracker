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
    <div className="flex h-screen transition-colors bg-gradient-to-br from-background via-background to-primary/5">
      {/* Desktop Sidebar - Liquid Glass Style */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 glass-strong border-r-0 m-3 rounded-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="glass-primary rounded-xl p-2 glass-glow">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/rcbc-debt-tracker-app.firebasestorage.app/o/assets%2Flogo.webp?alt=media&token=41fd0341-26dd-4553-a74c-2992068efe69" 
                alt="RCBC Debt Tracker" 
                className="w-8 h-8 object-contain flex-shrink-0" 
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">Debt Tracker</h1>
              <p className="text-xs text-muted-foreground">RCBC Financial Freedom</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-300 cursor-pointer animate-fade-in-up rounded-xl",
                  isActive && "glass-primary font-medium text-primary shadow-lg hover:shadow-xl",
                  !isActive && "text-muted-foreground hover:text-foreground hover:glass-subtle"
                )}
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }}
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
            <Separator className="bg-white/10 mx-4" />
            <div className="p-4">
              {resetButton}
            </div>
          </>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-4 lg:pt-4 lg:pr-4">
        <div className="max-w-sm xxs:max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) - Floating Glass Pill */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 glass-strong rounded-2xl z-50 shadow-2xl">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                asChild
                variant="ghost"
                className={cn(
                  "flex-col h-full gap-0.5 rounded-xl flex-1 transition-all duration-300 cursor-pointer",
                  isActive && "text-primary",
                  !isActive && "text-muted-foreground hover:text-primary"
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
              >
                <Link to={item.path}>
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    isActive && "glass-primary shadow-lg"
                  )}>
                    <Icon className={cn("h-5 w-5", isActive && "animate-pulse-glow")} />
                  </div>
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
