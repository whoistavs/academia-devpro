
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import CourseSkeleton from '../components/CourseSkeleton';
import { api } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import { Search, Filter, BookOpen, Clock, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const Courses = () => {
    const { t, language } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const currentLang = language || 'pt';

    const [selectedLang, setSelectedLang] = useState(currentLang.split('-')[0] || 'pt');

    // React Query usage
    const { data: courses = [], isLoading, error } = useQuery({
        queryKey: ['courses'],
        queryFn: () => api.getCourses(),
        staleTime: 1000 * 60 * 5, // 5 min
    });

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

    const filteredCourses = courses.filter(course => {
        const matchesSearch = getContent(course.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getContent(course.description).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || course.category === selectedCategory;
        const matchesLang = (course.language || 'pt') === selectedLang;

        return matchesSearch && matchesCategory && matchesLang;
    });

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('nav.courses')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{t('courses.description')}</p>

                    {/* Search Bar */}
                    <div className="relative max-w-md w-full mb-8">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                            placeholder={t('courses.searchPlaceholder') || "Pesquisar..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter UI */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 text-sm ${selectedCategory === category
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    {getCategoryLabel(category)}
                                </button>
                            ))}
                        </div>

                        {/* Language Filter */}
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 flex items-center">
                                <Filter className="w-4 h-4 mr-1" />
                                Idioma:
                            </span>
                            <select
                                value={selectedLang}
                                onChange={(e) => setSelectedLang(e.target.value)}
                                className="block w-32 pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="pt">Português 🇧🇷</option>
                                <option value="en">English 🇺🇸</option>
                                <option value="es">Español 🇪🇸</option>
                                <option value="fr">Français 🇫🇷</option>
                                <option value="de">Deutsch 🇩🇪</option>
                            </select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Show 6 skeletons while loading */}
                        {[...Array(6)].map((_, i) => <CourseSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        Falha ao carregar cursos. Tente novamente.
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </main>
    );
};

export default Courses;
