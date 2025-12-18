import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, BookOpen, Code, Lightbulb } from 'lucide-react';
import coursesData from '../data/cursos.json';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';

const LessonView = () => {
    const { slug, id } = useParams();
    const { user } = useAuth();
    const { language } = useTranslation();
    const currentLang = language || 'pt'; // 'pt', 'en', 'es', etc.

    // Helper to get content based on language
    const getContent = (data) => {
        if (!data) return "";
        if (typeof data === 'string') return data;

        // Handle variations like 'pt-BR' -> 'pt'
        const langCode = currentLang.split('-')[0].toLowerCase();

        return data[langCode] || data['pt'] || data['en'] || Object.values(data)[0];
    };

    const course = coursesData.find(c => c.slug === slug);
    const lessonIndex = parseInt(id);

    if (!course || !course.aulas || !course.aulas[lessonIndex]) {
        return <div className="text-center mt-20 text-gray-500">Aula não encontrada.</div>;
    }

    const lesson = course.aulas[lessonIndex];
    const totalLessons = course.aulas.length;

    return (
        <main className="flex-grow pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header / Navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to={`/curso/${slug}`}
                        className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar ao Curso
                    </Link>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Aula {lessonIndex + 1} de {totalLessons}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Content Section */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Title & Intro */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{getContent(lesson.titulo)}</h1>
                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-6">
                                <BookOpen className="w-4 h-4 mr-2" />
                                <span>{getContent(lesson.duracao)}</span>
                            </div>
                        </div>

                        {/* Main Content (Markdown) */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm prose dark:prose-invert max-w-none">
                            <ReactMarkdown>{getContent(lesson.content)}</ReactMarkdown>
                        </div>

                        {/* Practical Challenge Section */}
                        {lesson.exercise && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center">
                                    <Code className="w-6 h-6 mr-2" />
                                    Desafio Prático
                                </h3>
                                <p className="text-indigo-800 dark:text-indigo-200 mb-4">
                                    {getContent(lesson.exercise.instructions)}
                                </p>

                                <div className="mb-4">
                                    <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center justify-between">
                                        <span className="text-xs text-gray-400 font-mono">Exemplo de Código</span>
                                    </div>
                                    <div className="bg-gray-800 p-4 rounded-b-lg overflow-x-auto">
                                        <pre className="text-sm font-mono text-green-400">
                                            {lesson.exercise.code}
                                        </pre>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-gray-700">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                                        Dica / Solução
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        {getContent(lesson.exercise.solution)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Prev/Next Navigation */}
                        <div className="flex justify-between pt-4">
                            <Link
                                to={lessonIndex > 0 ? `/curso/${slug}/aula/${lessonIndex - 1}` : '#'}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${lessonIndex > 0
                                    ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed hidden'}`}
                            >
                                &larr; Aula Anterior
                            </Link>

                            <Link
                                to={lessonIndex < totalLessons - 1 ? `/curso/${slug}/aula/${lessonIndex + 1}` : `/curso/${slug}`}
                                className="px-6 py-3 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                {lessonIndex < totalLessons - 1 ? 'Próxima Aula \u2192' : 'Concluir Curso \u2713'}
                            </Link>
                        </div>
                    </div>

                    {/* Playlist Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-900 dark:text-white">Conteúdo do Curso</h3>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto">
                                {course.aulas.map((a, idx) => (
                                    <Link
                                        key={idx}
                                        to={`/curso/${slug}/aula/${idx}`}
                                        className={`flex items-center p-4 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${idx === lessonIndex ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500' : ''}`}
                                    >
                                        <div className={`mr-3 ${a.status === 'completa' ? 'text-green-500' : 'text-gray-400'}`}>
                                            {idx === lessonIndex ? (
                                                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${idx === lessonIndex ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {idx + 1}. {getContent(a.titulo)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{getContent(a.duracao)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Watermark */}
            {user && (
                <div className="fixed bottom-4 right-4 pointer-events-none z-50 opacity-20 select-none">
                    <p className="text-xs text-gray-500 font-mono">{user.email} - {user.id}</p>
                </div>
            )}
        </main>
    );
};

export default LessonView;
