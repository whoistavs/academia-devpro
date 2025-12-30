
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { BookOpen, User, LogOut, Trash2, Camera, Edit } from 'lucide-react';

import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Dashboard = () => {
    const { user, isAuthenticated, loading, logout, updateUser, isLessonCompleted, fetchProgress } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);
    const [courses, setCourses] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

    // Mask functions
    const formatCPF = (value) => {
        return value
            .replace(/\D/g, '') // Remove non-digits
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1'); // Limit length
    };

    const formatRG = (value) => {
        return value
            .replace(/\D/g, '') // Remove non-digits
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Adjusted to allow typing flow
            .replace(/(-\d{1})\d+?$/, '$1'); // Limit
    };

    // CPF Validation Algorithm (Standard for Brazil)
    const isValidCPF = (cpf) => {
        if (!cpf) return false;
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf === '') return false;
        // Eliminate known invalid CPFs
        if (cpf.length !== 11 ||
            cpf === "00000000000" ||
            cpf === "11111111111" ||
            cpf === "22222222222" ||
            cpf === "33333333333" ||
            cpf === "44444444444" ||
            cpf === "55555555555" ||
            cpf === "66666666666" ||
            cpf === "77777777777" ||
            cpf === "88888888888" ||
            cpf === "99999999999")
            return false;

        // Validate 1st digit
        let add = 0;
        for (let i = 0; i < 9; i++)
            add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9))) return false;

        // Validate 2nd digit
        add = 0;
        for (let i = 0; i < 10; i++)
            add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10))) return false;
        return true;
    };

    // Profile Edit State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        cpf: '',
        rg: ''
    });

    useEffect(() => {
        if (user) {
            // Load extra data from localStorage since backend might not have it yet
            const savedCpf = localStorage.getItem(`user_cpf_${user.id}`);
            const savedRg = localStorage.getItem(`user_rg_${user.id}`);

            setEditData({
                name: user.name || '',
                cpf: savedCpf || user.cpf || '',
                rg: savedRg || user.rg || ''
            });
        }
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        // 0. Validate CPF
        if (editData.cpf && !isValidCPF(editData.cpf)) {
            alert("CPF inválido! Por favor verifique o número.");
            return;
        }

        // 1. Always save extra data locally first (Certified data needs this)
        try {
            localStorage.setItem(`user_cpf_${user.id}`, editData.cpf);
            localStorage.setItem(`user_rg_${user.id}`, editData.rg);
        } catch (localError) {
            console.error("Local storage error:", localError);
        }

        let apiSuccess = false;
        try {
            // 2. Try to update basic info (name) via API
            if (editData.name !== user.name) {
                await api.updateMe({ name: editData.name });
                apiSuccess = true;
            } else {
                apiSuccess = true; // No name change needed
            }
        } catch (error) {
            console.error("API update failed:", error);
            // Don't block the UI flow, just warn user
        }

        // 3. Update Context to reflect changes in UI immediately
        updateUser({
            ...user,
            name: editData.name,
            cpf: editData.cpf,
            rg: editData.rg
        });

        setShowEditModal(false);

        if (apiSuccess) {
            alert("Perfil atualizado com sucesso!");
        } else {
            console.warn("Perfil salvo localmente (API error ignored).");
            // Silent fallback
        }
    };


    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await api.getCourses();
                setCourses(data);

                if (isAuthenticated) {
                    await Promise.all(data.map(c => fetchProgress(c.id)));
                }
            } catch (error) {
                console.error("Failed to load courses/progress:", error);
            } finally {
                setIsLoadingCourses(false);
            }
        };

        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // 1. Upload
            const uploadData = await api.uploadImage(file);

            // 2. Update Profile with BOTH name and avatar to prevent validation errors on backend
            const updateData = await api.updateMe({
                name: user.name,
                avatar: uploadData.url
            });

            // 3. Update Context
            updateUser(updateData.user);
            alert('Foto de perfil atualizada!');

        } catch (error) {
            console.error("Upload Error:", error);
            // alert(`Erro ao atualizar foto: ${error.message}`);
        }
    };

    const handleRemoveImage = async () => {
        if (!window.confirm("Remover foto de perfil?")) return;
        try {
            // Send empty string to clear avatar, BUT ALSO SEND NAME to keep backend happy
            await api.updateMe({
                name: user.name,
                avatar: ""
            });

            updateUser({ ...user, avatar: "" });
            alert("Foto removida!");
        } catch (error) {
            console.error(error);
            // Silent error
            updateUser({ ...user, avatar: "" }); // Optimistic update
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm(t('auth.dashboard.deleteConfirm'))) {
            try {
                await api.deleteMe();
                alert("Sua conta foi excluída com sucesso.");
                logout();
                navigate('/');
            } catch (error) {
                console.error('Delete Error:', error);

                if (error.message === 'ACCOUNT_GONE') {
                    alert('Sessão inválida ou conta já inexistente. Realizando logout.');
                    logout();
                    navigate('/');
                } else {
                    alert('Erro ao excluir conta. Tente sair e entrar novamente.');
                }
            }
        }
    };

    if (loading || isLoadingCourses) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }

    const userName = user.name || user.given_name || 'Usuário';
    const welcomeText = t('auth.dashboard.welcome') || 'Bem-vindo, {{name}}!';
    const greeting = welcomeText.replace('{{name}}', userName);

    const getProgressStats = (course) => {
        const totalLessons = course.totalLessons || 0;
        if (totalLessons === 0) return { percentage: 0 };

        let completedCount = 0;
        for (let i = 0; i < totalLessons; i++) {
            if (isLessonCompleted(course.id, i)) completedCount++;
        }

        const percentage = Math.round((completedCount / totalLessons) * 100);
        return { percentage, completedCount, totalLessons };
    };

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
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

                            {/* Camera Button */}
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors shadow-md transform hover:scale-110"
                                title="Alterar foto"
                            >
                                <Camera className="h-4 w-4" />
                            </button>

                            {/* Remove Photo Button (Only if avatar exists) */}
                            {user.avatar && (
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute bottom-0 left-0 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-md transform hover:scale-110"
                                    title="Remover foto"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{greeting}</h1>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="Editar Perfil"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium capitalize mt-1 border border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-0.5 inline-block bg-indigo-50 dark:bg-indigo-900/20">
                                {user.role || 'student'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Courses Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
                                {t('auth.dashboard.myCourses')}
                            </h2>

                            <div className="space-y-4">
                                {courses.map(course => {
                                    const { percentage, totalLessons } = getProgressStats(course);

                                    // Show Logic course (id:1) always, others only if started
                                    if (percentage === 0 && course.id != 1) return null;

                                    const getTitle = (c) => {
                                        if (typeof c.title === 'string') return c.title;
                                        // Simple safe access to title object
                                        if (c.title) return c.title.pt || c.title.en || Object.values(c.title)[0] || 'Curso';
                                        return 'Curso';
                                    }

                                    return (
                                        <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {getTitle(course)}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {course.category} • {totalLessons} Aulas
                                                    </p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${percentage === 100
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                    }`}>
                                                    {percentage === 100 ? 'Concluído' : 'Em andamento'}
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                    <span>{t('auth.dashboard.progress')}</span>
                                                    <span>{percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/curso/${course.slug}`)}
                                                className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                                            >
                                                {percentage === 100 ? 'Revisar Curso' : t('auth.dashboard.continue')} &rarr;
                                            </button>
                                        </div>
                                    );
                                })}

                                {courses.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum curso disponível.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
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

            {/* EDIT PROFILE MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Editar Perfil</h2>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF <span className="text-xs text-gray-500">(Para certificado)</span></label>
                                <input
                                    type="text"
                                    value={editData.cpf}
                                    onChange={(e) => setEditData({ ...editData, cpf: formatCPF(e.target.value) })}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RG <span className="text-xs text-gray-500">(Opcional)</span></label>
                                <input
                                    type="text"
                                    value={editData.rg}
                                    onChange={(e) => setEditData({ ...editData, rg: formatRG(e.target.value) })}
                                    placeholder="00.000.000-0"
                                    maxLength={12}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>

    );
};

export default Dashboard;
