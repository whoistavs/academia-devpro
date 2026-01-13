import React, { useState } from 'react';
import { Plus, Trash, ChevronDown, ChevronUp, BookOpen, Clock } from 'lucide-react';
import { LessonItem } from './LessonItem';
import { QuizItem } from './QuizItem';

export const ModuleCard = ({ module, index, updateModule, removeModule }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const addItem = (type) => {
        const newItem = type === 'quiz'
            ? { type: 'quiz', questions: [] }
            : { type: 'lesson', titulo: { pt: '' }, content: { pt: '' }, duracao: { pt: '' }, video: '' };

        const newItems = [...(module.items || []), newItem];
        updateModule(index, 'items', newItems);
    };

    const updateItem = (itemIdx, field, value) => {
        const newItems = (module.items || []).map((item, i) => {
            if (i === itemIdx) {
                return { ...item, [field]: value };
            }
            return item;
        });
        updateModule(index, 'items', newItems);
    };

    const removeItem = (itemIdx) => {
        const newItems = module.items.filter((_, i) => i !== itemIdx);
        updateModule(index, 'items', newItems);
    };

    const moveItem = (itemIdx, direction) => {
        const newItems = [...module.items];
        const targetIdx = itemIdx + direction;
        if (targetIdx < 0 || targetIdx >= newItems.length) return;

        [newItems[itemIdx], newItems[targetIdx]] = [newItems[targetIdx], newItems[itemIdx]];
        updateModule(index, 'items', newItems);
    };

    const handleTitleChange = (e) => {
        updateModule(index, 'title', e.target.value);
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center flex-1 gap-4">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-indigo-600"
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <input
                        type="text"
                        value={module.title}
                        onChange={handleTitleChange}
                        placeholder={`Nome do Módulo ${index + 1}`}
                        className="bg-transparent border-none focus:ring-0 font-bold text-gray-900 dark:text-white text-lg w-full"
                    />
                </div>
                <div className="flex items-center gap-2">

                    <span className="text-xs text-gray-500 font-medium px-2">
                        {module.items?.length || 0} itens
                    </span>
                    {confirmDelete ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-red-600 font-bold animate-pulse">Confirmar?</span>
                            <button
                                type="button"
                                onClick={() => removeModule(index)}
                                className="text-red-600 hover:text-red-800 p-2 bg-red-50 rounded-full"
                                title="Confirmar Exclusão"
                            >
                                <Trash className="w-5 h-5 fill-current" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="text-gray-400 hover:text-gray-600 text-xs underline"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                            title="Excluir Módulo"
                        >
                            <Trash className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="space-y-4 min-h-[50px]">
                        {module.items?.map((item, idx) => {
                            if (item.type === 'quiz') {
                                return (
                                    <QuizItem
                                        key={idx}
                                        quiz={item}
                                        updateQuiz={(f, v) => updateItem(idx, f, v)}
                                        removeQuiz={() => removeItem(idx)}
                                        moveQuiz={(dir) => moveItem(idx, dir)}
                                        isFirst={idx === 0}
                                        isLast={idx === module.items.length - 1}
                                        title={module.items.length === idx + 1 && module.title === 'Prova Final' ? 'Prova Final' : 'Prova do Módulo'}
                                    />
                                );
                            } else {
                                return (
                                    <LessonItem
                                        key={idx}
                                        lesson={item}
                                        index={idx} 
                                        updateLesson={(i, f, v) => updateItem(idx, f, v)}
                                        removeLesson={() => removeItem(idx)}
                                        moveLesson={(i, dir) => moveItem(idx, dir)}
                                        isFirst={idx === 0}
                                        isLast={idx === module.items.length - 1}
                                    />
                                );
                            }
                        })}

                        {(!module.items || module.items.length === 0) && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                <p className="text-gray-500 mb-2">Este módulo está vazio.</p>
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => addItem('lesson')} className="text-indigo-600 font-medium hover:underline text-sm">+ Adicionar Aula</button>
                                    <span className="text-gray-300">|</span>
                                    <button onClick={() => addItem('quiz')} className="text-indigo-600 font-medium hover:underline text-sm">+ Adicionar Prova</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => addItem('lesson')}
                            className="flex-1 py-2 flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Adicionar Aula
                        </button>
                        <button
                            type="button"
                            onClick={() => addItem('quiz')}
                            className="flex-1 py-2 flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Adicionar Prova
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
