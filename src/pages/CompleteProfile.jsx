import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';

const CompleteProfile = () => {
    const { user, login } = useAuth(); 
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        cpf: '',
        rg: '',
        birthDate: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.completeProfile(formData);

            
            
            
            const token = localStorage.getItem('token');
            login({ ...user, ...data.user, profileCompleted: true }, token);

            navigate('/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {t('auth.completeProfile.title')}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('auth.completeProfile.description')}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('auth.completeProfile.name')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('auth.completeProfile.cpf')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="cpf"
                                    name="cpf"
                                    type="text"
                                    required
                                    placeholder="000.000.000-00"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="rg" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('auth.completeProfile.rg')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="rg"
                                    name="rg"
                                    type="text"
                                    required
                                    value={formData.rg}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('auth.completeProfile.birthDate')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="birthDate"
                                    name="birthDate"
                                    type="date"
                                    required
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? t('auth.completeProfile.saving') : t('auth.completeProfile.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;
