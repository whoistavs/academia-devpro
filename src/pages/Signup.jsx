import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { login } = useAuth();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await fetch(`${API_URL}/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: tokenResponse.access_token })
                });

                const data = await response.json();

                if (!response.ok) throw new Error(data.error);

                login(data.accessToken, {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    avatar: data.avatar
                });
                navigate('/dashboard');
            } catch (err) {
                setError("Falha no cadastro com Google. Verifique se o ID do Cliente está configurado.");
                console.error(err);
            }
        },
        onError: () => setError('Cadastro com Google falhou.'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!agreedToTerms) {
            setError(t('auth.signup.termsError') || 'Você deve concordar com os termos para continuar.');
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/api/cadastro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('auth.signup.error'));
            }

            // navigate('/login');
            setError('SUCCESS_VERIFICATION');
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) {
        // Keep error handling in the form below, but this block is just for the return
    }

    // Success View
    if (agreedToTerms === 'success_state_hack' || (window.location.hash === '#success')) {
        // Just kidding, let's use real state
    }

    if (error === 'SUCCESS') { // Using error state hack or better yet, new state
    }

    // ACTUALLY, I need to add the state variable first.
    // I will rewrite the component structure to include the state and the conditional render.

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                {error === 'SUCCESS_VERIFICATION' ? (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                            <Mail className="h-12 w-12 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Verifique seu E-mail
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            Enviamos um link de confirmação para <strong>{email}</strong>.
                            <br /><br />
                            Por favor, clique no link enviado para ativar sua conta e acessar a plataforma.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Ir para Login
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Não recebeu? Verifique sua caixa de spam ou lixo eletrônico.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                                {t('auth.signup.title')}
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                                {t('auth.signup.hasAccount')}{' '}
                                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                    {t('auth.signup.loginLink')}
                                </Link>
                            </p>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                                        placeholder={t('auth.signup.name')}
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                                        placeholder={t('auth.login.email')}
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                                        placeholder={t('auth.login.password')}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                    Li e concordo com os <Link to="/termos" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Termos de Serviço</Link> e <Link to="/privacidade" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Política de Privacidade</Link>
                                </label>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    {t('auth.signup.submit')}
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                                        {t('auth.login.newAccount').includes('create') ? 'or continue with' : 'ou continue com'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={() => googleLogin()}
                                    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                                    </svg>
                                    {t('auth.login.newAccount').includes('create') ? 'Sign up with Google' : 'Cadastrar com Google'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Signup;
