
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import CourseSkeleton from '../components/CourseSkeleton';
import { api } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import { Search, Filter, BookOpen, Clock, BarChart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const Courses = () => {
    const { t, language } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    // Initialize state from URL, but also allow local updates
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    // Sync URL -> State (e.g. when navigating from Navbar)
    React.useEffect(() => {
        const querySearch = searchParams.get('search');
        if (querySearch !== null && querySearch !== searchTerm) {
            setSearchTerm(querySearch);
        }
    }, [searchParams]);

    // Optional: Sync State -> URL (if we want the URL to reflect typing)
    // For now, let's just make sure the Navbar search works.

    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const currentLang = language || 'pt';

    const [selectedLang, setSelectedLang] = useState(currentLang.split('-')[0] || 'pt');


    const { data: courses = [], isLoading, error } = useQuery({
        queryKey: ['courses'],
        queryFn: () => api.getCourses(),
        staleTime: 1000 * 60 * 5,
    });


    const getContent = (data) => {
        if (!data) return "";
        if (typeof data === 'string') return data;
        const langCode = currentLang.split('-')[0].toLowerCase();
        return data[langCode] || data['pt'] || data['en'] || Object.values(data)[0];
    };

    const categories = ['Todas', 'Front-end', 'Back-end', 'Mobile', 'Data Science'];


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

                    { }
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                        {/* Search Bar */}
                        <div className="relative w-full md:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                                placeholder={t('courses.searchPlaceholder') || "O que você quer aprender hoje?"}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Language Filter */}
                        <div className="flex items-center w-full md:w-auto">
                            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                            <select
                                value={selectedLang}
                                onChange={(e) => setSelectedLang(e.target.value)}
                                className="block w-full md:w-48 pl-3 pr-8 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            >
                                <option value="pt">Idioma: Português 🇧🇷</option>
                                <option value="en">Language: English 🇺🇸</option>
                                <option value="es">Idioma: Español 🇪🇸</option>
                                <option value="fr">Langue: Français 🇫🇷</option>
                                <option value="de">Sprache: Deutsch 🇩🇪</option>
                            </select>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-3 mb-12 justify-center md:justify-start">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 text-sm ${selectedCategory === category
                                    ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:shadow-md'
                                    }`}
                            >
                                {getCategoryLabel(category)}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {/* Skeleton Loading */}
                        {[...Array(6)].map((_, i) => <CourseSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                            <BookOpen className="h-10 w-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ops! Algo deu errado.</h3>
                        <p className="text-gray-600 dark:text-gray-400">Não foi possível carregar os cursos. Tente recarregar a página.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredCourses.map(course => (
                                <CourseCard key={course.id} course={course} getContent={getContent} />
                            ))}
                        </div>

                        {filteredCourses.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
                                    <Search className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Nenhum curso encontrado
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                    Não encontramos cursos com os filtros selecionados. Tente buscar por outro termo ou categoria.
                                </p>
                                <button
                                    onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); }}
                                    className="mt-6 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};

export default Courses;
