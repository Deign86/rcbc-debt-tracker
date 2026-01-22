import { useEffect, useState } from 'react';

interface CelebrationProps {
  milestone: number;
  onComplete: () => void;
}

export const CelebrationAnimation = ({ milestone, onComplete }: CelebrationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const getMilestoneMessage = () => {
    switch (milestone) {
      case 25:
        return {
          title: '🎯 25% Milestone Reached!',
          message: "You've paid off a quarter of your debt! Amazing progress!",
          color: 'from-blue-500/80 to-cyan-500/80',
        };
      case 50:
        return {
          title: '🔥 Halfway There!',
          message: "You're 50% debt-free! The finish line is in sight!",
          color: 'from-orange-500/80 to-red-500/80',
        };
      case 75:
        return {
          title: '💪 75% Complete!',
          message: "Three-quarters done! You're unstoppable!",
          color: 'from-purple-500/80 to-pink-500/80',
        };
      case 100:
        return {
          title: '🎉 DEBT FREE!',
          message: "Congratulations! You've completely paid off your debt!",
          color: 'from-green-500/80 to-emerald-500/80',
        };
      default:
        return {
          title: '🎊 Milestone Reached!',
          message: 'Keep up the great work!',
          color: 'from-primary/80 to-primary/60',
        };
    }
  };

  const { title, message, color } = getMilestoneMessage();

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 glass-overlay z-50 transition-opacity duration-300"
        onClick={handleDismiss}
      />

      {/* Celebration Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`
            pointer-events-auto
            glass-strong
            rounded-2xl
            shadow-2xl
            max-w-md
            w-full
            p-8
            transition-all
            duration-300
            animate-scale-in
            overflow-hidden
            relative
            ${isVisible ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 pointer-events-none`} />
          
          {/* Static orbs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          {/* Confetti Animation */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary/60 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 text-center space-y-4">
            <div className="text-6xl mb-4 glass-subtle w-24 h-24 rounded-2xl flex items-center justify-center mx-auto">
              {milestone === 100 ? '🎉' : milestone === 75 ? '💪' : milestone === 50 ? '🔥' : '🎯'}
            </div>
            
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              {title}
            </h2>
            
            <p className="text-lg text-muted-foreground">
              {message}
            </p>

            {milestone === 100 && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-muted-foreground italic">
                  "The only way to do great work is to love what you do." - Steve Jobs
                </p>
              </div>
            )}

            <button
              onClick={handleDismiss}
              className="mt-6 px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors font-medium shadow-lg cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti linear infinite;
        }
      `}</style>
    </>
  );
};
