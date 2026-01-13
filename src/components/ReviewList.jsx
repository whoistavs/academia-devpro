
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import { MessageSquare, ThumbsUp } from 'lucide-react';

const ReviewList = ({ courseId }) => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [myRating, setMyRating] = useState(5);
    const [myComment, setMyComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    
    const { data, isLoading } = useQuery({
        queryKey: ['reviews', courseId],
        queryFn: () => api.getReviews(courseId),
        enabled: !!courseId
    });

    const reviews = data?.reviews || [];
    const average = data?.average || 0;
    const total = data?.total || 0;

    
    
    
    
    
    const hasPurchased = user && (user.role === 'admin' || user.purchasedCourses?.some(id => String(id) === String(courseId)));

    
    const myReview = reviews.find(r => r.userId === user?.id || r.userId === user?._id);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.postReview(courseId, { rating: myRating, comment: myComment });
            queryClient.invalidateQueries(['reviews', courseId]);
            setMyComment('');
            alert('Avaliação enviada com sucesso!');
        } catch (error) {
            alert('Erro ao enviar avaliação.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-4 text-center">Carregando avaliações...</div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mt-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
                Avaliações do Curso
                <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {total}
                </span>
            </h3>

            {}
            <div className="flex items-center space-x-4 mb-8 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">{average}</div>
                <div>
                    <StarRating rating={Math.round(Number(average))} readOnly size="w-6 h-6" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Média Geral</p>
                </div>
            </div>

            {}
            {isAuthenticated && hasPurchased && !myReview && (
                <form onSubmit={handleSubmit} className="mb-8 p-4 border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">O que você achou do curso?</h4>
                    <div className="mb-3">
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Sua Nota</label>
                        <StarRating rating={myRating} setRating={setMyRating} />
                    </div>
                    <div className="mb-3">
                        <textarea
                            value={myComment}
                            onChange={e => setMyComment(e.target.value)}
                            className="w-full p-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                            placeholder="Escreva um comentário (opcional)..."
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                </form>
            )}

            {}
            {myReview && (
                <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
                    <ThumbsUp className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 dark:text-green-300 text-sm">
                        Você já avaliou este curso com nota <strong>{myReview.rating}</strong>.
                    </span>
                </div>
            )}

            {}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    {review.userAvatar ? (
                                        <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                            {review.userName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{review.userName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <StarRating rating={review.rating} readOnly size="w-4 h-4" />
                        </div>
                        {review.comment && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm pl-14">
                                "{review.comment}"
                            </p>
                        )}
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                        Ainda não há avaliações para este curso.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewList;
