import React, { createContext, useContext, useState, useEffect } from 'react';

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

    const login = (token, userData) => {
        setToken(token);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
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

    useEffect(() => {
        const storedProgress = localStorage.getItem('completedLessons');
        if (storedProgress) {
            setCompletedLessons(JSON.parse(storedProgress));
        }
    }, []);

    const markLessonComplete = (courseId, lessonIndex) => {
        setCompletedLessons(prev => {
            const courseProgress = prev[courseId] || [];
            if (courseProgress.includes(lessonIndex)) return prev;

            const newProgress = {
                ...prev,
                [courseId]: [...courseProgress, lessonIndex]
            };
            localStorage.setItem('completedLessons', JSON.stringify(newProgress));
            return newProgress;
        });
    };

    const isLessonCompleted = (courseId, lessonIndex) => {
        return completedLessons[courseId]?.includes(lessonIndex);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, updateUser, loading, markLessonComplete, isLessonCompleted, completedLessons }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
