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
            description: 'Crie interfaces incríveis e responsivas para web e mobile.', // Keeping desc hardcoded for now or add to json if critical
            color: 'bg-blue-50'
        },
        {
            id: 2,
            name: t('courses.filters.backend'),
            icon: <Database className="h-12 w-12 text-green-500" />,
            description: 'Domine o servidor, bancos de dados e lógica de negócios.',
            color: 'bg-green-50'
        },
        {
            id: 3,
            name: t('courses.filters.datascience'),
            icon: <Cpu className="h-12 w-12 text-purple-500" />,
            description: 'Transforme dados em insights valiosos e inteligência.',
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
        </main>
    );
};

export default Home;
