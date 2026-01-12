import React from 'react';
import { useTranslation } from '../context/LanguageContext';

const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('legal.privacy.title')}</h1>

                <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('legal.privacy.intro')}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. {t('legal.privacy.collection.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('legal.privacy.collection.text')}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. {t('legal.privacy.usage.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('legal.privacy.usage.text')}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. {t('legal.privacy.rights.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('legal.privacy.rights.text')}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.privacy.contact.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('legal.privacy.contact.text')}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.privacy.responsible.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('legal.privacy.responsible.text')}
                    </p>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mt-8">
                        <p className="text-sm text-yellow-700 dark:text-yellow-200">
                            **DISCLAIMER**: {t('legal.disclaimer')}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPolicy;
