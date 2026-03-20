import React, { createContext, useContext, useState, useEffect } from 'react';

import { api } from '../services/api';
import AchievementToast from '../components/AchievementToast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { id, message, type }]);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            
            const storedUser = localStorage.getItem('user');
            if (storedToken) {
                setToken(storedToken);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                }

                
                try {
                    
                    
                    const profile = await api.getMe();
                    setUser(profile);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(profile));
                } catch (e) {
                    console.error("Session invalid or expired", e);
                    
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (userData, accessToken) => {
        
        const safeUser = {
            ...userData,
            name: userData && userData.name && userData.name !== 'undefined' ? userData.name : 'Usuário'
        };

        setToken(accessToken);
        setUser(safeUser);
        setIsAuthenticated(true);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(safeUser));

        if (safeUser.streak >= 1) {
            addNotification(`${safeUser.streak} dia(s) seguidos!`, 'streak');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    
    const [completedLessons, setCompletedLessons] = useState({}); 

    const fetchProgress = async (courseId) => {
        if (!isAuthenticated || !courseId) return;
        try {
            const progress = await api.getProgress(courseId);
            setCompletedLessons(prev => ({
                ...prev,
                [courseId]: progress.completedLessons || []
            }));
        } catch (error) {
            console.error("Error fetching progress:", error);
        }
    };

    const markLessonComplete = async (courseId, lessonIndex) => {
        
        setCompletedLessons(prev => {
            const courseProgress = prev[courseId] || [];
            if (courseProgress.includes(lessonIndex)) return prev;
            return {
                ...prev,
                [courseId]: [...courseProgress, lessonIndex]
            };
        });

        if (isAuthenticated) {
            try {
                
                
                const normalizedLessonId = String(lessonIndex);
                const result = await api.updateProgress({ courseId, lessonId: normalizedLessonId });

                if (result.gamification) {
                    const { earnedXp, newBadges, leveledUp, user: updatedUser } = result.gamification;
                    
                    if (earnedXp > 0) addNotification(`+${earnedXp} XP de Conhecimento!`, 'xp');
                    if (newBadges && newBadges.length > 0) {
                        newBadges.forEach(badge => addNotification(`Conquista Desbloqueada: ${badge}`, 'badge'));
                    }
                    if (leveledUp) addNotification(`Subiu de Nível! Nível ${updatedUser?.level || 'Novo'}`, 'level');

                    if (updatedUser) {
                        updateUser({ ...user, ...updatedUser });
                    }
                }
            } catch (error) {
                console.error("Failed to save progress:", error);
            }
        }
    };

    const isLessonCompleted = (courseId, lessonIndex) => {
        const arr = completedLessons[courseId];
        if (!arr) return false;
        
        return arr.includes(lessonIndex) || arr.includes(String(lessonIndex));
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, updateUser, loading, markLessonComplete, isLessonCompleted, completedLessons, fetchProgress, addNotification }}>
            {children}
            <div className="fixed bottom-0 right-0 p-6 z-[9999] pointer-events-none flex flex-col items-end gap-3">
                {notifications.map(n => (
                    <div key={n.id} className="pointer-events-auto">
                        <AchievementToast 
                            message={n.message} 
                            type={n.type} 
                            onClose={() => removeNotification(n.id)} 
                        />
                    </div>
                ))}
            </div>
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
