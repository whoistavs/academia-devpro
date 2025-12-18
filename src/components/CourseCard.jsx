import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BarChart } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const CourseCard = ({ course }) => {
    const { t, language } = useTranslation();
    const currentLang = language || 'pt';

    // Helper to get content based on language
    const getContent = (data) => {
        if (!data) return "";
        if (typeof data === 'string') return data;
        const langCode = currentLang.split('-')[0].toLowerCase();
        return data[langCode] || data['pt'] || data['en'] || Object.values(data)[0];
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={course.image}
                    alt={getContent(course.title)}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    {course.category}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{getContent(course.title)}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
                    {getContent(course.description)}
                </p>

                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-6 space-x-4">
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                        <BarChart className="h-4 w-4 mr-1" />
                        <span>{t('courseCard.level')} {getContent(course.level)}</span>
                    </div>
                </div>

                <Link
                    to={`/curso/${course.slug}`}
                    className="block w-full text-center bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                    {t('courseCard.details')}
                </Link>
            </div>
        </div>
    );
};

export default CourseCard;
