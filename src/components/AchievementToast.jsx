import React, { useEffect, useState } from 'react';
import { Star, Award, Flame, Zap } from 'lucide-react';

const AchievementToast = ({ message, type = 'xp', duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => {
            setIsVisible(true);
        });

        // Trigger leave animation after duration
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onClose, 500); // Wait for exit animation to complete
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'xp':
                return <Zap className="w-6 h-6 text-yellow-400 fill-current animate-pulse" />;
            case 'level':
                return <Star className="w-6 h-6 text-indigo-400 fill-current animate-spin-slow" />;
            case 'badge':
                return <Award className="w-6 h-6 text-pink-400 fill-current" />;
            case 'streak':
                return <Flame className="w-6 h-6 text-orange-400 fill-current animate-bounce" />;
            default:
                return <Award className="w-6 h-6 text-indigo-400" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'xp':
                return 'bg-gray-900 border-yellow-500/50';
            case 'level':
                return 'bg-indigo-900 border-indigo-400/50';
            case 'badge':
                return 'bg-pink-900 border-pink-400/50';
            case 'streak':
                return 'bg-orange-900 border-orange-400/50';
            default:
                return 'bg-gray-900 border-gray-700';
        }
    };

    return (
        <div 
            className={`fixed bottom-6 right-6 z-50 transform transition-all duration-500 ease-out 
            ${isVisible && !isLeaving ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}
            flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border ${getBgColor()}`}
        >
            <div className="flex-shrink-0 bg-white/10 p-2 rounded-full">
                {getIcon()}
            </div>
            <div>
                <p className="text-white font-bold text-lg leading-tight">{message}</p>
                <p className="text-white/70 text-sm mt-0.5">
                    {type === 'xp' ? '+ XP Adquirido!' : 
                     type === 'level' ? 'Parabéns!' : 
                     type === 'badge' ? 'Nova Conquista Desbloqueada' : 'Ofensiva Mantida!'}
                </p>
            </div>
        </div>
    );
};

export default AchievementToast;
