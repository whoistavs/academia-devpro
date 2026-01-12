
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { BookOpen, User, LogOut, Trash2, Camera, Edit, Lock, Award, Users, MessageCircle, Send, X, Paperclip, Mic, Square, FileText, Download } from 'lucide-react';

import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import PasswordConfirmationModal from '../components/PasswordConfirmationModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

const Dashboard = () => {
    const { user, isAuthenticated, loading, logout, updateUser, isLessonCompleted, fetchProgress, completedLessons } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);
    const [courses, setCourses] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

    // Chat / Professors State
    const [professors, setProfessors] = useState([]);
    const [selectedProfessor, setSelectedProfessor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    // Media / File State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Notifications
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const notifyNewMessage = (msg) => {
        if (Notification.permission === 'granted') {
            // Removing document.hidden check for testing purposes
            new Notification('Nova Mensagem', {
                body: msg.content || 'Novo arquivo recebido',
                icon: '/vite.svg'
            });
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([audioBlob], "voice-message.webm", { type: 'audio/webm' });
                handleSendFile(file);
                stream.getTracks().forEach(track => track.stop()); // Turn off mic
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (e) {
            console.error("Mic error:", e);
            alert("Erro ao acessar microfone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSendFile = async (file) => {
        if (!selectedProfessor) return;
        try {
            const formData = new FormData();
            formData.append('receiverId', selectedProfessor.id);
            formData.append('file', file);

            await api.sendChatMessage(formData);
            fetchChat(selectedProfessor.id);
        } catch (e) {
            alert("Erro ao enviar arquivo");
        }
    };

    // ... (Mask functions and CPF validation remain safely below if I don't touch them, 
    // but I need to make sure I don't break the file structure by replacing huge chunks. 
    // I will replace the top part until 'isLoadingCourses' to add imports and state.
    // AND I will fix the JSX structure at the bottom).

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

                // Load Professors
                const profs = await api.getStudentProfessors();
                setProfessors(profs);

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

    // Chat Logic
    useEffect(() => {
        let interval;
        if (selectedProfessor) {
            fetchChat(selectedProfessor.id);
            interval = setInterval(() => fetchChat(selectedProfessor.id), 3000);
        }
        return () => clearInterval(interval);
    }, [selectedProfessor]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChat = async (userId) => {
        try {
            const data = await api.getChatMessages(userId);
            setMessages(prev => {
                // Deep equality check to prevent unnecessary re-renders/scrolling
                if (JSON.stringify(data) === JSON.stringify(prev)) return prev;

                // If we have new messages notify
                if (data.length > prev.length) {
                    const lastMsg = data[data.length - 1];
                    const isMe = String(lastMsg.senderId) === String(user.id || user._id);
                    if (!isMe && prev.length > 0) {
                        notifyNewMessage(lastMsg);
                    }
                }
                return data;
            });
        } catch (e) { console.error(e); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedProfessor) return;
        try {
            await api.sendChatMessage({ receiverId: selectedProfessor.id, content: newMessage });
            setNewMessage('');
            fetchChat(selectedProfessor.id);
        } catch (e) {
            alert("Erro ao enviar mensagem");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [uploadStatus, setUploadStatus] = useState('');

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            setUploadStatus("Nenhum arquivo selecionado.");
            return;
        }

        try {
            setUploadStatus("Iniciando upload (1/3)...");

            // 1. Upload
            const uploadData = await api.uploadImage(file);
            setUploadStatus("Upload OK! Atualizando perfil (2/3)...");

            // 2. Update Profile with BOTH name and avatar
            const updateData = await api.updateMe({
                name: user.name,
                avatar: uploadData.url
            });
            setUploadStatus("Perfil salvo! Atualizando tela (3/3)...");

            // 3. Update Context
            updateUser(updateData.user);
            setUploadStatus("SUCESSO! Foto atualizada.");

            // Clear status after 3 seconds
            setTimeout(() => setUploadStatus(''), 5000);

        } catch (error) {
            console.error("Upload Error:", error);

            if (error.message.includes("Token inválido") || error.message.includes("Token não fornecido")) {
                alert("Sessão expirada. Por favor, faça login novamente.");
                logout();
                navigate('/login');
                return;
            }

            setUploadStatus(`ERRO: ${error.message}`);
            alert(`ERRO DETALHADO: ${error.message}`); // Keep alert as backup
        }
    };

    const handleRemoveImage = async () => {
        if (!window.confirm("Remover foto de perfil?")) return;
        try {
            setUploadStatus("Removendo foto...");
            // Send empty string to clear avatar
            await api.updateMe({
                name: user.name,
                avatar: ""
            });

            updateUser({ ...user, avatar: "" });
            setUploadStatus("Foto removida.");
            setTimeout(() => setUploadStatus(''), 3000);
        } catch (error) {
            console.error(error);
            if (error.message.includes("Token inválido") || error.message.includes("Token não fornecido")) {
                alert("Sessão expirada. Por favor, faça login novamente.");
                logout();
                navigate('/login');
                return;
            }
            setUploadStatus(`Erro ao remover: ${error.message}`);
            updateUser({ ...user, avatar: "" }); // Optimistic
        }
    };

    // Confirm Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const handleDeleteAccount = async () => {
        // Triggered after password confirmation
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
                alert('Erro ao excluir conta: ' + error.message);
            }
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }

    if (isLoadingCourses) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
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
                                {!(user.name && user.cpf && user.rg) && (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        title="Editar Perfil"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                            {uploadStatus && <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mt-1 animate-pulse">{uploadStatus}</p>}
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
                                {courses.filter(course => {
                                    if (!user.purchasedCourses) return false;

                                    const cId = String(course.id || course._id);
                                    // Robust check: Compare Strings to Strings
                                    return user.purchasedCourses.some(pId => String(pId) === cId);
                                }).map((course) => {
                                    // Calculate progress
                                    const totalLessons = (course.modulos?.length || 0) * 4; // Estimative or real count if available
                                    // Improved progress calc: Use real data
                                    let completedCount = 0;
                                    const cId = String(course.id || course._id);
                                    // Check both ID types in completedLessons map
                                    const lessons = completedLessons[cId] || completedLessons[course.id] || [];
                                    completedCount = lessons.length;

                                    const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

                                    const getTitle = (c) => {
                                        if (typeof c.title === 'string') return c.title;
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
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('auth.dashboard.noCourses')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Certificates Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Award className="h-5 w-5 mr-2 text-green-600" />
                                {t('auth.dashboard.myCertificates')}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {courses.filter(c => getProgressStats(c).percentage === 100).map(course => {
                                    const getTitle = (c) => typeof c.title === 'string' ? c.title : (c.title?.pt || c.title?.en || 'Curso');

                                    return (
                                        <div key={course.id} className="border border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all">
                                            <div className="flex items-center overflow-hidden">
                                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mr-4 flex-shrink-0 text-green-600 dark:text-green-400">
                                                    <Award className="w-6 h-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2" title={getTitle(course)}>
                                                        {getTitle(course)}
                                                    </h3>
                                                    <p className="text-sm text-green-700 dark:text-green-500">{t('auth.dashboard.completed')}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/certificado/${course.slug}`)}
                                                className="ml-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                                            >
                                                {t('auth.dashboard.viewCertificate')}
                                            </button>
                                        </div>
                                    );
                                })}

                                {courses.filter(c => getProgressStats(c).percentage === 100).length === 0 && (
                                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                        <Award className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                        <p>{t('auth.dashboard.noCertificates')}</p>
                                        <p className="text-sm mt-1">{t('auth.dashboard.completeToEarn')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PROFESSORS / MENTORS SECTION */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Users className="h-5 w-5 mr-2 text-indigo-500" />
                                Meus Professores (Chat)
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {professors.map(prof => (
                                    <div key={prof.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {prof.avatar ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={prof.avatar} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {prof.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {prof.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {prof.courses.length} curso(s)
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedProfessor(prof)}
                                            className="ml-2 p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                            title="Abrir Chat"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                {professors.length === 0 && (
                                    <div className="col-span-full text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                                        Você ainda não tem professores. Matricule-se em um curso!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('auth.dashboard.account')}</h3>

                            {user.authProvider !== 'google' && (
                                <button
                                    onClick={() => setShowChangePasswordModal(true)}
                                    className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-3"
                                >
                                    <Lock className="h-4 w-4" />
                                    <span>{t('auth.dashboard.changePassword')}</span>
                                </button>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-4"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>{t('nav.logout')}</span>
                            </button>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => setShowDeleteModal(true)}
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
            {
                showEditModal && (
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
                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                        disabled={!!user.name}
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
                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!!user.cpf}
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
                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!!user.rg}
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
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!!user.name && !!user.cpf && !!user.rg}
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <PasswordConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                title="Excluir Conta Permanentemente"
                message="Esta ação não pode ser desfeita. Todos os seus dados serão apagados. Digite sua senha para confirmar."
            />

            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />

            {/* CHAT MODAL */}
            {
                selectedProfessor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col h-[600px] border border-gray-200 dark:border-gray-700">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
                                <div className="flex items-center space-x-3">
                                    {selectedProfessor.avatar ? (
                                        <img className="h-10 w-10 rounded-full object-cover" src={selectedProfessor.avatar} alt="" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {selectedProfessor.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {selectedProfessor.name}
                                        </h3>
                                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div> Online
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedProfessor(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-100 dark:bg-gray-900/50">
                                {messages.length === 0 ? (
                                    <p className="text-center text-gray-500 text-sm mt-10">Tire suas dúvidas com o professor aqui.</p>
                                ) : (
                                    messages.map((msg, idx) => {
                                        // Robust ID comparison
                                        const isMe = String(msg.senderId) === String(user.id || user._id);
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                                                    }`}>
                                                    {msg.fileUrl && (
                                                        <div className="mb-2">
                                                            {msg.fileType === 'image' && (
                                                                <img src={msg.fileUrl} alt="attachment" className="rounded-lg max-h-48 object-cover" />
                                                            )}
                                                            {(msg.fileType === 'audio' || (msg.fileType === 'video' && msg.fileName?.includes('voice-message'))) && (
                                                                <audio controls src={msg.fileUrl} className="max-w-full h-10" />
                                                            )}
                                                            {(msg.fileType === 'video' && !msg.fileName?.includes('voice-message')) && (
                                                                <video controls src={msg.fileUrl} className="rounded-lg max-h-48 max-w-full" />
                                                            )}
                                                            {(msg.fileType === 'pdf' || msg.fileType === 'file') && (
                                                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm hover:underline bg-black/10 p-2 rounded">
                                                                    <FileText className="w-4 h-4" />
                                                                    <span className="truncate max-w-[150px]">{msg.fileName || 'Arquivo'}</span>
                                                                    <Download className="w-3 h-3 ml-1" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.content && <p className="text-sm">{msg.content}</p>}
                                                    <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
                                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                    <input
                                        type="file"
                                        id="chat-file"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files[0]) handleSendFile(e.target.files[0]);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('chat-file').click()}
                                        className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>

                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Digite sua mensagem..."
                                        className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                    />

                                    {isRecording ? (
                                        <button
                                            type="button"
                                            onClick={stopRecording}
                                            className="text-red-500 animate-pulse"
                                        >
                                            <Square className="w-5 h-5 fill-current" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={startRecording}
                                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                        >
                                            <Mic className="w-5 h-5" />
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </main >

    );
};

export default Dashboard;
