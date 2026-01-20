import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, Instagram, Twitter, Linkedin, Youtube, Facebook } from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from '../context/LanguageContext';

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            await api.contact(formData);

            setIsSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });

            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar mensagem. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('contact.title')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t('contact.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    { }
                    <div className="bg-indigo-900 text-white rounded-2xl p-10 shadow-xl h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-8">{t('contact.info.title')}</h3>

                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-indigo-700 p-3 rounded-full">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 text-sm">{t('contact.info.phone')}</p>
                                        <p className="font-semibold">+55 (19) 92003-3741</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="bg-indigo-700 p-3 rounded-full">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 text-sm">{t('contact.info.email')}</p>
                                        <p className="font-semibold">devproacademy@outlook.com</p>
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div className="mt-12">
                            <div className="flex space-x-4">
                                { }
                                <a href="https://instagram.com/devproacademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center hover:bg-pink-600 text-white transition-colors shadow-lg" aria-label="Instagram">
                                    <Instagram className="h-5 w-5" />
                                </a>
                                <a href="https://youtube.com/@devproacademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center hover:bg-red-600 text-white transition-colors shadow-lg" aria-label="YouTube">
                                    <Youtube className="h-5 w-5" />
                                </a>
                                <a href="https://twitter.com/devproacademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center hover:bg-black text-white transition-colors shadow-lg" aria-label="Twitter">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href="https://linkedin.com/company/devproacademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center hover:bg-blue-600 text-white transition-colors shadow-lg" aria-label="LinkedIn">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    { }
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        {isSubmitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                                    <Send className="h-12 w-12 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('contact.success.title')}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {t('contact.success.message')}
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300"
                                >
                                    {t('contact.success.new')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.form.name')}</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder={t('contact.placeholder.name')}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.form.email')}</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder={t('contact.placeholder.email')}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.form.subject')}</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder={t('contact.placeholder.subject')}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.form.message')}</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder={t('contact.placeholder.message')}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Enviando...' : t('contact.form.send')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Contact;
