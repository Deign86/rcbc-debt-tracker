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
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream-50 dark:bg-matcha-900 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div className="relative flex flex-col items-center">
                {/* Logo Circle Animation */}
                <div className="w-32 h-32 mb-6 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-matcha-500 rounded-full opacity-20 animate-ping" />
                    <img
                        src="/logo-new.webp"
                        alt="Logo"
                        className="w-28 h-28 object-contain animate-pulse drop-shadow-xl"
                    />
                </div>

                {/* Text Animation */}
                <h1 className="text-3xl font-bold text-matcha-900 dark:text-cream-50 animate-fade-in-up">
                    Welcome, Deign
                </h1>
            </div>
        </div>
    );
};
