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

        // First, extract code blocks (```...```)
        const blockParts = text.split(/(```[\s\S]*?```)/g);

        return blockParts.map((blockPart, bIdx) => {
            if (blockPart.startsWith('```') && blockPart.endsWith('```')) {
                const code = blockPart.slice(3, -3);
                return (
                    <pre key={`b-${bIdx}`} className="bg-gray-900 text-gray-100 p-3 rounded-lg my-2 font-mono text-xs overflow-x-auto border border-gray-700">
                        <code>{code.replace(/^[a-z]+\n/i, '')}</code>
                    </pre>
                );
            }

            // Then format the rest (bold, inline code, links)
            const parts = blockPart.split(/(\*\*.*?\*\*|`.*?`|https?:\/\/[^\s]+)/g);

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
        });
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 flex items-center justify-center
                    ${isOpen
                        ? 'bg-rose-500 hover:bg-rose-600 rotate-90 scale-110 shadow-rose-200 dark:shadow-rose-900/20'
                        : 'bg-gradient-to-tr from-indigo-600 to-violet-600 hover:shadow-indigo-500/25 hover:shadow-2xl hover:-translate-y-1'
                    } text-white group`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 group-hover:animate-spin-slow" />}

                {/* Tooltip hint when closed */}
                {!isOpen && isHovered && (
                    <div className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg whitespace-nowrap border border-white/10 animate-fade-in-right shadow-xl">
                        PROCURANDO AJUDA?
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 dark:border-gray-700/50 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 flex items-center justify-between shadow-lg">
                        <div className="flex items-center text-white">
                            <div className="bg-white/20 p-2.5 rounded-2xl mr-3 border border-white/20 backdrop-blur-sm">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm tracking-tight uppercase">DevPro Intelligence</h3>
                                <div className="flex items-center text-[10px] text-indigo-100 font-bold opacity-80 uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                                    {isLoading ? 'Analizando...' : 'Ready to Assist'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setMessages([])}
                            className="bg-white/10 hover:bg-white/20 text-white/90 text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-transparent custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-none border border-indigo-500/50 shadow-indigo-200/20'
                                    : 'bg-white dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100/50 dark:border-gray-600/50'
                                    }`}>
                                    <div className="whitespace-pre-wrap break-words leading-relaxed">{formatMessage(msg.text)}</div>
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
                    {messages.length < 5 && !isLoading && (
                        <div className="px-5 pb-3 flex gap-2.5 overflow-x-auto no-scrollbar mask-fade-right">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickAction(action)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 dark:bg-gray-700/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold rounded-2xl border border-indigo-100/50 dark:border-gray-600/50 hover:bg-indigo-100 dark:hover:bg-gray-600 transition-all whitespace-nowrap active:scale-95 shadow-sm"
                                >
                                    <span className="text-indigo-500">{action.icon}</span>
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 bg-gray-100/50 dark:bg-gray-900/50 p-1.5 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-inner">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pergunte algo ao Tutor..."
                                className="flex-1 bg-transparent border-0 px-4 py-2 text-sm focus:ring-0 dark:text-white placeholder-gray-400 font-medium"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`p-2.5 rounded-2xl transition-all shadow-lg ${
                                    !input.trim() || isLoading 
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-400 opacity-50' 
                                    : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/50 active:scale-90'
                                }`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-center mt-3">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Neural Engine • DevPro Academy</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AITutor;
