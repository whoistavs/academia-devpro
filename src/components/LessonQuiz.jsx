
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export function LessonQuiz({ questions, onPass, language = 'pt' }) {
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            if (!questions || questions.length === 0) return;

            const shuffle = (array) => {
                const newArr = [...array];
                for (let i = newArr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
                }
                return newArr;
            };

            const processed = questions.map((q, qIndex) => {
                
                if (!q) throw new Error(`Questão ${qIndex} é inválida (null/undefined)`);

                
                const rawText = q.text || q.question || "Questão sem título";
                const qText = typeof rawText === 'object' ? (rawText[language] || rawText['pt'] || Object.values(rawText)[0]) : rawText;

                
                let optsArray = q.options;
                if (optsArray && !Array.isArray(optsArray) && typeof optsArray === 'object') {
                    optsArray = optsArray[language] || optsArray['pt'] || Object.values(optsArray)[0] || [];
                }
                if (!optsArray || !Array.isArray(optsArray)) {
                    console.warn(`Questão ${qIndex} sem opções válidas.`);
                    optsArray = [];
                }

                
                const optionsWithIndex = optsArray.map((opt, idx) => ({ text: opt, originalIndex: idx }));

                
                const shuffledOptions = shuffle(optionsWithIndex);

                
                const correctIndex = q.correct !== undefined ? q.correct : (q.answer !== undefined ? q.answer : -1);

                
                const newCorrect = shuffledOptions.findIndex(o => o.originalIndex === correctIndex);

                return {
                    ...q,
                    text: String(qText), 
                    options: shuffledOptions.map(o => String(o.text)), 
                    correct: newCorrect
                };
            });

            setShuffledQuestions(shuffle(processed));
            setCurrentQuestion(0);
            setScore(0);
            setShowResult(false);
            setSelectedOption(null);
            setIsAnswered(false);
            setError(null);

        } catch (err) {
            console.error("Critical error in LessonQuiz:", err);
            setError(err.message || "Erro desconhecido ao carregar o quiz.");
        }

    }, [questions, language, retryCount]);

    const handleOptionSelect = (index) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const handleConfirm = () => {
        if (selectedOption === null) return;
        if (!shuffledQuestions[currentQuestion]) return;

        const correct = shuffledQuestions[currentQuestion].correct;
        const isCorrect = selectedOption === correct;

        if (isCorrect) {
            setScore(s => s + 1);
        }

        setIsAnswered(true);
    };

    const handleNext = () => {
        if (currentQuestion + 1 < shuffledQuestions.length) {
            setCurrentQuestion(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        setRetryCount(c => c + 1);
    };

    if (error) {
        return (
            <div className="p-6 bg-red-900/20 border border-red-500 rounded text-red-200">
                <h3 className="font-bold mb-2">Erro ao carregar Quiz</h3>
                <p>{error}</p>
                <button onClick={handleRestart} className="mt-4 px-4 py-2 bg-red-700 rounded text-white text-sm">Tentar Novamente</button>
            </div>
        );
    }

    if (shuffledQuestions.length === 0) {
        return <div className="p-8 text-center text-gray-400">Carregando quiz...</div>;
    }

    if (showResult) {
        const total = shuffledQuestions.length;
        const passed = score >= total * 0.7;

        
        if (passed) {
            
            setTimeout(() => onPass(), 0);
        }

        return (
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 text-white">
                    {passed ? 'Parabéns! 🎉' : 'Tente Novamente 😕'}
                </h3>
                <p className="text-gray-300 mb-6">
                    Você acertou {score} de {total} questões.
                </p>
                {passed ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                        <CheckCircle /> Aprovado
                    </div>
                ) : (
                    <button
                        onClick={handleRestart}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                        Reiniciar Teste (Novas Perguntas)
                    </button>
                )}
            </div>
        );
    }

    const question = shuffledQuestions[currentQuestion];
    if (!question) return <div className="text-red-500">Erro: Questão não encontrada.</div>;

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 my-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Teste de Conhecimento</h3>
                <span className="text-sm text-gray-400">Questão {currentQuestion + 1} de {shuffledQuestions.length}</span>
            </div>

            <p className="text-lg text-white mb-6">{question.text}</p>

            <div className="space-y-3 mb-6">
                {question.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${isAnswered
                            ? idx === question.correct
                                ? 'bg-green-900/30 border-green-500 text-green-300'
                                : idx === selectedOption
                                    ? 'bg-red-900/30 border-red-500 text-red-300'
                                    : 'bg-gray-700/50 border-gray-600 text-gray-400'
                            : idx === selectedOption
                                ? 'bg-indigo-900/50 border-indigo-500 text-white'
                                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            <div className="flex justify-end">
                {!isAnswered ? (
                    <button
                        onClick={handleConfirm}
                        disabled={selectedOption === null}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Confirmar
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {currentQuestion + 1 === shuffledQuestions.length ? 'Finalizar' : 'Próxima'} <ArrowRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
