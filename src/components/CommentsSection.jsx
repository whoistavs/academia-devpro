
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, User } from 'lucide-react';
import Skeleton from './Skeleton';

const CommentsSection = ({ slug, lessonIndex }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', slug, lessonIndex],
        queryFn: () => api.getComments(slug, lessonIndex),
        staleTime: 1000 * 30 
    });

    const mutation = useMutation({
        mutationFn: (newComment) => api.postComment(newComment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', slug, lessonIndex] });
            setContent('');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        mutation.mutate({ courseSlug: slug, lessonIndex, content });
    };

    return (
        <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Dúvidas e Comentários ({comments.length})
            </h3>

            {}
            <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
                <div className="flex-shrink-0">
                    {user?.avatar ? (
                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                    ) : (
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-indigo-500" />
                        </div>
                    )}
                </div>
                <div className="flex-grow relative">
                    <textarea
                        className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-24"
                        placeholder="Tem alguma dúvida? Pergunte aqui..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={mutation.isPending || !content.trim()}
                        className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        Seja o primeiro a comentar!
                    </p>
                ) : (
                    comments.map(comment => (
                        <div key={comment._id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-shrink-0">
                                {comment.userAvatar ? (
                                    <img src={comment.userAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white">{comment.userName}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
