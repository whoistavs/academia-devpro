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
            // Optimistically set from storage first
            const storedUser = localStorage.getItem('user');
            if (storedToken) {
                setToken(storedToken);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                }

                // Verify/Refresh from server to get latest fields (authProvider, role, etc)
                try {
                    // Temporarily set token for api to work if not globally set yet?
                    // actually api.js reads from localStorage too, so it's fine.
                    const profile = await api.getMe();
                    setUser(profile);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(profile));
                } catch (e) {
                    console.error("Session invalid or expired", e);
                    // Optional: logout() if 401? For now let's just keep local data or fail gently
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (userData, accessToken) => {
        // Ensure name is never undefined
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

    // Progress Tracking
    const [completedLessons, setCompletedLessons] = useState({}); // { 'courseId': [0, 1, 2] }

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
        // Optimistic update
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
                // Hack: Convert 0 to string "0" to bypass stale server 'truthy' check bug
                // The stale server has `if (lessonId ...)` which fails for number 0. string "0" is truthy.
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
        // Check for number or string presentation
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
