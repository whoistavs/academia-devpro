import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { BookOpen, Award, User, LogOut, Trash2, Camera } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, isAuthenticated, loading, logout, token, updateUser } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            // 1. Upload Image
            const uploadResponse = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) throw new Error('Falha no upload');

            // 2. Update User Profile
            const updateResponse = await fetch('http://localhost:3000/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar: uploadData.url })
            });

            const updateData = await updateResponse.json();
            if (!updateResponse.ok) throw new Error('Falha ao atualizar perfil');

            // 3. Update Context
            updateUser(updateData.user);
            alert('Foto de perfil atualizada!');

        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar foto de perfil.');
        }
    };

    // ... (handleDeleteAccount) ...

    const handleDeleteAccount = async () => {
        if (window.confirm(t('auth.dashboard.deleteConfirm'))) {
            try {
                const response = await fetch('http://localhost:3000/api/users/me', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    logout();
                    navigate('/');
                } else {
                    alert('Erro ao excluir conta.');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao excluir conta.');
            }
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const greeting = t('auth.dashboard.welcome').replace('{{name}}', user.name);

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-6">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                                title="Alterar foto"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{greeting}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium capitalize mt-1 border border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-0.5 inline-block bg-indigo-50 dark:bg-indigo-900/20">
                                {user.role || 'student'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* My Courses Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
                                {t('auth.dashboard.myCourses')}
                            </h2>

                            {/* Course List Placeholder */}
                            <div className="space-y-4">
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Desenvolvimento Web Completo 2024</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Módulo 3: JavaScript Avançado</p>
                                        </div>
                                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">Em andamento</span>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                            <span>{t('auth.dashboard.progress')}</span>
                                            <span>45%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                        </div>
                                    </div>
                                    <button className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-800 dark:hover:text-indigo-300">
                                        {t('auth.dashboard.continue')} &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Account Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Conta</h3>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-4"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>{t('nav.logout')}</span>
                            </button>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full flex items-center justify-center space-x-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>{t('auth.dashboard.deleteAccount')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
