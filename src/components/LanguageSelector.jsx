import React from 'react';
import { useTranslation, availableLanguages } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
    const { language, changeLanguage } = useTranslation();

    return (
        <div className="relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-2" />
            <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-200 font-medium py-1 pl-2 pr-6 rounded-md focus:outline-none cursor-pointer appearance-none hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Select Language"
            >
                {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;
