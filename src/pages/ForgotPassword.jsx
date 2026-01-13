
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, Mail, ArrowLeft, Key, CheckCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { t, language } = useTranslation();

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.forgotPassword(email, language);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        
        const minLength = 8;
        const hasNumber = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/;

        if (newPassword.length < minLength) {
            setError("A senha deve ter pelo menos 8 caracteres.");
            setLoading(false);
            return;
        }
        if (!hasNumber.test(newPassword)) {
            setError("A senha deve conter pelo menos um número.");
            setLoading(false);
            return;
        }
        if (!hasSpecialChar.test(newPassword)) {
            setError("A senha deve conter pelo menos um caractere especial (!@#$...).");
            setLoading(false);
            return;
        }

        try {
            await api.resetPassword(email, code, newPassword, language);
            alert(t('auth.forgotPassword.success') || "Senha alterada com sucesso!");
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">

                <Link to="/login" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t('auth.forgotPassword.backToLogin')}
                </Link>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {step === 1 ? t('auth.forgotPassword.title') : step === 2 ? t('auth.forgotPassword.verifyCode') : t('auth.forgotPassword.reset')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {step === 1
                            ? t('auth.forgotPassword.step1')
                            : step === 2
                                ? t('auth.forgotPassword.step2').replace('{{email}}', email)
                                : t('auth.forgotPassword.step3')
                        }
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleRequestCode} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700"
                                placeholder={t('auth.login.email')}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : t('auth.forgotPassword.sendCode')}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        setError('');
                        try {
                            await api.validateCode(email, code, language);
                            setStep(3);
                        } catch (err) {
                            setError(err.message);
                        } finally {
                            setLoading(false);
                        }
                    }} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700"
                                placeholder={t('auth.forgotPassword.codePlaceholder')}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : t('auth.forgotPassword.verifyCode')}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700"
                                placeholder={t('auth.forgotPassword.newPasswordPlaceholder')}
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Redefinindo...' : t('auth.forgotPassword.reset')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
