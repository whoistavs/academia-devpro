import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Trash2, Minimize2, History, PlusCircle, ChevronLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

const AIChatWidget = () => {
    const { language } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('chat'); // 'chat' or 'history'

    // Greetings for each supported language
    const greetings = {
        pt: 'Olá! Sou o assistente virtual da DevPro Academy. Como posso ajudar você hoje?',
        en: 'Hello! I am the DevPro Academy virtual assistant. How can I help you today?',
        es: '¡Hola! Soy el asistente virtual de DevPro Academy. ¿Cómo puedo ayudarte hoy?',
        fr: 'Bonjour! Je suis l\'assistant virtuel de DevPro Academy. Comment puis-je vous aider aujourd\'hui?',
        de: 'Hallo! Ich bin der virtuelle Assistent der DevPro Academy. Wie kann ich Ihnen heute helfen?',
        zh: '你好！我是DevPro Academy的虚拟助手。今天我能为你做什么？',
        ar: 'مرحباً! أنا المساعد الافتراضي لأكاديمية DevPro. كيف يمكنني مساعدتك اليوم؟'
    };

    // Load sessions from localStorage
    const [sessions, setSessions] = useState(() => {
        const savedStats = localStorage.getItem('devpro_chat_sessions');
        return savedStats ? JSON.parse(savedStats) : [];
    });

    const [currentSessionId, setCurrentSessionId] = useState(null);

    // Load initial messages (current scratchpad) or start fresh
    const [messages, setMessages] = useState(() => {
        const savedCurrent = localStorage.getItem('devpro_chat_current');
        if (savedCurrent) return JSON.parse(savedCurrent);
        return [{ role: 'model', text: greetings['pt'] }];
    });

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Save current scratchpad to localStorage
    useEffect(() => {
        localStorage.setItem('devpro_chat_current', JSON.stringify(messages));
    }, [messages]);

    // Save sessions to localStorage
    useEffect(() => {
        localStorage.setItem('devpro_chat_sessions', JSON.stringify(sessions));
    }, [sessions]);

    // Update greeting when language changes (if empty)
    useEffect(() => {
        const currentGreeting = greetings[language] || greetings['pt'];
        if (messages.length === 1 && messages[0].role === 'model') {
            setMessages([{ role: 'model', text: currentGreeting }]);
        }
    }, [language]);

    useEffect(() => {
        if (isOpen && view === 'chat') scrollToBottom();
    }, [messages, isOpen, view]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMsg = { role: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const historyForApi = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const res = await api.chatAI(userMsg.text, historyForApi);

            const botMsg = { role: 'model', text: res.text };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, tive um erro ao processar sua mensagem. Tente novamente mais tarde.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        // If current chat has messages (more than just greeting), save it to history before clearing
        if (messages.length > 2) {
            const newSession = {
                id: Date.now(),
                date: new Date().toISOString(),
                preview: messages.find(m => m.role === 'user')?.text || "Nova Conversa",
                messages: messages
            };
            setSessions(prev => [newSession, ...prev]);
        }

        setMessages([{ role: 'model', text: greetings[language] || greetings['pt'] }]);
        setCurrentSessionId(null);
        setView('chat');
    };

    const handleLoadSession = (session) => {
        // Save current if needed
        if (messages.length > 2 && !currentSessionId) {
            const newSession = {
                id: Date.now(),
                date: new Date().toISOString(),
                preview: messages.find(m => m.role === 'user')?.text || "Sem título",
                messages: messages
            };
            setSessions(prev => [newSession, ...prev]);
        }

        setMessages(session.messages);
        setCurrentSessionId(session.id);
        setView('chat');
    };

    const handleDeleteSession = (e, id) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) {
            handleNewChat();
        }
    };

    const formatMessage = (text) => {
        if (!text) return text;
        const parts = text.split(/(\*\*.*?\*\*|`.*?`|https?:\/\/[^\s]+)/g);

        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={index} className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-xs font-mono break-all">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            if (part.match(/^https?:\/\//)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-white underline break-all"
                    >
                        {part}
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-gray-800 w-[350px] h-[500px] mb-4 rounded-2xl shadow-2xl flex flex-col pointer-events-auto border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 animate-slide-up">

                    {/* Header */}
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center space-x-2">
                            {view === 'history' ? (
                                <button onClick={() => setView('chat')} className="hover:bg-white/20 p-1 rounded-full mr-1">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Bot className="w-6 h-6" />
                                </div>
                            )}

                            <div>
                                <h3 className="font-bold text-sm">
                                    {view === 'history' ? 'Histórico' : 'DevPro AI'}
                                </h3>
                                <p className="text-xs text-indigo-200">
                                    {view === 'history' ? `${sessions.length} conversas salvas` : 'Online'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            {view === 'chat' && (
                                <>
                                    <button onClick={handleNewChat} className="p-1 hover:bg-white/10 rounded" title="Nova Conversa">
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setView('history')} className="p-1 hover:bg-white/10 rounded" title="Histórico">
                                        <History className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded ml-2">
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content Area (Switch between Chat and History) */}
                    {view === 'chat' ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600'
                                            }`}>
                                            <p className="whitespace-pre-wrap break-words">{formatMessage(msg.text)}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-100 dark:border-gray-600 flex space-x-1 items-center">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Digite sua dúvida..."
                                        className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 border-transparent text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim() || isLoading}
                                        className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-[10px] text-center text-gray-400 mt-2">
                                    A IA pode cometer erros. Verifique informações importantes.
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                            {sessions.length === 0 ? (
                                <div className="text-center text-gray-400 mt-10">
                                    <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>Nenhuma conversa salva.</p>
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => handleLoadSession(session)}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 mr-2 overflow-hidden">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">
                                                    {session.preview}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(session.date).toLocaleDateString()} • {session.messages.length} msgs
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteSession(e, session.id)}
                                                className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Excluir chat"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen
                    ? 'bg-gray-700 text-white rotate-90'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 animate-bounce-custom'
                    }`}
                title="Chat com IA"
                style={{ boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)' }}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
};

export default AIChatWidget;
