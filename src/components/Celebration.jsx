import React, { useEffect, useState } from 'react';

const Celebration = ({ duration = 3000, onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {[...Array(50)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-3 h-3 rounded-sm animate-confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-10%`,
                        backgroundColor: ['#4f46e5', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                        transform: `rotate(${Math.random() * 360}deg)`
                    }}
                />
            ))}
        </div>
    );
};

export default Celebration;
