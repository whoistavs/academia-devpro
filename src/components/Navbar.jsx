
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Code2, Sun, Moon, User, LogOut, Settings, Globe, Search } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef(null);
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { language, changeLanguage, t, availableLanguages } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // Ctrl+K Shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Clear search when navigating away from courses
    useEffect(() => {
        if (!location.pathname.startsWith('/cursos')) {
            setSearchQuery('');
        }
    }, [location.pathname]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/cursos?search=${searchQuery}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg fixed w-full z-50 top-0 left-0 transition-all duration-300 border-b border-white/20 dark:border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <img
                                src={theme === 'dark' ? "/logo-dark.png" : "/logo.png"}
                                alt="DevPro Academy"
                                className={`h-10 w-auto rounded-lg p-1.5 ${theme === 'dark' ? '' : 'bg-white'} `}
                            />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">{t('nav.home')}</Link>
                        <Link to="/cursos" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">{t('nav.courses')}</Link>
                        <Link to="/trilhas" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Trilhas</Link>
                        <Link to="/contato" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">{t('nav.contact')}</Link>

                        {/* Search Bar */}
                        <div className="relative hidden lg:block group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className={`h-4 w-4 transition-colors ${searchQuery ? 'text-indigo-500' : 'text-gray-400'}`} />
                            </div>
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder={t('nav.search') || "Buscar cursos..."}
                                className="block w-48 xl:w-64 pl-9 pr-12 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {searchQuery ? (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <X className="h-3 w-3 text-gray-400" />
                                    </button>
                                ) : (
                                    <div className="hidden sm:flex items-center space-x-1 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 pointer-events-none shadow-md">
                                        <span className="text-[10px] font-black text-gray-500 dark:text-gray-300">Ctrl</span>
                                        <span className="text-[10px] font-black text-gray-500 dark:text-gray-300">K</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 border-l border-r px-4 border-gray-200 dark:border-gray-700">
                            { }
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                                aria-label="Alternar tema"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>

                            { }
                            <LanguageSelector />
                        </div>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                {(user?.role === 'admin' || user?.role === 'professor') && (
                                    <div className="relative group">
                                        <button className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                                            <Settings className="h-5 w-5 mr-1" />
                                            <span>Gestão</span>
                                        </button>
                                        <div className="absolute top-full right-0 pt-2 w-48 hidden group-hover:block">
                                            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-700">
                                                {user?.role === 'admin' && (
                                                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                {(user?.role === 'professor' || user?.role === 'admin') && (
                                                    <Link to="/professor" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        Área do Professor
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <Link to="/dashboard" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                                    {user.avatar ? (
                                        <div className="h-8 w-8 rounded-full overflow-hidden mr-2 border border-indigo-200 dark:border-indigo-700">
                                            <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                                        </div>
                                    ) : (
                                        <User className="h-5 w-5 mr-2" />
                                    )}
                                    <span>{t('nav.myArea')}</span>
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
                                    {t('nav.login')}
                                </Link>
                                <Link to="/cadastro" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                                    {t('nav.start')}
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden flex items-center space-x-4">


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

            { }
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <div className="px-3 py-2">
                            <LanguageSelector />
                        </div>
                        <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">{t('nav.home')}</Link>
                        <Link to="/cursos" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">{t('nav.courses')}</Link>
                        <Link to="/contato" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">{t('nav.contact')}</Link>

                        { }
                        { }

                        {isAuthenticated ? (
                            <>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-red-600 font-bold hover:bg-gray-50 dark:hover:bg-gray-800">Admin</Link>
                                )}
                                {(user?.role === 'professor' || user?.role === 'admin') && (
                                    <Link to="/professor" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-amber-600 font-bold hover:bg-gray-50 dark:hover:bg-gray-800">Professor</Link>
                                )}
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-md text-base font-medium text-indigo-600 dark:text-indigo-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center">
                                    {user.avatar && <img src={user.avatar} alt="Profile" className="h-6 w-6 rounded-full mr-2 object-cover" />}
                                    {t('nav.myArea')}
                                </Link>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800">{t('nav.logout')}</button>
                            </>
                        ) : (
                            <>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">{t('nav.login')}</Link>
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
