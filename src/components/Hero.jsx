import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-800 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-10 md:mb-0">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                        {t('hero.title')}
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-lg">
                        {t('hero.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/cursos" className="inline-flex items-center justify-center bg-white text-indigo-900 px-6 py-3 rounded-md font-bold text-lg hover:bg-indigo-50 transition-colors">
                            {t('hero.cta')}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <a href="#features" className="inline-flex items-center justify-center border-2 border-indigo-400 text-white px-6 py-3 rounded-md font-bold text-lg hover:bg-indigo-800 transition-colors">
                            {t('hero.learnMore')}
                        </a>
                    </div>
                </div>
                <div className="md:w-1/2 flex justify-center">
                    {/* Abstract visual representation of code/tech */}
                    <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl absolute"></div>
                    <img
                        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                        alt="Coding Workspace"
                        className="relative rounded-lg shadow-2xl border-4 border-indigo-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default Hero;
