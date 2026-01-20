import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, BookOpen, Code, Lightbulb, Lock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import { LessonQuiz } from '../components/LessonQuiz';
import AITutor from '../components/AITutor';


const slugify = (text) => {
    try {
        if (!text) return '';
        return String(text)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    } catch (e) {
        return 'header';
    }
};

const MarkdownComponents = {
    h1: ({ children }) => <h1 id={slugify(children)} className="text-3xl font-bold mb-4 mt-8 scroll-mt-24">{children}</h1>,
    h2: ({ children }) => <h2 id={slugify(children)} className="text-2xl font-bold mb-3 mt-6 scroll-mt-24 border-b pb-2 dark:border-gray-700">{children}</h2>,
    h3: ({ children }) => <h3 id={slugify(children)} className="text-xl font-bold mb-2 mt-4 scroll-mt-24 text-indigo-600 dark:text-indigo-400">{children}</h3>,
};

const LessonView = () => {

    const { slug, id } = useParams();
    const { user, isAuthenticated, markLessonComplete, isLessonCompleted, fetchProgress } = useAuth();
    const { language } = useTranslation();
    const currentLang = language || 'pt';


    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [challengeAnswer, setChallengeAnswer] = useState('');
    const [aiFeedback, setAiFeedback] = useState(null);
    const [isAnalysing, setIsAnalysing] = useState(false);
    const [toc, setTocState] = useState([]);


    useEffect(() => {
        const loadCourse = async () => {
            try {
                setLoading(true);
                const data = await api.getCourse(slug);
                setCourse(data);
            } catch (error) {
                console.error("Failed to load course:", error);
            } finally {
                setLoading(false);
            }
        };
        loadCourse();
    }, [slug]);


    useEffect(() => {
        if (course && isAuthenticated) {
            fetchProgress(course.id || course._id);
        }
    }, [course, isAuthenticated]);


    useEffect(() => {
        setChallengeAnswer('');
        setAiFeedback(null);
        setIsAnalysing(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [slug, id]);


    const getContent = (data) => {
        if (!data) return "";
        if (typeof data === 'string') return data;
        const langCode = currentLang.split('-')[0].toLowerCase();
        return data[langCode] || data['pt'] || data['en'] || Object.values(data)[0] || "";
    };


    const allLessons = useMemo(() => {
        if (!course) return [];
        let extracted = [];

        if (course.aulas && course.aulas.length > 0) {
            extracted = course.aulas;
        } else if (course.modulos && course.modulos.length > 0) {
            if (typeof course.modulos[0] === 'object' && course.modulos[0].items) {
                extracted = course.modulos.reduce((acc, mod) => {
                    return [...acc, ...(mod.items || [])];
                }, []);
            }
        }

        return extracted.map((l, i) => ({
            ...l,
            originalIndex: i,
            titulo: l.titulo || l.title || `Aula ${i + 1}`,
            duracao: l.duracao || l.duration,
            content: l.content || '',
            questions: l.questions || [],
            challenge: l.challenge || null
        }));
    }, [course]);


    const lessonIndex = parseInt(id) || 0;
    const lesson = allLessons[lessonIndex];
    const totalLessons = allLessons.length;
    const courseId = course ? (course._id || course.id) : null;


    useEffect(() => {
        if (!lesson || !lesson.content) {
            setTocState([]);
            return;
        }
        const contentStr = getContent(lesson.content);
        if (!contentStr) return;

        const lines = contentStr.split('\n');
        const extracted = lines
            .filter(line => line.startsWith('#'))
            .map(line => {
                const match = line.match(/^#+/);
                if (!match) return null;
                const level = match[0].length;
                const text = line.replace(/^#+\s+/, '').trim();
                const id = slugify(text);
                return { id, text, level };
            }).filter(Boolean);

        setTocState(extracted);
    }, [lesson, currentLang]);



    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-indigo-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 font-medium animate-pulse">Carregando aula...</p>
            </div>
        );
    }


    if (!course || !lesson) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
                <p className="mb-4 text-xl">Aula não encontrada.</p>
                <Link to={`/curso/${slug}`} className="text-indigo-600 hover:underline">Voltar para o detalhe do curso</Link>
            </div>
        );
    }


    const isLocked = lessonIndex > 0 && !isLessonCompleted(courseId, lessonIndex - 1);

    if (isLocked) {
        return (
            <main className="flex-grow pt-16 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-md">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Lock className="w-8 h-8" />
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


    const completed = isLessonCompleted(courseId, lessonIndex);
    const handleQuizPass = () => markLessonComplete(courseId, lessonIndex);
    const handleManualComplete = () => markLessonComplete(courseId, lessonIndex);


    const handleChallengeSubmit = async () => {
        if (challengeAnswer.trim().length > 10) {
            setIsAnalysing(true);
            setAiFeedback(null);
            try {
                const result = await api.correctChallenge({
                    instruction: getContent(lesson.challenge.instruction),
                    userAnswer: challengeAnswer,
                    language: currentLang
                });

                setAiFeedback({
                    isCorrect: result.isCorrect,
                    feedback: result.feedback
                });

                if (result.isCorrect) {
                    markLessonComplete(courseId, lessonIndex);
                }
            } catch (error) {
                console.error(error);
                setAiFeedback({ feedback: "Erro ao conectar com servidor de correção.", isCorrect: false });
            } finally {
                setIsAnalysing(false);
            }
        }
    };


    return (
        <main className="flex-grow pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                { }
                {/* Course Progress Bar */}
                <div className="mb-8 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.round(((lessonIndex + (completed ? 1 : 0)) / totalLessons) * 100)}%` }}
                    ></div>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <Link to={`/curso/${slug}`} className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />Voltar ao Curso
                    </Link>
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        Aula {lessonIndex + 1} de {totalLessons}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    { }
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
                                        <Code className="w-3 h-3 mr-1" />Desafio Prático
                                    </span>
                                )}
                            </div>
                        </div>

                        { }
                        { }
                        {lesson.content && getContent(lesson.content) ? (
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm prose dark:prose-invert max-w-none">
                                <ReactMarkdown components={MarkdownComponents}>
                                    {getContent(lesson.content)}
                                </ReactMarkdown>
                            </div>
                        ) : null}

                        { }
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
                                    <p className="mb-4 text-gray-700 dark:text-gray-300 italic">{getContent(lesson.challenge.instruction)}</p>
                                    <div className="relative">
                                        <textarea
                                            className="w-full h-48 p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 font-mono text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow"
                                            placeholder={language === 'en' ? "// Code here..." : "// Escreva sua resposta..."}
                                            value={challengeAnswer}
                                            onChange={(e) => setChallengeAnswer(e.target.value)}
                                        />
                                        <div className="absolute bottom-4 right-4 text-xs text-gray-400">{challengeAnswer.length} chars</div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        {aiFeedback && (
                                            <div className={`flex-1 mr-4 p-3 rounded-lg text-sm ${aiFeedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                <strong>{aiFeedback.isCorrect ? 'Sucesso!' : 'Atenção:'}</strong> {aiFeedback.feedback}
                                            </div>
                                        )}
                                        <button onClick={handleChallengeSubmit} disabled={challengeAnswer.trim().length < 10 || isAnalysing} className={`px-6 py-2 text-white rounded-lg font-bold shadow-md transition-all flex items-center ${isAnalysing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50'}`}>
                                            {isAnalysing ? 'Analisando...' : (language === 'en' ? 'Submit' : 'Enviar Solução')}
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            !completed && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center">
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4">{getContent({ pt: "Conteúdo Estudado?", en: "Content Studied?" })}</h3>
                                    <button onClick={handleManualComplete} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105">
                                        {getContent({ pt: "Marcar como Concluída", en: "Mark as Complete" })}
                                    </button>
                                </div>
                            )
                        )}

                        {completed && (
                            <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-center gap-3 animate-fade-in">
                                <CheckCircle className="text-green-600 dark:text-green-400 w-6 h-6" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-green-800 dark:text-green-300">Aula Concluída!</h4>
                                    <p className="text-green-700 dark:text-green-400 text-sm">Você finalizou esta aula.</p>
                                </div>
                            </div>
                        )}

                        { }
                        <div className="flex justify-between pt-4">
                            <Link to={lessonIndex > 0 ? `/curso/${slug}/aula/${lessonIndex - 1}` : '#'} className={`px-6 py-3 rounded-lg font-medium transition-colors ${lessonIndex > 0 ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700' : 'hidden'}`}>&larr; Aula Anterior</Link>

                            {completed ? (
                                lessonIndex < totalLessons - 1 ? (
                                    <Link to={`/curso/${slug}/aula/${lessonIndex + 1}`} className="px-6 py-3 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">{language === 'en' ? 'Next Lesson \u2192' : 'Próxima Aula \u2192'}</Link>
                                ) : (course.quiz && course.quiz.length > 0) ? (
                                    <Link to={`/curso/${slug}/prova`} className="px-6 py-3 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">{language === 'en' ? 'Final Exam' : 'Fazer Prova Final'}</Link>
                                ) : (
                                    <Link to={`/curso/${slug}`} className="px-6 py-3 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none">{language === 'en' ? 'Finish Course' : 'Concluir Curso'}</Link>
                                )
                            ) : (
                                <button disabled className="px-6 py-3 rounded-lg font-medium bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed">{language === 'en' ? 'Complete to Advance' : 'Conclua para Avançar'}</button>
                            )}
                        </div>
                    </div>

                    { }
                    <div className="lg:col-span-1 space-y-6">
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
                                            <a key={idx} href={`#${item.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); }} className={`text-sm transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${item.level === 1 ? 'font-bold' : 'ml-4 text-gray-500'}`}>
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
                                {allLessons.map((a, idx) => {
                                    const isItemLocked = idx > 0 && !isLessonCompleted(courseId, idx - 1);
                                    const isItemCompleted = isLessonCompleted(courseId, idx);
                                    const title = getContent(a.titulo);

                                    return (
                                        <Link key={idx} to={!isItemLocked ? `/curso/${slug}/aula/${idx}` : '#'} className={`flex items-center p-4 border-b dark:border-gray-700 last:border-b-0 transition-colors ${idx === lessonIndex ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500' : isItemLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                            <div className={`mr-3 ${isItemCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                                                {isItemLocked ? <Lock className="w-4 h-4" /> : isItemCompleted ? <CheckCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${idx === lessonIndex ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{idx + 1}. {title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{getContent(a.duracao)}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AITutor context={`Aula: ${getContent(lesson.titulo)}\n\nConteúdo:\n${getContent(lesson.content)}`} />
        </main >
    );
};

export default LessonView;
