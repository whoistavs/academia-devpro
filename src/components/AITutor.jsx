import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader, Terminal, Brain, List, HelpCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';

const AITutor = ({ context }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const quickActions = [
        { label: 'Resumir Aula', icon: <Brain className="w-3 h-3" />, prompt: 'Faça um resumo conciso desta aula.' },
        { label: 'Tópicos Chave', icon: <List className="w-3 h-3" />, prompt: 'Quais são os principais tópicos abordados?' },
        { label: 'Criar Quiz', icon: <HelpCircle className="w-3 h-3" />, prompt: 'Crie um quiz rápido com 3 perguntas sobre o conteúdo.' }
    ];

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    role: 'assistant',
                    text: 'Olá! Sou o Tutor IA da DevPro. Pode me perguntar qualquer coisa sobre esta aula ou pedir pra eu resumir o conteúdo!'
                }
            ]);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const processAIResponse = async (text, currentHistory) => {
        try {
            const history = currentHistory.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.text }]
            }));
            const response = await api.chatAI(text, history, context);
            const aiMsg = { role: 'assistant', text: response.text || "Sem resposta." };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Erro ao conectar." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        await processAIResponse(userMsg.text, [...messages, userMsg]);
    };

    const handleQuickAction = (action) => {
        // Direct send implementation pattern:
        const userMsg = { role: 'user', text: action.prompt };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        processAIResponse(userMsg.text, [...messages, userMsg]);
    };

    const formatMessage = (text) => {
        if (!text) return text;
        // Split by bold (**...**), inline code (`...`), or URLs
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
                        className="text-blue-500 hover:underline break-all"
                    >
                        {part}
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center
                    ${isOpen
                        ? 'bg-red-500 hover:bg-red-600 rotate-90'
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110'
                    } text-white`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}

                {/* Tooltip hint when closed */}
                {!isOpen && isHovered && (
                    <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 animate-fade-in-right">
                        Tutor IA
                    </span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden z-50">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
                        <div className="flex items-center text-white">
                            <div className="bg-white/20 p-2 rounded-full mr-3">
                                <Terminal className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">DevPro Tutor</h3>
                                <div className="flex items-center text-xs text-indigo-100">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                                    {isLoading ? 'Digitando...' : 'Online'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setMessages([])}
                            className="text-white/70 hover:text-white text-xs hover:bg-white/10 px-2 py-1 rounded"
                            title="Limpar Conversa"
                        >
                            Limpar
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600'
                                    }`}>
                                    <p className="whitespace-pre-wrap break-words">{formatMessage(msg.text)}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-600">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length < 4 && !isLoading && (
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickAction(action)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 text-xs rounded-full border border-indigo-100 dark:border-gray-600 hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Digite sua dúvida..."
                                className="flex-1 bg-gray-100 dark:bg-gray-900 border-0 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400">Powered by Gemini AI • DevPro Academy</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AITutor;
