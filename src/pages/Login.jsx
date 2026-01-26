import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import SecurityCaptcha from '../components/SecurityCaptcha';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [captchaValid, setCaptchaValid] = useState(false);
    const { login } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                // Using the specific endpoint for Google Auth
                const response = await fetch(`https://devpro-backend.onrender.com/api/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: tokenResponse.access_token })
                });

                const data = await response.json();

                if (!response.ok) throw new Error(data.error);

                login({
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    avatar: data.avatar,
                    profileCompleted: data.profileCompleted,
                    authProvider: data.authProvider // Saving auth provider
                }, data.accessToken);
                navigate('/dashboard');
            } catch (err) {
                setError("Falha no login com Google. Verifique se o ID do Cliente está configurado.");
                console.error(err);
            }
        },
        onError: () => setError('Login com Google falhou.'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await api.login(email, password, rememberMe);

            login({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role,
                avatar: data.avatar,
                profileCompleted: data.profileCompleted
            }, data.accessToken);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        {t('auth.login.title')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {t('auth.login.newAccount').replace('ou ', '')}{' '}
                        <Link to="/cadastro" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                            {t('auth.login.newAccount').includes('create') ? 'create a new account' : 'crie uma nova conta'}
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                            {error.toLowerCase().includes('verificado') && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!email) {
                                            alert("Digite seu email no campo abaixo primeiro.");
                                            return;
                                        }
                                        try {
                                            const res = await api.resendVerification(email);
                                            alert(res.message);
                                        } catch (e) {
                                            alert(e.message);
                                        }
                                    }}
                                    className="block mt-2 text-sm font-bold underline hover:text-red-900"
                                >
                                    Reenviar e-mail de verificação
                                </button>
                            )}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        { }
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                                placeholder={t('auth.login.email')}
                            />
                        </div>
                        { }
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                                placeholder={t('auth.login.password')}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-20"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Manter conectado
                            </label>
                        </div>
                        <div className="text-sm">
                            <Link to="/recover-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                                Esqueci minha senha
                            </Link>
                        </div>
                    </div>

                    {/* 
                    <SecurityCaptcha onValidate={setCaptchaValid} /> 
                    */}

                    <div>
                        <button
                            type="submit"
                            // disabled={!captchaValid}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {t('auth.login.submit')}
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
                            {t('auth.login.newAccount').includes('create') ? 'Sign in with Google' : 'Entrar com Google'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default Login;
