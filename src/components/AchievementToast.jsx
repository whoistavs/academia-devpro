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
            case 'xp': return 'from-yellow-500/80 to-orange-600/80 border-yellow-400/50 shadow-yellow-500/20';
            case 'level': return 'from-indigo-600/80 to-purple-700/80 border-indigo-400/50 shadow-indigo-500/20';
            case 'badge': return 'from-pink-600/80 to-rose-700/80 border-pink-400/50 shadow-pink-500/20';
            case 'streak': return 'from-orange-500/80 to-red-600/80 border-orange-400/50 shadow-orange-500/20';
            default: return 'from-gray-800/80 to-gray-900/80 border-gray-600 shadow-gray-500/20';
        }
    };

    return (
        <div 
            className={`transform transition-all duration-700 ease-in-out 
            ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}
            flex items-center gap-4 px-6 py-4 rounded-2xl backdrop-blur-xl border bg-gradient-to-br shadow-2xl ${getBgColor()}`}
        >
            <div className="flex-shrink-0 bg-white/20 p-3 rounded-full shadow-inner">
                {getIcon()}
            </div>
            <div className="min-w-[120px]">
                <p className="text-white font-extrabold text-xl leading-tight drop-shadow-md">{message}</p>
                <div className="flex items-center mt-1">
                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white animate-[progress_4s_linear]" style={{ width: '100%' }}></div>
                    </div>
                </div>
                <p className="text-white/90 text-[10px] font-bold uppercase tracking-widest mt-2 px-2 py-0.5 bg-black/20 rounded-full inline-block">
                    {type === 'xp' ? 'XP de Maestria' : 
                     type === 'level' ? 'Novo Nível' : 
                     type === 'badge' ? 'Conquista Rara' : 'Ofensiva Lendária'}
                </p>
            </div>
        </div>
    );
};

export default AchievementToast;
