
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Trophy, Medal, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
    const { user: currentUser } = useAuth();
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: api.getLeaderboard,
        staleTime: 60 * 1000, 
    });

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                </div>
            </div>
        );
    }

    
    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
        if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />;
        return <span className="font-bold text-gray-500 dark:text-gray-400 w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    Ranking Global (XP)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Os top estudantes da DevPro
                </p>
            </div>

            <div className="p-4">
                <ul className="space-y-2">
                    {users.map((user, index) => {
                        const isMe = user._id === currentUser?.id;
                        return (
                            <li
                                key={index}
                                className={`flex items-center justify-between p-3 rounded-lg transition-all
                                    ${isMe
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 shadow-sm transform scale-[1.02]'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-8 flex justify-center">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {index < 3 && (
                                            <div className="absolute -top-1 -right-1 text-yellow-500">
                                                <Star className="w-4 h-4 fill-current" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className={`font-semibold text-sm ${isMe ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                                            {user.name} {isMe && '(Você)'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Nível {user.level || 1} • {user.role === 'admin' ? 'DevPro Staff' : 'Aluno'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                        {user.xp || 0} XP
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {users.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        Nenhum rankeado ainda. Seja o primeiro!
                    </div>
                )}
            </div>

            {}
            {currentUser && !users.find(u => u._id === currentUser.id) && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Você tem <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentUser.xp || 0} XP</span>
                    </p>
                    <p className="text-xs text-gray-500">Continue estudando para entrar no ranking!</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
