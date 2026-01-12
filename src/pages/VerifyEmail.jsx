import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error

    const effectRan = React.useRef(false);

    useEffect(() => {
        if (effectRan.current === true) return;

        const verify = async () => {
            if (!token) {
                setStatus('error');
                return;
            }

            // Mark as ran immediately to prevent race conditions
            effectRan.current = true;

            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const res = await fetch(`${API_URL}/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                if (res.ok) {
                    setStatus('success');
                    setTimeout(() => navigate('/login'), 3000);
                } else {
                    // Start: Handle specific case of double-click or strict mode race condition
                    // If server says "Token invalid", it might be because it was JUST verified.
                    // Ideally server handles this, but client-side "consumed" is hard to distinguish from "bad token" without user context.
                    // For now, assume error.
                    setStatus('error');

                    // Optional: You could fetch the user status if you had their ID, but you don't here.
                }
            } catch (e) {
                setStatus('error');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-md w-full text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verificando...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verificado!</h2>
                        <p className="text-gray-600 dark:text-gray-300">Sua conta foi ativada com sucesso. Redirecionando para o login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Falha na Verificação</h2>
                        <p className="text-gray-600 dark:text-gray-300">O link é inválido ou expirou.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Voltar para Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
