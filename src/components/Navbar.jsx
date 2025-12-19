import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Code2, Sun, Moon, User, LogOut, Settings, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { language, changeLanguage, t, availableLanguages } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md fixed w-full z-50 top-0 left-0 transition-colors duration-300 border-b dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <img src="/logo.png" alt="DevPro Academy" className="h-10 w-auto bg-white rounded-lg p-1.5" />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">DevPro Academy</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">{t('nav.home')}</Link>
                        <Link to="/cursos" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">{t('nav.courses')}</Link>
                        <Link to="/contato" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">{t('nav.contact')}</Link>

                        <div className="flex items-center space-x-4 border-l border-r px-4 border-gray-200 dark:border-gray-700">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                                aria-label="Alternar tema"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>

                            {/* Language Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors focus:outline-none"
                                >
                                    <Globe className="h-5 w-5" />
                                    <span className="uppercase text-sm">{language.replace('-pt', 'pt')}</span>
                                </button>

                                {isLangOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {availableLanguages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    changeLanguage(lang.code);
                                                    setIsLangOpen(false);
                                                }}
                                                className={`block w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                            >
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="flex items-center text-red-600 hover:text-red-800 font-bold transition-colors">
                                        <Settings className="h-5 w-5 mr-1" />
                                        <span>Admin</span>
                                    </Link>
                                )}
                                <Link to="/dashboard" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                                    {user.avatar ? (
                                        <div className="h-8 w-8 rounded-full overflow-hidden mr-2 border border-indigo-200 dark:border-indigo-700">
                                            <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                                        </div>
                                    ) : (
                                        <User className="h-5 w-5 mr-2" />
                                    )}
                                    <span>Minha Área</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-red-500 hover:text-red-700 font-medium flex items-center"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                                    Entrar
                                </Link>
                                <Link to="/cadastro" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                                    {t('nav.start')}
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden flex items-center space-x-4">
                        {/* Mobile Language Toggle (Simplified) */}
                        <button
                            onClick={() => {
                                setIsOpen(true);
                                setIsLangOpen(!isLangOpen);
                            }}
                            className="p-2 rounded-full text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        >
                            <Globe className="h-5 w-5" />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">{t('nav.home')}</Link>
                        <Link to="/cursos" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">{t('nav.courses')}</Link>
                        <Link to="/contato" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">{t('nav.contact')}</Link>

                        {/* Mobile Language Selection */}
                        {isLangOpen && (
                            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                                <p className="px-3 text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-2">Idiomas</p>
                                {availableLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            changeLanguage(lang.code);
                                            setIsLangOpen(false);
                                            setIsOpen(false);
                                        }}
                                        className={`block w-full text-left px-3 py-2 rounded-md text-sm ${language === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400'}`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isAuthenticated ? (
                            <>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-red-600 font-bold hover:bg-gray-50 dark:hover:bg-gray-800">Admin</Link>
                                )}
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-md text-base font-medium text-indigo-600 dark:text-indigo-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center">
                                    {user.avatar && <img src={user.avatar} alt="Profile" className="h-6 w-6 rounded-full mr-2 object-cover" />}
                                    Minha Área
                                </Link>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800">{t('nav.logout')}</button>
                            </>
                        ) : (
                            <>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">Entrar</Link>
                                <Link to="/cadastro" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700">{t('nav.start')}</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
