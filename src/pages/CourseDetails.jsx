import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, BarChart, BookOpen, CheckCircle, PlayCircle, ArrowLeft, User, Globe, Award, Lock, Star, Shield } from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PixModal from '../components/PixModal';
import ReviewList from '../components/ReviewList';

const CourseDetails = () => {
    const { slug } = useParams();
    const { language, t } = useTranslation();
    const currentLang = language || 'pt';
    const { isAuthenticated, user, fetchProgress, isLessonCompleted, completedLessons } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [pixData, setPixData] = useState(null); 

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await api.getCourse(slug);
                setCourse(data);
            } catch (error) {
                console.error("Error loading course:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [slug]);

    
    useEffect(() => {
        if (course && isAuthenticated) {
            const id = course.id || course._id;
            console.log("[CourseDetails] Fetching progress for:", id);
            fetchProgress(id);
        } else {
            console.log("[CourseDetails] Skipping progress fetch. Auth:", isAuthenticated, "Course:", !!course);
        }
    }, [course, isAuthenticated]);

    
    if (course) {
        const id = course.id || course._id;
        console.log(`[CourseDetails Render] Course ID: ${id} `);
        
        
    }

    
    const getContent = (data) => {
        if (!data) return "";
        if (typeof data === 'string') return data;
        const langCode = currentLang.split('-')[0].toLowerCase();
        return data[langCode] || data['pt'] || data['en'] || Object.values(data)[0];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <main className="flex-grow flex flex-col items-center justify-center pt-20 bg-gray-50 dark:bg-gray-900 h-screen">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('courses.noCourses')}</h2>
                <Link to="/cursos" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    {t('courseDetails.back')}
                </Link>
            </main>
        );
    }

    return (
        <main className="flex-grow pt-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {}
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
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">{getContent(course.title)}</h1>
                            <p className="text-indigo-200 text-lg mb-6">Criado por: <span className="font-semibold text-white">{course.authorName}</span></p>

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
                                    <Globe className="h-5 w-5 mr-2 text-indigo-400" />
                                    <span className="uppercase tracking-wider font-bold">{course.language || 'PT'}</span>
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

            {}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {}
                    <div className="lg:col-span-2">
                        {}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b dark:border-gray-700 pb-2 relative">
                                {t('courseDetails.about')}
                                <span className="absolute bottom-0 left-0 w-20 h-1 bg-indigo-600 rounded"></span>
                            </h2>
                            <div className="prose prose-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p>{getContent(course.descricaoCompleta)}</p>
                            </div>
                        </div>

                        {}
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
                                            <span className="text-gray-700 dark:text-gray-300 font-medium pt-1">
                                                {typeof modulo === 'object' ? getContent(modulo) : modulo}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {}
                        {course.aulas && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-700 pb-2 relative">
                                    {t('courseDetails.content')}
                                    <span className="absolute bottom-0 left-0 w-20 h-1 bg-indigo-600 rounded"></span>
                                </h2>

                                {}
                                {course.modulos && course.modulos.length > 0 && typeof course.modulos[0] === 'object' ? (
                                    <div className="space-y-6">
                                        {(() => {
                                            let globalLessonIndex = 0;
                                            return course.modulos.map((modulo, modIndex) => (
                                                <div key={modIndex} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-200 flex items-center">
                                                        <BookOpen className="w-5 h-5 mr-3 text-indigo-600" />
                                                        {getContent(modulo.title)}
                                                        <span className="ml-auto text-xs text-gray-400 font-normal">
                                                            {modulo.items ? modulo.items.length : 0} aulas
                                                        </span>
                                                    </div>
                                                    <div>
                                                        {modulo.items && modulo.items.map((item, itemIndex) => {
                                                            const currentIndex = globalLessonIndex++;
                                                            const title = getContent(item.titulo);
                                                            if (!title && !item.titulo) return null; 

                                                            return (
                                                                <Link
                                                                    to={`/curso/${slug}/aula/${currentIndex}`}
                                                                    key={itemIndex}
                                                                    className="flex justify-between items-center p-4 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                                >
                                                                    <div className="flex items-center">
                                                                        <div className="mr-4">
                                                                            {isLessonCompleted(course._id || course.id, currentIndex) ? (
                                                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                                            ) : (
                                                                                <CheckCircle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                                                            )}
                                                                        </div>
                                                                        <span className="font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                                            {currentIndex + 1}. {title || "Aula sem título"}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                                        {getContent(item.duracao)}
                                                                    </span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                ) : (
                                    
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
                                )}
                            </div>
                        )}

                        {}
                        <ReviewList courseId={course.id || course._id} />
                    </div>

                    {}
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

                            {(() => {
                                
                                let nextIndex = 0;
                                let extractedLessons = [];
                                if (course.aulas && course.aulas.length > 0) {
                                    extractedLessons = course.aulas;
                                } else if (course.modulos && course.modulos.length > 0 && typeof course.modulos[0] === 'object') {
                                    extractedLessons = course.modulos.reduce((acc, mod) => [...acc, ...(mod.items || [])], []);
                                }

                                const total = extractedLessons.length;
                                
                                const firstUncompleted = extractedLessons.findIndex((_, idx) => !isLessonCompleted(course._id || course.id, idx));
                                nextIndex = firstUncompleted === -1 ? 0 : firstUncompleted;
                                const isStarted = firstUncompleted !== 0; 
                                
                                const hasProgress = extractedLessons.some((_, idx) => isLessonCompleted(course._id || course.id, idx));

                                const isFinished = firstUncompleted === -1 && total > 0;

                                
                                const courseId = course._id || course.id;
                                const isOwner = user && (user.role === 'admin' || user.id === course.authorId);
                                const isPurchased = user && user.purchasedCourses && user.purchasedCourses.includes(courseId);
                                const isFree = !course.price || course.price === 0;
                                const hasAccess = isOwner || isPurchased || isFree;

                                const handleBuy = async () => {
                                    setPurchasing(true);
                                    try {
                                        
                                        const response = await api.createPreference(courseId);
                                        if (response.mode === 'pix_direct') {
                                            setPixData({ ...response, courseId });
                                        } else if (response.init_point) {
                                            
                                            window.location.href = response.init_point;
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        alert("Erro ao iniciar pagamento. Verifique se o Admin configurou a Chave Pix.");
                                    } finally {
                                        setPurchasing(false);
                                    }
                                };

                                if (!hasAccess) {
                                    return (
                                        <button
                                            onClick={handleBuy}
                                            disabled={purchasing}
                                            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all transform hover:-translate-y-1 shadow-lg block text-center flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {purchasing ? 'Iniciando...' : `Comprar por R$ ${course.price?.toFixed(2)} `}
                                        </button>
                                    );
                                }

                                return (
                                    <>
                                        {isFinished ? (
                                            <div className="space-y-3">
                                                <Link
                                                    to={`/certificado/${slug}`}
                                                    className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all transform hover:-translate-y-1 shadow-lg block text-center flex items-center justify-center gap-2"
                                                >
                                                    <Award className="w-6 h-6" />
                                                    {language === 'en' ? 'View Certificate' : 'Ver Certificado'}
                                                </Link>
                                                <Link
                                                    to={`/curso/${slug}/aula/0`}
                                                    className="w-full bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border-2 border-indigo-600 dark:border-indigo-500 py-3 rounded-lg font-bold hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors block text-center"
                                                >
                                                    {language === 'en' ? 'Review Course' : 'Revisar Curso'}
                                                </Link>
                                            </div>
                                        ) : (
                                            <Link
                                                to={`/curso/${slug}/aula/${nextIndex}`}
                                                className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all transform hover:-translate-y-1 shadow-lg shadow-indigo-200 dark:shadow-none block text-center"
                                            >
                                                {hasProgress
                                                    ? (language === 'en' ? 'Continue Course' : 'Continuar Curso')
                                                    : t('courseDetails.start')
                                                }
                                            </Link>
                                        )}
                                    </>
                                );
                            })()}



                            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                                {t('courseDetails.access')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <PixModal
                isOpen={!!pixData}
                data={pixData}
                onClose={() => setPixData(null)}
                onConfirm={() => {
                    setPixData(null);
                    
                    window.location.reload();
                }}
            />
        </main >
    );
};

export default CourseDetails;
