import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Trash2, Minimize2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';


const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Olá! Sou o assistente virtual da DevPro Academy. Como posso ajudar você hoje?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth(); // Optional: customize greeting if user is logged in

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        const userMsg = { role: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            // Prepare history for API (Gemini expects role: 'user' | 'model', parts: [{ text: ... }])
            // But our simpler backend just takes message and history array.
            // Let's format history as required by our backend structure or google's structure.
            // The backend I wrote takes `history` which is passed to `startChat`.
            // `startChat` history expects { role, parts: [{ text }] }.

            const historyForApi = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const res = await api.sendAIMessage(userMsg.text, historyForApi);

            const botMsg = { role: 'model', text: res.text };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, tive um erro ao processar sua mensagem. Tente novamente mais tarde.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setMessages([
            { role: 'model', text: 'Olá! Sou o assistente virtual da DevPro Academy. Como posso ajudar você hoje?' }
        ]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-gray-800 w-[350px] h-[500px] mb-4 rounded-2xl shadow-2xl flex flex-col pointer-events-auto border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 animate-slide-up">

                    {/* Header */}
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">DevPro AI</h3>
                                <p className="text-xs text-indigo-200">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button onClick={handleClear} className="p-1 hover:bg-white/10 rounded" title="Limpar conversa">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
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

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
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
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen
                    ? 'bg-gray-700 text-white rotate-90'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 animate-bounce-custom' // animate-bounce might be too much constantly
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
