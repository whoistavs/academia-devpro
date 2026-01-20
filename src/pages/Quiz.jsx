import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, Award } from 'lucide-react';
import { api } from '../services/api'; // Changed to dynamic API
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Quiz = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { language, t } = useTranslation();
    const { isAuthenticated, user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);

    // --- Localization ---
    const localStrings = {
        title: { pt: 'Prova Final', en: 'Final Exam', es: 'Examen Final' },
        submit: { pt: 'Enviar Respostas', en: 'Submit Answers', es: 'Enviar Respuestas' },
        pass: { pt: 'Parabéns! Você foi aprovado!', en: 'Congratulations! You passed!', es: '¡Felicidades! ¡Aprobaste!' },
        fail: { pt: 'Não foi dessa vez. Tente novamente.', en: 'Not this time. Try again.', es: 'No esta vez. Inténtalo de nuevo.' },
        score: { pt: 'Sua nota:', en: 'Your score:', es: 'Tu puntuación:' },
        back: { pt: 'Voltar ao Curso', en: 'Back to Course', es: 'Volver al Curso' },
    };

    const currentLang = language || 'pt';
    const langCode = currentLang.split('-')[0].toLowerCase();
    const getString = (key) => localStrings[key][langCode] || localStrings[key]['pt'];

    const getContent = (data) => {
        if (!data) return "";
        if (typeof data === 'string') return data;
        return data[langCode] || data['pt'] || data['en'] || Object.values(data)[0];
    };
    // --------------------

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadData = async () => {
            try {
                const courseData = await api.getCourse(slug);
                if (!courseData) throw new Error("Course not found");
                setCourse(courseData);

                // --- Extract Questions Logic ---
                let foundQuestions = [];

                // 1. Legacy Check
                if (courseData.quiz && courseData.quiz.length > 0) {
                    foundQuestions = courseData.quiz;
                }
                // 2. Dynamic Modules Check (Editor Created)
                else if (courseData.modulos && courseData.modulos.length > 0) {
                    for (const mod of courseData.modulos) {
                        if (mod.items) {
                            const quizItem = mod.items.find(i => i.type === 'quiz' && i.questions && i.questions.length > 0);
                            if (quizItem) {
                                foundQuestions = quizItem.questions;
                                break; // Take the first quiz found
                            }
                        }
                    }
                }

                if (foundQuestions.length > 0) {
                    processQuiz(foundQuestions);
                }

            } catch (err) {
                console.error("Error loading quiz:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [slug, isAuthenticated]);

    const processQuiz = (rawQuestions) => {
        // Shuffle questions and options
        const shuffle = (array) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        };

        const processed = rawQuestions.map((q, idx) => {
            const qText = typeof q.question === 'object' ? getContent(q.question) : q.question;
            // Fix: Use getContent to get the specific language array, identical to how we get question text
            const optsRaw = typeof q.options === 'object' && !Array.isArray(q.options) ? getContent(q.options) : q.options;
            // Ensure options is array
            const optsArray = Array.isArray(optsRaw) ? optsRaw : [];

            // Map options to objects to track original index
            const optionsWithIndex = optsArray.map((opt, optIdx) => ({
                text: opt,
                originalIndex: optIdx
            }));

            // Shuffle options
            const shuffledOptions = shuffle(optionsWithIndex);

            // Find where the correct answer ended up
            // q.answer is the original index (0-3 usually)
            const newAnswerIndex = shuffledOptions.findIndex(item => item.originalIndex === Number(q.answer));

            return {
                id: q.id || `q-${idx}`,
                question: qText,
                options: shuffledOptions.map(o => o.text),
                answer: newAnswerIndex
            };
        });

        setQuizQuestions(shuffle(processed));
    };


    const handleOptionSelect = (questionId, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const calculateScore = async () => {
        let correctCount = 0;
        quizQuestions.forEach(q => {
            if (answers[q.id] === q.answer) {
                correctCount++;
            }
        });

        const percentage = Math.round((correctCount / quizQuestions.length) * 100);
        const passed = percentage >= 70;

        setResult({
            score: percentage,
            passed,
            correctCount,
            total: quizQuestions.length
        });

        if (passed && isAuthenticated && course) {
            try {
                // Determine course ID (could be _id or id)
                const cId = course._id || course.id;
                await api.updateProgress({
                    courseId: cId,
                    lessonId: 'final_exam',
                    progress: percentage
                });
            } catch (error) {
                console.error("Failed to save quiz score:", error);
            }
        }
        window.scrollTo(0, 0);
    };

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!course || quizQuestions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <h2 className="text-2xl font-bold mb-4">Quiz não encontrado / Quiz not found</h2>
                <p className="mb-6">Este curso ainda não possui uma prova final cadastrada.</p>
                <Link to={`/curso/${slug}`} className="text-indigo-600 hover:text-indigo-800 font-medium">Voltar ao Curso</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4 transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                <Link to={`/curso/${slug}`} className="inline-flex items-center text-gray-600 dark:text-gray-400 mb-6 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {getString('back')}
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <div className="text-center mb-10">
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                            {getString('title')}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{getContent(course.title)}</h1>
                    </div>

                    {result ? (
                        <div className={`text-center p-8 rounded-xl mb-8 ${result.passed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border`}>
                            {result.passed ? (
                                <Award className="w-16 h-16 mx-auto text-green-500 mb-4" />
                            ) : (
                                <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                            )}

                            <h2 className={`text-2xl font-bold mb-2 ${result.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                {result.passed ? getString('pass') : getString('fail')}
                            </h2>
                            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
                                {getString('score')} {result.score}% ({result.correctCount}/{result.total})
                            </p>

                            {!result.passed && (
                                <button
                                    onClick={() => setResult(null)}
                                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                                >
                                    Tentar Novamente
                                </button>
                            )}
                            {result.passed && (
                                <div className="flex flex-col gap-3 items-center">
                                    <Link
                                        to={`/certificado/${slug}`}
                                        className="mt-6 inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
                                    >
                                        <Award className="w-6 h-6 mr-2" />
                                        Resgatar Certificado
                                    </Link>
                                    <Link
                                        to="/dashboard"
                                        className="text-indigo-600 hover:underline font-medium"
                                    >
                                        Voltar ao Dashboard
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {quizQuestions.map((q, index) => (
                                <div key={q.id} className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {index + 1}. {q.question}
                                    </h3>
                                    <div className="space-y-3">
                                        {q.options.map((opt, optIndex) => (
                                            <label
                                                key={optIndex}
                                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${answers[q.id] === optIndex
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                                                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${q.id}`}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                    checked={answers[q.id] === optIndex}
                                                    onChange={() => handleOptionSelect(q.id, optIndex)}
                                                />
                                                <span className="ml-3 text-gray-700 dark:text-gray-300">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={calculateScore}
                                disabled={Object.keys(answers).length < quizQuestions.length}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${Object.keys(answers).length < quizQuestions.length
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30'
                                    }`}
                            >
                                {getString('submit')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quiz;
