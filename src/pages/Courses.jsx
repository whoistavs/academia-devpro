import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import coursesData from '../data/cursos.json';
import { useTranslation } from '../context/LanguageContext';
import { Search, Filter, BookOpen, Clock, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Courses = () => {
    const { t, language } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const currentLang = language || 'pt';

    // Helper to get content based on language
    const getContent = (data) => {
        if (!data) return "";
        if (typeof data === 'string') return data;
        const langCode = currentLang.split('-')[0].toLowerCase();
        return data[langCode] || data['pt'] || data['en'] || Object.values(data)[0];
    };

    const categories = ['Todas', 'Front-end', 'Back-end', 'Mobile', 'Data Science'];

    // Helper to translate category names for UI display
    const getCategoryLabel = (cat) => {
        const map = {
            'Todas': t('courses.filters.all'),
            'Front-end': t('courses.filters.frontend'),
            'Back-end': t('courses.filters.backend'),
            'Data Science': t('courses.filters.datascience')
        };
        return map[cat] || cat;
    };

    const filteredCourses = coursesData.filter(course => {
        const matchesSearch = getContent(course.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getContent(course.description).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || course.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('nav.courses')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{t('courses.searchPlaceholder')}</p> {/* Re-using placeholder as description for now or create new key */}

                    {/* Filter UI */}
                    <div className="flex flex-wrap gap-4">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${selectedCategory === category
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {getCategoryLabel(category)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} getContent={getContent} />
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('courses.noCourses')}</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Courses;
