import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export function LessonQuiz({ questions, onPass, language = 'pt' }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleOptionSelect = (index) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const handleConfirm = () => {
        if (selectedOption === null) return;

        const correct = questions[currentQuestion].correct;
        const isCorrect = selectedOption === correct;

        if (isCorrect) {
            setScore(s => s + 1);
        }

        setIsAnswered(true);
    };

    const handleNext = () => {
        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            // Check if passed (e.g., need 100% or 70%? Let's say 100% for mini-quizzes as they are short)
            if (score + (questions[currentQuestion].correct === selectedOption ? 1 : 0) >= questions.length * 0.7) {
                onPass();
            }
        }
    };

    if (showResult) {
        const total = questions.length;
        const finalScore = score + (questions[questions.length - 1].correct === selectedOption ? 1 : 0); // Hack to account for last q update
        // Actually, logic above in handleNext is better for onPass, let's fix score display
        const passed = finalScore >= total * 0.7;

        return (
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 text-white">
                    {passed ? 'Parabéns! 🎉' : 'Tente Novamente 😕'}
                </h3>
                <p className="text-gray-300 mb-6">
                    Você acertou {finalScore} de {total} questões.
                </p>
                {passed ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                        <CheckCircle /> Aprovado
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setCurrentQuestion(0);
                            setScore(0);
                            setShowResult(false);
                            setSelectedOption(null);
                            setIsAnswered(false);
                        }}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                        Reiniciar Teste
                    </button>
                )}
            </div>
        );
    }

    const question = questions[currentQuestion];
    const questionText = typeof question.text === 'object' ? question.text[language] || question.text['pt'] : question.text;

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 my-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Teste de Conhecimento</h3>
                <span className="text-sm text-gray-400">Questão {currentQuestion + 1} de {questions.length}</span>
            </div>

            <p className="text-lg text-white mb-6">{questionText}</p>

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
                        {currentQuestion + 1 === questions.length ? 'Finalizar' : 'Próxima'} <ArrowRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
