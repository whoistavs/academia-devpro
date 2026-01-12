import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';

const CookieBanner = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 animate-slide-up border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-300">
                    <p>
                        {t('legal.cookieBanner.text')}
                        <a href="/privacidade" className="text-indigo-400 hover:text-indigo-300 ml-1 underline transition-colors">
                            {t('legal.cookieBanner.link')}
                        </a>.
                    </p>
                </div>
                <button
                    onClick={handleAccept}
                    className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {t('legal.cookieBanner.accept')}
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
