import React, { createContext, useContext, useState, useEffect } from 'react';

import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved token on load
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
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
                // lessonId in this simple app is just the index
                await api.updateProgress(courseId, lessonIndex);
            } catch (error) {
                console.error("Failed to save progress:", error);
                // Rollback if needed, but for now we keep optimistic state
            }
        }
    };

    const isLessonCompleted = (courseId, lessonIndex) => {
        return completedLessons[courseId]?.includes(lessonIndex);
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
