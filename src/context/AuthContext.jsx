import React, { createContext, useContext, useState, useEffect } from 'react';

import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

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
        if (!isAuthenticated) return;
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
                
                
                const finalId = lessonIndex === 0 ? "0" : lessonIndex;
                await api.updateProgress({ courseId, lessonId: finalId });
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
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, updateUser, loading, markLessonComplete, isLessonCompleted, completedLessons, fetchProgress }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
