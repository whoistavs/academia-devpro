import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, BookOpen, Clock, AlertCircle, CheckCircle, Wallet, Users, MessageCircle, Send, X, Paperclip, Mic, Square, FileText, Download } from 'lucide-react';
import { api } from '../services/api';
import BankDetailsModal from '../components/BankDetailsModal';

const ProfessorDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');
    const [showBankModal, setShowBankModal] = useState(false);

    
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        if (!user || (user.role !== 'professor' && user.role !== 'admin')) {
            navigate('/dashboard');
            return;
        }
        fetchData();

        
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [user, navigate]);

    const notifyNewMessage = (msg) => {
        if (Notification.permission === 'granted') {
            
            new Notification(`Nova mensagem de ${selectedStudent?.name || 'Aluno'}`, {
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
                stream.getTracks().forEach(track => track.stop());
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
        if (!selectedStudent) return;
        try {
            const formData = new FormData();
            formData.append('receiverId', selectedStudent.id);
            formData.append('file', file);

            await api.sendChatMessage(formData);
            fetchChat(selectedStudent.id);
        } catch (e) {
            alert("Erro ao enviar arquivo");
        }
    };

    


    useEffect(() => {
        if (activeTab === 'students') {
            fetchStudents();
        }
    }, [activeTab]);

    
    useEffect(() => {
        let interval;
        if (selectedStudent) {
            fetchChat(selectedStudent.id);
            interval = setInterval(() => fetchChat(selectedStudent.id), 3000);
        }
        return () => clearInterval(interval);
    }, [selectedStudent]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getProfessorCourses();
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const data = await api.getProfessorStudents();
            setStudents(data);
        } catch (e) {
            console.error("Failed fetch students", e);
        }
    };

    const fetchChat = async (userId) => {
        try {
            const data = await api.getChatMessages(userId);
            setMessages(prev => {
                if (JSON.stringify(data) === JSON.stringify(prev)) return prev;

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
        if (!newMessage.trim() || !selectedStudent) return;
        try {
            await api.sendChatMessage({ receiverId: selectedStudent.id, content: newMessage });
            setNewMessage('');
            fetchChat(selectedStudent.id);
        } catch (e) {
            alert("Erro ao enviar mensagem");
        }
    };

    if (loading) return <div className="min-h-screen pt-24 text-center dark:text-white">Carregando...</div>;

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <BookOpen className="w-8 h-8 mr-3 text-indigo-600" />
                            {t('professor.dashboard.title')}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Gerencie seus cursos e interaja com seus alunos.
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowBankModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <Wallet className="w-5 h-5 mr-2" />
                            Carteira
                        </button>
                        <Link
                            to="/professor/editor"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Novo Curso
                        </Link>
                    </div>
                </div>

                {}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`${activeTab === 'courses'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <BookOpen className="w-4 h-4 mr-2" /> Meus Cursos ({courses.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`${activeTab === 'students'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <Users className="w-4 h-4 mr-2" /> Meus Alunos
                        </button>
                    </nav>
                </div>

                {}
                {activeTab === 'courses' ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <div key={course.id || course._id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-lg transition-shadow">
                                <div className="p-5 flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${course.status === 'published' ? 'bg-green-100 text-green-800' :
                                                course.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {course.status === 'published' ? t('professor.status.published') :
                                                course.status === 'rejected' ? t('professor.status.rejected') : t('professor.status.pending')}
                                        </span>
                                        <span className="text-gray-500 text-xs">{course.category}</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={course.title.pt || course.title}>
                                        {typeof course.title === 'object' ? (course.title.pt || course.title.en) : course.title}
                                    </h3>
                                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                        {course.duration}
                                        <span className="mx-2">•</span>
                                        {course.totalLessons || 0} aulas
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                    <button
                                        onClick={() => {
                                            const cid = (course._id || course.id).toString().trim();
                                            navigate(`/professor/editor/${cid}`);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm bg-transparent border-none cursor-pointer"
                                    >
                                        Editar Conteúdo
                                    </button>
                                </div>
                            </div>
                        ))}
                        {courses.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">
                                Você ainda não criou nenhum curso.
                            </div>
                        )}
                    </div>
                ) : (
                    
                    <div className="flex gap-6 h-[600px]">
                        {}
                        <div className={`w-full ${selectedStudent ? 'hidden md:block md:w-1/3' : 'w-full'} bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-y-auto`}>
                            {students.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">Nenhum aluno matriculado ainda.</div>
                            ) : (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {students.map(student => (
                                        <li
                                            key={student.id}
                                            onClick={() => setSelectedStudent(student)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedStudent?.id === student.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    {student.avatar ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={student.avatar} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {student.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {student.email}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {student.courses.map((c, i) => (
                                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                {typeof c === 'string' ? c : (c.pt || 'Curso')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <MessageCircle className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {}
                        {selectedStudent && (
                            <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col">
                                {}
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
                                    <div className="flex items-center">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            Chat com {selectedStudent.name}
                                        </h3>
                                    </div>
                                    <button onClick={() => setSelectedStudent(null)} className="md:hidden text-gray-500">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {}
                                <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-100 dark:bg-gray-900/50">
                                    {messages.length === 0 ? (
                                        <p className="text-center text-gray-500 text-sm mt-10">Nenhuma mensagem ainda. Diga oi!</p>
                                    ) : (
                                        messages.map((msg, idx) => {
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

                                {}
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
                                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                        <input
                                            type="file"
                                            id="prof-chat-file"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files[0]) handleSendFile(e.target.files[0]);
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('prof-chat-file').click()}
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
                        )}
                        {!selectedStudent && students.length > 0 && (
                            <div className="hidden md:flex w-2/3 items-center justify-center bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                                <div className="text-center">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Selecione um aluno para iniciar o chat</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <BankDetailsModal isOpen={showBankModal} onClose={() => setShowBankModal(false)} />
        </main>
    );
};

export default ProfessorDashboard;
