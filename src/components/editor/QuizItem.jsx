import React, { useState } from 'react';
import { FileQuestion, Trash, Plus, CheckCircle, ArrowDown, ArrowUp } from 'lucide-react';

export const QuizItem = ({ quiz, updateQuiz, removeQuiz, moveQuiz, isFirst, isLast, title = "Prova do Módulo" }) => {
    
    
    

    const addQuestion = () => {
        const newQuestions = [...(quiz.questions || []), {
            question: "Nova Pergunta",
            options: ["Opção A", "Opção B", "Opção C", "Opção D"],
            answer: 0
        }];
        updateQuiz('questions', newQuestions);
    };

    const updateQuestion = (qIdx, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIdx][field] = value;
        updateQuiz('questions', newQuestions);
    };

    const updateOption = (qIdx, optIdx, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIdx].options[optIdx] = value;
        updateQuiz('questions', newQuestions);
    };

    const removeQuestion = (qIdx) => {
        const newQuestions = quiz.questions.filter((_, i) => i !== qIdx);
        updateQuiz('questions', newQuestions);
    };

    return (
        <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/10 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileQuestion className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300">{title}</h4>
                </div>
                <div className="flex items-center gap-1">
                    {}
                    <button
                        type="button"
                        onClick={() => moveQuiz(-1)}
                        disabled={isFirst}
                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => moveQuiz(1)}
                        disabled={isLast}
                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={removeQuiz}
                        className="p-1 text-red-500 hover:text-red-700"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {(!quiz.questions || quiz.questions.length === 0) && (
                    <p className="text-sm text-gray-500 italic text-center py-2">Nenhuma questão adicionada.</p>
                )}

                {quiz.questions && quiz.questions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500">Questão {qIdx + 1}</span>
                            <button type="button" onClick={() => removeQuestion(qIdx)} className="text-red-400 hover:text-red-600">
                                <Trash className="w-3 h-3" />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                            className="w-full mb-3 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm p-2 border font-medium"
                            placeholder="Enunciado da pergunta..."
                        />

                        <div className="space-y-2 pl-4 border-l-2 border-indigo-100 dark:border-gray-700">
                            {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`q-${qIdx}-ans`}
                                        checked={q.answer === optIdx}
                                        onChange={() => updateQuestion(qIdx, 'answer', optIdx)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                                        className={`flex-1 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm p-1.5 border ${q.answer === optIdx ? 'text-green-700 font-medium' : ''}`}
                                        placeholder={`Opção ${optIdx + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addQuestion}
                    className="w-full py-2 border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-medium transition-colors"
                >
                    + Adicionar Questão
                </button>
            </div>
        </div>
    );
};
