import { useEffect, useState } from 'react';

interface WelcomeAnimationProps {
    onComplete: () => void;
}

export const WelcomeAnimation = ({ onComplete }: WelcomeAnimationProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Start fade out after 2.5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2500);

        // Complete animation after fade out (total 3s)
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            {/* Static background orbs */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />

            <div className="relative flex flex-col items-center animate-fade-in">
                {/* Logo Circle */}
                <div className="w-36 h-36 mb-8 relative flex items-center justify-center">
                    <div className="absolute inset-0 glass-primary rounded-2xl" />
                    <div className="absolute inset-2 glass rounded-xl" />
                    <img
                        src="/logo-new.webp"
                        alt="Logo"
                        className="w-24 h-24 object-contain drop-shadow-xl relative z-10"
                    />
                </div>

                {/* Text */}
                <h1 className="text-3xl font-bold text-foreground glass-subtle px-8 py-4 rounded-2xl">
                    Welcome, Deign
                </h1>
            </div>
        </div>
    );
};
