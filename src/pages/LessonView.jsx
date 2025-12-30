import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, BookOpen, Code, Lightbulb } from 'lucide-react';
import coursesData from '../data/cursos.json';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';

import { LessonQuiz } from '../components/LessonQuiz';
import CommentsSection from '../components/CommentsSection';

const LessonView = () => {
    const { slug, id } = useParams();
    const { user, isAuthenticated, markLessonComplete, isLessonCompleted, fetchProgress } = useAuth();
    const [challengeAnswer, setChallengeAnswer] = useState('');
    const [aiFeedback, setAiFeedback] = useState(null);
    const [isAnalysing, setIsAnalysing] = useState(false);

    // Reset state when lesson changes
    useEffect(() => {
        setChallengeAnswer('');
        setAiFeedback(null);
        setIsAnalysing(false);
    }, [slug, id]);

    const course = coursesData.find(c => c.slug === slug);

    useEffect(() => {
        if (course && isAuthenticated) {
            fetchProgress(course.id);
        }
    }, [course?.id, isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    const { language } = useTranslation();
    const currentLang = language || 'pt';



    const getContent = (data) => {
        if (!data) return "";
        if (typeof data === 'string') return data;
        const langCode = currentLang.split('-')[0].toLowerCase();
        return data[langCode] || data['pt'] || data['en'] || Object.values(data)[0];
    };

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD') // Separate accents
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const MarkdownComponents = {
        h1: ({ children }) => <h1 id={slugify(children)} className="text-3xl font-bold mb-4 mt-8 scroll-mt-24">{children}</h1>,
        h2: ({ children }) => <h2 id={slugify(children)} className="text-2xl font-bold mb-3 mt-6 scroll-mt-24 border-b pb-2 dark:border-gray-700">{children}</h2>,
        h3: ({ children }) => <h3 id={slugify(children)} className="text-xl font-bold mb-2 mt-4 scroll-mt-24 text-indigo-600 dark:text-indigo-400">{children}</h3>,
    };

    const [toc, setTocState] = useState([]);
    const lessonIndex = parseInt(id);

    // Scroll to top when lesson changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [slug, id]);

    if (!course || !course.aulas || !course.aulas[lessonIndex]) {
        return <div className="text-center mt-20 text-gray-500">Aula não encontrada.</div>;
    }

    const lesson = course.aulas[lessonIndex];
    const totalLessons = course.aulas.length;

    useEffect(() => {
        if (!lesson || !lesson.content) return;

        const content = getContent(lesson.content);
        const lines = content.split('\n');
        const extracted = lines
            .filter(line => line.startsWith('#'))
            .map(line => {
                const level = line.match(/^#+/)[0].length;
                const text = line.replace(/^#+\s+/, '');
                const id = slugify(text);
                return { id, text, level };
            });

        setTocState(extracted);
    }, [lesson, language]);

    const isLocked = lessonIndex > 0 && !isLessonCompleted(course.id, lessonIndex - 1);

    if (isLocked) {
        return (
            <main className="flex-grow pt-16 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-md">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aula Bloqueada</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Você precisa concluir a aula anterior para acessar este conteúdo.
                    </p>
                    <Link
                        to={`/curso/${slug}/aula/${lessonIndex - 1}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Voltar para Aula Anterior
                    </Link>
                </div>
            </main>
        );
    }

    const completed = isLessonCompleted(course.id, lessonIndex);

    const handleQuizPass = () => {
        markLessonComplete(course.id, lessonIndex);
    };

    const handleManualComplete = () => {
        markLessonComplete(course.id, lessonIndex);
    };

    const handleChallengeSubmit = async () => {
        if (challengeAnswer.trim().length > 10) {
            setIsAnalysing(true);
            setAiFeedback(null);

            try {
                // Call Mock AI Endpoint
                // We need to import api service dynamically or assume it's available.
                // Better to import at top, but for safety in this snippet:
                const { api } = await import('../services/api');

                // We don't have this method in api.js yet, so we'll fetch directly or add it.
                // Let's add it to api.js in a moment. For now, fetch.
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

                const res = await fetch(`${API_URL}/api/ai/evaluate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        lessonId: lessonIndex,
                        challengeId: lesson.challenge.id,
                        userResponse: challengeAnswer
                    })
                });

                const data = await res.json();
                setAiFeedback(data);

                if (data.isCorrect) {
                    markLessonComplete(course.id, lessonIndex);
                }

            } catch (error) {
                console.error("AI Error:", error);
                setAiFeedback({ feedback: "Erro ao conectar com a IA. Tente novamente.", isCorrect: false });
            } finally {
                setIsAnalysing(false);
            }
        }
    };

    return (
        <main className="flex-grow pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
                    <div className="lg:col-span-2 space-y-8">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                {getContent(lesson.titulo)}
                                {completed && <CheckCircle className="text-green-500 w-6 h-6" />}
                            </h1>
                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-6">
                                <BookOpen className="w-4 h-4 mr-2" />
                                <span>{getContent(lesson.duracao)}</span>
                                {lesson.challenge && (
                                    <span className="ml-4 flex items-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                        <Code className="w-3 h-3 mr-1" />
                                        Desafio Prático
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm prose dark:prose-invert max-w-none">
                            <ReactMarkdown components={MarkdownComponents}>
                                {getContent(lesson.content)}
                            </ReactMarkdown>
                        </div>

                        {/* Logic: Quiz OR Challenge OR Manual Complete */}
                        {lesson.questions && lesson.questions.length > 0 ? (
                            !completed && (
                                <LessonQuiz
                                    questions={lesson.questions}
                                    onPass={handleQuizPass}
                                    language={currentLang}
                                />
                            )
                        ) : lesson.challenge ? (
                            !completed && (
                                <div className="mt-8 bg-indigo-50 dark:bg-gray-800 p-6 rounded-xl border border-indigo-100 dark:border-gray-700 shadow-sm animate-fade-in">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                                        <Lightbulb className="w-6 h-6 text-amber-500" />
                                        {language === 'en' ? 'Practical Challenge' : 'Desafio Prático'}
                                    </h3>
                                    <p className="mb-4 text-gray-700 dark:text-gray-300 italic">
                                        {getContent(lesson.challenge.instruction)}
                                    </p>

                                    <div className="relative">
                                        <textarea
                                            className="w-full h-48 p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 font-mono text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow"
                                            placeholder={language === 'en' ? "// Write your logic/pseudocode here..." : "// Escreva sua lógica/pseudocódigo aqui..."}
                                            value={challengeAnswer}
                                            onChange={(e) => setChallengeAnswer(e.target.value)}
                                        />
                                        <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                                            {challengeAnswer.length} chars
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between items-center">
                                        {aiFeedback && (
                                            <div className={`flex-1 mr-4 p-3 rounded-lg text-sm ${aiFeedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                <strong>{aiFeedback.isCorrect ? 'Sucesso!' : 'Revisão Necessária:'}</strong> {aiFeedback.feedback}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleChallengeSubmit}
                                            disabled={challengeAnswer.trim().length < 10 || isAnalysing}
                                            className={`px-6 py-2 text-white rounded-lg font-bold shadow-md transition-all flex items-center ${isAnalysing ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400'
                                                }`}
                                        >
                                            {isAnalysing ? (
                                                <>
                                                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                                                    Analisando...
                                                </>
                                            ) : (
                                                <>
                                                    <Code className="w-4 h-4 mr-2" />
                                                    {language === 'en' ? 'Submit Solution' : 'Enviar Solução'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            !completed && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4">
                                        {getContent({ pt: "Conteúdo Estudado?", en: "Content Studied?" })}
                                    </h3>
                                    <button
                                        onClick={handleManualComplete}
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105"
                                    >
                                        {getContent({ pt: "Marcar como Concluída", en: "Mark as Complete" })}
                                    </button>
                                </div>
                            )
                        )}

                        {completed && (
                            <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-center gap-3 animate-fade-in">
                                <CheckCircle className="text-green-600 dark:text-green-400 w-6 h-6" />
                                <div>
                                    <h4 className="font-bold text-green-800 dark:text-green-300">Aula Concluída!</h4>
                                    <p className="text-green-700 dark:text-green-400 text-sm">
                                        {lesson.questions ? 'Você passou no teste.' : 'Você finalizou esta aula.'}
                                    </p>
                                </div>
                            </div>
                        )}


                        <div className="flex justify-between pt-4">
                            <Link
                                to={lessonIndex > 0 ? `/curso/${slug}/aula/${lessonIndex - 1}` : '#'}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${lessonIndex > 0
                                    ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed hidden'}`}
                            >
                                &larr; Aula Anterior
                            </Link>

                            {/* Only show Next button if completed */}
                            {completed ? (
                                <Link
                                    to={lessonIndex < totalLessons - 1 ? `/curso/${slug}/aula/${lessonIndex + 1}` : `/curso/${slug}/prova`}
                                    className="px-6 py-3 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    {lessonIndex < totalLessons - 1 ? 'Próxima Aula \u2192' : 'Fazer Prova Final'}
                                </Link>
                            ) : (
                                <button disabled className="px-6 py-3 rounded-lg font-medium bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed">
                                    {lesson.questions ? 'Conclua o Teste para Avançar' : 'Conclua a Aula para Avançar'}
                                </button>
                            )}
                        </div>

                        <CommentsSection slug={slug} lessonIndex={lessonIndex} />
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        {/* Table of Contents - Only if we have headings */}
                        {toc.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-gray-700">
                                    <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                                        {language === 'en' ? 'On this page' : 'Nesta Aula'}
                                    </h3>
                                </div>
                                <div className="p-4 max-h-[40vh] overflow-y-auto">
                                    <nav className="flex flex-col space-y-2">
                                        {toc.map((item, idx) => (
                                            <a
                                                key={idx}
                                                href={`#${item.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className={`text-sm transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${item.level === 1 ? 'font-bold text-gray-800 dark:text-gray-200' :
                                                    item.level === 2 ? 'ml-3 text-gray-600 dark:text-gray-400' :
                                                        'ml-6 text-gray-500 dark:text-gray-500 italic'
                                                    }`}
                                            >
                                                {item.text}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        )}

                        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden ${toc.length === 0 ? 'sticky top-24' : ''}`}>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-900 dark:text-white">Conteúdo do Curso</h3>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto">
                                {course.aulas.map((a, idx) => {
                                    const isItemLocked = idx > 0 && !isLessonCompleted(course.id, idx - 1);
                                    const isItemCompleted = isLessonCompleted(course.id, idx);

                                    return (
                                        <Link
                                            key={idx}
                                            to={!isItemLocked ? `/curso/${slug}/aula/${idx}` : '#'}
                                            className={`flex items-center p-4 border-b dark:border-gray-700 last:border-0 transition-colors ${idx === lessonIndex
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500'
                                                : isItemLocked
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <div className={`mr-3 ${isItemCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                                                {isItemLocked ? (
                                                    <span className="text-gray-400">🔒</span>
                                                ) : isItemCompleted ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <BookOpen className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${idx === lessonIndex ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {idx + 1}. {getContent(a.titulo)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{getContent(a.duracao)}</p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {user && (
                <div className="fixed bottom-4 right-4 pointer-events-none z-50 opacity-20 select-none">
                    <p className="text-xs text-gray-500 font-mono">{user.email} - {user.id}</p>
                </div>
            )}
        </main>
    );
};

export default LessonView;
