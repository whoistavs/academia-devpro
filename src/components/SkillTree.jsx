import React from 'react';
import { PlayCircle, Lock, CheckCircle, Star, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const SkillTree = ({ modules, isAuthenticated, purchasedCourses, gradient }) => {
    // modules is an array of { id, title, slug }
    
    return (
        <div className="relative py-12 px-4 select-none">
            {/* SVG Background Layer for Paths */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
                <svg className="w-full h-full" overflow="visible">
                    <defs>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Simplified zigzag path for modules */}
                    {modules.length > 1 && modules.map((_, i) => {
                        if (i === modules.length - 1) return null;
                        
                        // We use a relative positioning logic: nodes are centered
                        // This is a CSS-based layout, so SVG paths are harder to sync perfectly
                        // We'll use a vertical line with slight curves for now
                        return (
                            <path
                                key={i}
                                d={`M 50% ${100 + i * 140} C 50% ${140 + i * 140}, 50% ${140 + i * 140}, 50% ${180 + i * 140}`}
                                stroke="url(#pathGradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray="8,8"
                                className="animate-pulse"
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Nodes Container */}
            <div className="flex flex-col items-center gap-20 relative z-10">
                {modules.map((mod, idx) => {
                    const isUnlocked = isAuthenticated && purchasedCourses?.includes(mod.id);
                    const isNextToUnlock = idx === 0 || (isAuthenticated && purchasedCourses?.includes(modules[idx-1]?.id));
                    
                    return (
                        <div key={idx} className="flex flex-col items-center group">
                            {/* The Node */}
                            <div className="relative">
                                {/* Glow Effect for Unlocked/Active */}
                                {(isUnlocked || isNextToUnlock) && (
                                    <div className={`absolute inset-0 bg-gradient-to-r ${gradient || 'from-indigo-500 to-purple-600'} rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity animate-pulse`}></div>
                                )}
                                
                                <div 
                                    className={`
                                        w-20 h-20 rounded-full flex items-center justify-center relative z-10 border-4 transition-all duration-500 transform group-hover:scale-110 shadow-2xl
                                        ${isUnlocked 
                                            ? `bg-gradient-to-br ${gradient || 'from-indigo-500 to-purple-600'} border-white dark:border-gray-800 text-white scale-105` 
                                            : isNextToUnlock 
                                                ? 'bg-white dark:bg-gray-800 border-indigo-500 text-indigo-500 animate-bounce-slow' 
                                                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 opacity-50'}
                                    `}
                                >
                                    {isUnlocked ? (
                                        <CheckCircle className="w-10 h-10" />
                                    ) : isNextToUnlock ? (
                                        <Star className="w-10 h-10 fill-current" />
                                    ) : (
                                        <Lock className="w-8 h-8" />
                                    )}
                                    
                                    {/* Level Badge */}
                                    <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-gray-700">
                                        LVL {idx + 1}
                                    </div>
                                </div>
                            </div>

                            {/* Label Card */}
                            <div className={`
                                mt-4 p-4 glass rounded-2xl text-center min-w-[200px] max-w-[280px] shadow-xl border-none ring-1 transition-all duration-300
                                ${isUnlocked 
                                    ? 'ring-indigo-500/30' 
                                    : isNextToUnlock 
                                        ? 'ring-indigo-500 animate-pulse' 
                                        : 'ring-gray-700/30'}
                                group-hover:-translate-y-2
                            `}>
                                <h4 className={`font-black text-sm uppercase tracking-tight mb-1 truncate ${isUnlocked ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
                                    {mod.title}
                                </h4>
                                
                                {isUnlocked ? (
                                    <Link 
                                        to={`/curso/${mod.slug}`}
                                        className="inline-flex items-center text-[10px] font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors mt-1"
                                    >
                                        <PlayCircle className="w-3 h-3 mr-1" /> RECOMEÇAR
                                    </Link>
                                ) : isNextToUnlock ? (
                                    <p className="text-[10px] font-bold text-indigo-500">PRÓXIMO OBJETIVO</p>
                                ) : (
                                    <p className="text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1">
                                        <Lock className="w-2.5 h-2.5" /> REQUISITO PENDENTE
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {/* Final Goal Node */}
                <div className="flex flex-col items-center opacity-70 group mt-10">
                    <div className="w-24 h-24 rounded-3xl bg-black border-4 border-yellow-500/50 flex items-center justify-center rotate-45 group-hover:rotate-[225deg] transition-all duration-1000 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                        <Award className="w-12 h-12 text-yellow-500 -rotate-45 group-hover:-rotate-[225deg] transition-all duration-1000" />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">CERTIFICAÇÃO FINAL</span>
                        <p className="text-xs text-gray-500 font-bold">Domine a trilha completa</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillTree;
