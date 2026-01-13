import React from 'react';
import { Video, Clock, FileText, Trash, ArrowUp, ArrowDown } from 'lucide-react';

export const LessonItem = ({ lesson, index, updateLesson, removeLesson, moveLesson, isFirst, isLast }) => {
    const handleChange = (field, value) => {
        
        updateLesson(index, field, value);
    };

    
    const getString = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        
        
        return val.pt || val.en || '';
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded dark:bg-indigo-900/50 dark:text-indigo-300">
                        Aula {index + 1}
                    </span>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                        {getString(lesson.titulo) || 'Nova Aula'}
                    </h4>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => moveLesson(index, -1)}
                        disabled={isFirst}
                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => moveLesson(index, 1)}
                        disabled={isLast}
                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="p-1 text-red-400 hover:text-red-600 ml-2"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Título</label>
                    <input
                        type="text"
                        value={getString(lesson.titulo)}
                        onChange={(e) => handleChange('titulo', e.target.value)}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Ex: Introdução ao React"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Duração</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={getString(lesson.duracao)}
                            onChange={(e) => handleChange('duracao', e.target.value)}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm p-2 pl-8 border focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ex: 10 min"
                        />
                        <Clock className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">URL do Vídeo</label>
                <div className="relative">
                    <input
                        type="text"
                        value={lesson.video || ''}
                        onChange={(e) => handleChange('video', e.target.value)}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm p-2 pl-8 border focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://youtube.com/..."
                    />
                    <Video className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Conteúdo (Markdown)</label>
                <div className="relative">
                    <textarea
                        rows={3}
                        value={getString(lesson.content)}
                        onChange={(e) => handleChange('content', e.target.value)}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm p-2 pl-8 border focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                        placeholder="# Título\n\nConteúdo da aula..."
                    />
                    <FileText className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                </div>
            </div>
        </div>
    );
};
