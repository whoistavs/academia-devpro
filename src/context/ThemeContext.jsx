import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedPrefs = window.localStorage.getItem('theme');
            if (typeof storedPrefs === 'string') {
                return storedPrefs;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light'; 
    });

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;

        if (theme === 'dark') {
            root.classList.add('dark');
            body.classList.add('dark'); 
        } else {
            root.classList.remove('dark');
            body.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    return useContext(ThemeContext);
};
