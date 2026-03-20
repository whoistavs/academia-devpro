import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Trophy, Medal, Star, X, Calendar, Shield, Zap, Target, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Skeleton from './Skeleton';

const Leaderboard = () => {
    const { user: currentUser } = useAuth();
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: api.getLeaderboard,
        staleTime: 60 * 1000, 
    });
    const [selectedUser, setSelectedUser] = useState(null);

    if (isLoading) {
        return (
            <div className="glass rounded-3xl border-none ring-1 ring-white/10 dark:ring-gray-700/30 p-6 shadow-lg transition-all duration-300">
                <Skeleton width="150px" height="24px" className="mb-6 rounded-lg" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-4" style={{ opacity: 1 - (i * 0.15) }}>
                            <Skeleton width="40px" height="40px" circle />
                            <div className="flex-1 space-y-2">
                                <Skeleton width="60%" height="16px" className="rounded-md" />
                                <Skeleton width="30%" height="12px" className="rounded-md" />
                            </div>
                            <Skeleton width="50px" height="20px" className="rounded-lg" />
                        </div>
                    ))}
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
        <>
            <div className="glass rounded-3xl border-none ring-1 ring-white/10 dark:ring-gray-700/30 overflow-hidden shadow-2xl transition-all duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <Trophy className="w-6 h-6 mr-3 text-yellow-500" />
                        Ranking Global (XP)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Os top estudantes da DevPro
                    </p>
                </div>

                <div className="p-4">
                    <ul className="space-y-2">
                        {users.map((user, index) => {
                            const isMe = (user._id || user.id) === (currentUser?.id || currentUser?._id);
                            return (
                                <li
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group
                                        ${isMe
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 shadow-sm transform scale-[1.02]'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:translate-x-1'
                                        }`}
                                    onClick={() => setSelectedUser(user)}
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
                                                        {(user.name || '?').charAt(0)}
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

                {currentUser && !users.find(u => (u._id || u.id) === (currentUser?.id || currentUser?._id)) && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Você tem <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentUser.xp || 0} XP</span>
                        </p>
                        <p className="text-xs text-gray-500">Continue estudando para entrar no ranking!</p>
                    </div>
                )}
            </div>

            {/* User Profile Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        {/* Header/Cover */}
                        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all btn-premium"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Profile Body */}
                        <div className="px-6 pb-8 -mt-12 relative">
                            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden mb-4 mx-auto">
                                {selectedUser.avatar ? (
                                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                        {(selectedUser.name || '?').charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="text-center mb-6">
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h4>
                                <p className="text-indigo-600 dark:text-indigo-400 font-medium">Nível {selectedUser.level || 1} • {selectedUser.role === 'admin' ? 'DevPro Staff' : 'Aluno'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                                    <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total XP</p>
                                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">{selectedUser.xp || 0}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                                    <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cursos</p>
                                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">{selectedUser.purchasedCourses?.length || 0}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 mr-3" />
                                    Membro desde {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Março 2024'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Shield className="w-4 h-4 mr-3" />
                                    {selectedUser.badges?.length || 0} Conquistas Desbloqueadas
                                </div>
                            </div>

                            {selectedUser.badges && selectedUser.badges.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">Principais Medalhas</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {selectedUser.badges.slice(0, 4).map((badge, bidx) => (
                                            <div key={bidx} className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800" title={badge}>
                                                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Leaderboard;
