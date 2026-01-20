import React, { createContext, useContext, useState, useEffect } from 'react';
import pt from '../i18n/locales/pt.json';
import en from '../i18n/locales/en.json';
import es from '../i18n/locales/es.json';
import zh from '../i18n/locales/zh.json';
import ar from '../i18n/locales/ar.json';
import de from '../i18n/locales/de.json';
import fr from '../i18n/locales/fr.json';

const LanguageContext = createContext();

const translations = {
    pt,
    en,
    es,
    zh,
    ar,
    de,
    fr
};

export const availableLanguages = [
    { code: 'pt', label: 'Português (BR)' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'zh', label: '中文 (Mandarin)' },
    { code: 'ar', label: 'العربية (Arabic)' }
];

export const LanguageProvider = ({ children }) => {

    const [language, setLanguage] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedLang = window.localStorage.getItem('language');
            return storedLang || 'pt';
        }
        return 'pt';
    });

    useEffect(() => {
        localStorage.setItem('language', language);


        const dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = language;

    }, [language]);

    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    const t = (key) => {

        if (translations[language][key]) {
            return translations[language][key];
        }


        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key;
            }
        }

        if (typeof value !== 'string') {
            return key;
        }

        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, availableLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    return useContext(LanguageContext);
};
