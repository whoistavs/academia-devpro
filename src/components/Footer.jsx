import React from 'react';
import { Code2, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Column 1: Logo & Mission */}
                    <div className="flex flex-col">
                        <div className="flex items-center mb-4">
                            <img src="/logo.png" alt="DevPro Academy" className="h-10 w-auto bg-white rounded-lg p-1.5" />
                        </div>
                        <p className="text-gray-400 max-w-sm">
                            {t('footer.about')}
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold uppercase tracking-wider mb-4">{t('footer.quickLinks')}</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-indigo-400 transition-colors">{t('nav.home')}</Link></li>
                            <li><Link to="/cursos" className="hover:text-indigo-400 transition-colors">{t('nav.courses')}</Link></li>
                            <li><Link to="/contato" className="hover:text-indigo-400 transition-colors">{t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Social Media */}
                    <div>
                        <h3 className="text-white font-semibold uppercase tracking-wider mb-4">Redes Sociais</h3>
                        <ul className="flex space-x-6">
                            <li>
                                <a href="#" className="hover:text-white transition-colors" aria-label="Github">
                                    <Github className="h-6 w-6" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                                    <Twitter className="h-6 w-6" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                                    <Linkedin className="h-6 w-6" />
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Copyright Section */}
                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
                    <p>&copy; {new Date().getFullYear()} DevPro Academy. {t('footer.rights')}</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link to="/privacidade" className="hover:text-gray-300 transition-colors">{t('footer.privacy')}</Link>
                        <Link to="/termos" className="hover:text-gray-300 transition-colors">{t('footer.terms')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
