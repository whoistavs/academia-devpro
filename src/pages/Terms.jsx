import React from 'react';
import { useTranslation } from '../context/LanguageContext';

const Terms = () => {
    const { t } = useTranslation();

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('legal.terms.title')}</h1>

                <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('legal.terms.intro')}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. {t('legal.terms.acceptance.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('legal.terms.acceptance.text')}
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms.ip.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {t('legal.terms.ip.intro')}
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2 pl-4">
                        <li><strong>{t('legal.terms.ip.personal').split(':')[0]}:</strong> {t('legal.terms.ip.personal').split(':')[1]}</li>
                        <li><strong>{t('legal.terms.ip.prohibitions').split(':')[0]}:</strong> {t('legal.terms.ip.prohibitions').split(':')[1]}</li>
                        <li><strong>{t('legal.terms.ip.download').split(':')[0]}:</strong> {t('legal.terms.ip.download').split(':')[1]}</li>
                        <li><strong>{t('legal.terms.ip.penalties').split(':')[0]}:</strong> {t('legal.terms.ip.penalties').split(':')[1]}</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('legal.terms.refund.title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">
                        {t('legal.terms.refund.intro')}
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2 pl-4">
                        <li>{t('legal.terms.refund.deadline')}</li>
                        <li>{t('legal.terms.refund.request')}</li>
                        <li>{t('legal.terms.refund.method')}</li>
                        <li>{t('legal.terms.refund.access')}</li>
                    </ul>

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

export default Terms;
