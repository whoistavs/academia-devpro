import React, { useEffect, useState } from 'react';

const LanguageSelector = () => {
    const [currentLang, setCurrentLang] = useState('pt');

    useEffect(() => {
        // Check for saved language in cookie or localStorage
        // Google Translate uses 'googtrans' cookie: /from/to
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const checkLanguage = () => {
            const cookie = getCookie('googtrans');
            // Check if cookie exists and points to English target
            if (cookie && (cookie.includes('/en') || cookie.includes('/en/'))) {
                setCurrentLang('en');
            } else {
                // Default to PT if no cookie or if it maps to PT
                setCurrentLang('pt');
            }
        };

        // Helper to initialize Google Translate if needed
        const ensureIdExists = () => {
            if (!document.getElementById('google_translate_element')) {
                const div = document.createElement('div');
                div.id = 'google_translate_element';
                div.style.display = 'none';
                document.body.appendChild(div);
            }
        }

        ensureIdExists();
        checkLanguage();

        // Optional: Poll for changes if multiple tabs update it, but simple mount check is usually enough
    }, []);

    const changeLanguage = (langCode) => {
        // Google Translate logic: find the select box and change value
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
            combo.value = langCode;
            combo.dispatchEvent(new Event('change'));
            setCurrentLang(langCode);
        } else {
            console.warn('Google Translate combo not found. Trying fallback via cookie...');
            // Fallback: Set cookie manually and reload
            // Format: /source/target (e.g., /auto/en)
            document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${window.location.hostname}`;
            document.cookie = `googtrans=/auto/${langCode}; path=/`; // Fallback for localhost
            window.location.reload();
        }
    };

    return (
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button
                onClick={() => changeLanguage('pt')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${currentLang === 'pt'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
            >
                PT
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${currentLang === 'en'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSelector;
