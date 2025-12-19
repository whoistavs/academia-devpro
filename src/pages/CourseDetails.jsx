import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, BarChart, BookOpen, CheckCircle, PlayCircle, ArrowLeft, User } from 'lucide-react';
import coursesData from '../data/cursos.json';
import { useTranslation } from '../context/LanguageContext';

const CourseDetails = () => {
    const { slug } = useParams();
    const { language, t } = useTranslation();
    const currentLang = language || 'pt';

    // Helper to get content based on language
    const getContent = (data) => {
        if (!data) return "";
        if (typeof data === 'string') return data;
        const langCode = currentLang.split('-')[0].toLowerCase();
        return data[langCode] || data['pt'] || data['en'] || Object.values(data)[0];
    };

    const course = coursesData.find(c => c.slug === slug);

    if (!course) {
        return (
            <main className="flex-grow flex flex-col items-center justify-center pt-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('courses.noCourses')}</h2>
                <Link to="/cursos" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    {t('courseDetails.back')}
                </Link>
            </main>
        );
    }

    return (
        <main className="flex-grow pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Course Header */}
            <div className="bg-indigo-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/cursos" className="inline-flex items-center text-indigo-300 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        {t('courseDetails.back')}
                    </Link>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="md:w-3/4">
                            <span className="bg-indigo-700 text-purple-100 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 inline-block shadow-sm tracking-wide">
                                {course.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{getContent(course.title)}</h1>

                            <div className="flex flex-wrap gap-6 text-sm font-medium text-indigo-200">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-indigo-400" />
                                    <span>{course.duration} {t('courseDetails.contentCount')}</span>
                                </div>
                                <div className="flex items-center">
                                    <BarChart className="h-5 w-5 mr-2 text-indigo-400" />
                                    <span>{t('courseDetails.level')} {getContent(course.level)}</span>
                                </div>
                                <div className="flex items-center">
                                    <User className="h-5 w-5 mr-2 text-indigo-400" />
                                    <span>{t('courseDetails.certificate')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content Info */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content Column */}
                    <div className="lg:col-span-2">
                        {/* Full Description */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b dark:border-gray-700 pb-2 relative">
                                {t('courseDetails.about')}
                                <span className="absolute bottom-0 left-0 w-20 h-1 bg-indigo-600 rounded"></span>
                            </h2>
                            <div className="prose prose-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>{getContent(course.descricaoCompleta)}</p>
                            </div>
                        </div>

                        {/* Modules List */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-700 pb-2 relative">
                                {t('courseDetails.learn')}
                                <span className="absolute bottom-0 left-0 w-20 h-1 bg-indigo-600 rounded"></span>
                            </h2>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <ul className="space-y-4">
                                    {course.modulos && course.modulos.map((modulo, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="flex-shrink-0 bg-white dark:bg-gray-700 p-1 rounded-full border border-indigo-100 dark:border-gray-600 shadow-sm mr-4">
                                                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium pt-1">{modulo}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Lessons List (Conteúdo do Curso) */}
                        {course.aulas && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-700 pb-2 relative">
                                    {t('courseDetails.content')}
                                    <span className="absolute bottom-0 left-0 w-20 h-1 bg-indigo-600 rounded"></span>
                                </h2>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                                    {course.aulas.map((aula, index) => (
                                        <Link
                                            to={`/curso/${slug}/aula/${index}`}
                                            key={index}
                                            className={`flex justify-between items-center p-4 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800`}
                                        >
                                            <div className="flex items-center">
                                                <div className="mr-4 text-green-500">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                                <span className="font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    {index + 1}. {getContent(aula.titulo)}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                {getContent(aula.duracao)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 sticky top-24">
                            <div className="mb-6 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                                <img src={course.image} alt={getContent(course.title)} className="w-full object-cover h-48" />
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-500 dark:text-gray-400">{t('courseDetails.duration')}</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{course.duration}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-500 dark:text-gray-400">{t('courseDetails.level')}</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{getContent(course.level)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-500 dark:text-gray-400">{t('courseDetails.category')}</span>
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{course.category}</span>
                                </div>
                            </div>

                            <Link
                                to={`/curso/${slug}/aula/0`}
                                className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all transform hover:-translate-y-1 shadow-lg shadow-indigo-200 dark:shadow-none block text-center"
                            >
                                {t('courseDetails.start')}
                            </Link>



                            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                                {t('courseDetails.access')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CourseDetails;
