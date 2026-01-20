import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { Layers, Database, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

const Home = () => {
    const { t } = useTranslation();

    const categories = [
        {
            id: 1,
            name: t('courses.filters.frontend'),
            icon: <Layers className="h-12 w-12 text-blue-500" />,
            description: t('home.categories.frontend.desc'),
            color: 'bg-blue-50'
        },
        {
            id: 2,
            name: t('courses.filters.backend'),
            icon: <Database className="h-12 w-12 text-green-500" />,
            description: t('home.categories.backend.desc'),
            color: 'bg-green-50'
        },
        {
            id: 3,
            name: t('courses.filters.datascience'),
            icon: <Cpu className="h-12 w-12 text-purple-500" />,
            description: t('home.categories.datascience.desc'),
            color: 'bg-purple-50'
        }
    ];

    return (
        <main className="flex-grow">
            <Hero />

            <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.categories.title')}</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {t('home.features.title')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {categories.map((cat) => (
                            <Link to="/cursos" key={cat.id} className={`${cat.color} dark:bg-opacity-10 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer`}>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-sm mx-auto transition-colors duration-300">
                                    {cat.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">{cat.name}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-center">
                                    {cat.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trilhas Section */}
            <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Trilhas de Carreira</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Domine uma área completa com nossos caminhos guiados de aprendizado.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Fullstack Track */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2">Fullstack Master</h3>
                                <p className="mb-6 opacity-90">Do zero ao profissional completo. Aprenda React, Node.js e muito mais.</p>
                                <Link to="/trilhas" className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">
                                    Começar Trilha
                                </Link>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                                <Layers className="w-64 h-64" />
                            </div>
                        </div>

                        {/* Data Science Track */}
                        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2">Data Science Pro</h3>
                                <p className="mb-6 opacity-90">Domine Python, Machine Learning e análise de dados complexos.</p>
                                <Link to="/trilhas" className="inline-block bg-white text-green-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">
                                    Começar Trilha
                                </Link>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                                <Database className="w-64 h-64" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Depoimentos Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">O que nossos alunos dizem</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Maria Silva",
                                role: "Desenvolvedora Frontend",
                                text: "A DevPro Academy mudou minha carreira. Os projetos práticos me ajudaram a conseguir meu primeiro emprego em apenas 3 meses!",
                                avatar: "https://randomuser.me/api/portraits/women/44.jpg"
                            },
                            {
                                name: "João Santos",
                                role: "Engenheiro de Software",
                                text: "A didática é incrível e o suporte com IA ajuda muito quando fico travado. Recomendo para todos que querem evoluir rápido.",
                                avatar: "https://randomuser.me/api/portraits/men/32.jpg"
                            },
                            {
                                name: "Ana Costa",
                                role: "Data Scientist",
                                text: "A trilha de Data Science é super completa. Aprendi conceitos complexos de forma simples e direta. Excelente plataforma!",
                                avatar: "https://randomuser.me/api/portraits/women/68.jpg"
                            }
                        ].map((testimonial, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center mb-4">
                                    <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
