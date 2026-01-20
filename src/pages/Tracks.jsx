
import React, { useState } from 'react';
import { Layers, Database, Smartphone, CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PixModal from '../components/PixModal';

const Tracks = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [purchasing, setPurchasing] = useState(false);
    const [pixData, setPixData] = useState(null);

    const tracks = [
        {
            id: "fullstack-master",
            title: "Fullstack Master",
            description: "Do zero ao profissional completo. Domine o desenvolvimento web moderno com as tecnologias mais demandadas do mercado.",
            icon: <Layers className="w-16 h-16 text-white" />,
            gradient: "from-indigo-500 to-purple-600",
            modules: [
                { title: "HTML5 & CSS3 Avançado", slug: "html5-css3-moderno", id: "1766510293124ndktl" },
                { title: "Javascript Moderno", slug: "javascript-deep-dive", id: "1766510293126aghjq" },
                { title: "React.js Profissional", slug: "react-js-componentizacao", id: "1766510293131nkbix" },
                { title: "Node.js & Express", slug: "node-js-express", id: "1766510293135mju9v" },
                { title: "Banco de Dados SQL", slug: "postgresql-sql", id: "176651029313807qzf" }
            ],
            duration: "6 Meses",
            bundlePrice: 35
        },
        {
            id: "data-science-pro",
            title: "Data Science Pro",
            description: "Torne-se um especialista em dados. Aprenda a analisar, processar e gerar valor a partir de grandes volumes de informação.",
            icon: <Database className="w-16 h-16 text-white" />,
            gradient: "from-green-500 to-teal-600",
            modules: [
                { title: "Lógica de Programação", slug: "logica-de-programacao", id: "1766510293117g9bf7" },
                { title: "Estatística Aplicada", slug: "html5-css3-moderno", id: "1766510293124ndktl" }, // Placeholder
                { title: "Machine Learning", slug: "javascript-deep-dive", id: "1766510293126aghjq" }, // Placeholder
                { title: "Deep Learning", slug: "react-js-componentizacao", id: "1766510293131nkbix" }, // Placeholder
                { title: "Big Data com Spark", slug: "node-js-express", id: "1766510293135mju9v" } // Placeholder
            ],
            duration: "8 Meses",
            bundlePrice: 45
        },
        {
            id: "mobile-expert",
            title: "Mobile Expert",
            description: "Crie aplicativos nativos e híbridos para iOS e Android. Domine o ecossistema mobile e publique seus apps.",
            icon: <Smartphone className="w-16 h-16 text-white" />,
            gradient: "from-blue-500 to-cyan-500",
            modules: [
                { title: "Lógica de Programação", slug: "logica-de-programacao", id: "1766510293117g9bf7" },
                { title: "React Native (Intro)", slug: "react-js-componentizacao", id: "1766510293131nkbix" }, // Placeholder
                { title: "Flutter & Dart", slug: "javascript-deep-dive", id: "1766510293126aghjq" }, // Placeholder
                { title: "Publicação nas Lojas", slug: "git-github", id: "1766510293121w80ee" }, // Placeholder
                { title: "UX/UI Mobile", slug: "html5-css3-moderno", id: "1766510293124ndktl" } // Placeholder
            ],
            duration: "5 Meses",
            bundlePrice: 35
        }
    ];

    const COURSE_PRICE = 10;

    const handleBuyTrack = async (track) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setPurchasing(true);
        try {
            // Calling createPreference with trackId (3rd arg)
            const response = await api.createPreference(null, null, track.id);
            // manually set courseId so Modal doesnt break, though for tracks it's different.
            // PixModal uses courseId to confirm payment. We need to tweak PixModal or pass trackId there too.
            // We already updated PixModal to handle trackId.
            // But confirming payment needs one of them.
            setPixData({ ...response, trackId: track.id });
        } catch (e) {
            console.error(e);
            alert("Erro ao iniciar pagamento.");
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Trilhas de Carreira</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Economize até 30% comprando a trilha completa. Um caminho estruturado do zero ao nível sênior.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {tracks.map((track) => {
                        const fullPrice = track.modules.length * COURSE_PRICE;
                        // Check if user has ALL courses in this track
                        const hasTrack = isAuthenticated && track.modules.every(m => user?.purchasedCourses?.includes(m.id));

                        return (
                            <div key={track.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.01] border border-gray-100 dark:border-gray-700">
                                <div className={`h-2 bg-gradient-to-r ${track.gradient}`}></div>
                                <div className="p-8 md:p-12 flex flex-col md:flex-row gap-10 items-start">

                                    {/* Esquerda: Ícone e Preço Desktop */}
                                    <div className="flex-col items-center hidden md:flex min-w-[180px]">
                                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${track.gradient} flex items-center justify-center shadow-lg mb-6 ring-4 ring-white dark:ring-gray-800`}>
                                            {track.icon}
                                        </div>
                                        <div className="text-center bg-gray-50 dark:bg-gray-700 p-4 rounded-xl w-full">
                                            {hasTrack ? (
                                                <div className="text-green-500 font-bold text-lg">
                                                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                                    Trilha Paga
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="block text-sm text-gray-500 dark:text-gray-400 line-through mb-1">De R$ {fullPrice},00</span>
                                                    <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Por apenas:</span>
                                                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">R$ {track.bundlePrice},00</span>
                                                    <span className="block text-xs text-green-600 dark:text-green-400 font-bold mt-2 bg-green-100 dark:bg-green-900/30 py-1 px-2 rounded-full">
                                                        Economia de R$ {fullPrice - track.bundlePrice},00
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile: Header Compacto */}
                                    <div className="flex items-center gap-4 md:hidden w-full border-b pb-6 border-gray-100 dark:border-gray-700">
                                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${track.gradient} flex items-center justify-center shadow-lg`}>
                                            {React.cloneElement(track.icon, { className: "w-8 h-8 text-white" })}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{track.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {hasTrack ? (
                                                    <span className="text-green-500 font-bold">Adquirida</span>
                                                ) : (
                                                    <>
                                                        <span className="text-sm text-gray-400 line-through">R$ {fullPrice}</span>
                                                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">R$ {track.bundlePrice},00</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-grow w-full">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 hidden md:block">{track.title}</h3>
                                            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                {track.modules.length} Cursos Inclusos
                                            </span>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">{track.description}</p>

                                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center uppercase tracking-wide text-sm">
                                                <Layers className="w-4 h-4 mr-2 text-indigo-500" />
                                                Cronograma Oficial {hasTrack && '(Seus Cursos)'}
                                            </h4>

                                            <div className="space-y-0 relative">
                                                {/* Linha vertical conectora */}
                                                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-600 z-0 hidden sm:block"></div>

                                                {track.modules.map((mod, idx) => {
                                                    const isPurchased = isAuthenticated && user?.purchasedCourses?.includes(mod.id);

                                                    // Simple Lock Logic: Lock if previous not purchased? 
                                                    // Or better: Lock if NOT purchased. If hasTrack, they are all purchased.
                                                    // "Order": We can visually dim future courses if previous not completed, but we lack completion data here.
                                                    // So, if hasTrack, show all active.

                                                    const isUnlocked = isPurchased;

                                                    return (
                                                        <div key={idx} className={`flex items-center group relative z-10 mb-4 last:mb-0 ${isUnlocked ? 'opacity-100' : 'opacity-70'}`}>
                                                            <span className={`
                                                                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4
                                                                ${isUnlocked ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-gray-600 text-gray-500 dark:text-gray-400'}
                                                                transition-all shadow-sm
                                                            `}>
                                                                {isUnlocked ? <PlayCircle className="w-5 h-5" /> : idx + 1}
                                                            </span>

                                                            {isUnlocked ? (
                                                                <Link to={`/curso/${mod.slug}`} className="flex-grow p-4 bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-lg transition-all hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer">
                                                                    <span className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1 sm:mb-0">{mod.title}</span>
                                                                    <span className="text-xs font-bold text-white bg-indigo-500 px-2 py-1 rounded">
                                                                        ACESSAR AULA
                                                                    </span>
                                                                </Link>
                                                            ) : (
                                                                <div className="flex-grow p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                                    <span className="font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-0">{mod.title}</span>
                                                                    <div className="flex items-center text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                                        <Lock className="w-3 h-3 mr-1" />
                                                                        Bloqueado
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-8 w-full sm:w-auto justify-center sm:justify-start">
                                                <div className="text-center sm:text-left">
                                                    <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Duração</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">{track.duration}</span>
                                                </div>
                                                <div className="text-center sm:text-left">
                                                    <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Nível</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">Iniciante ao Avançado</span>
                                                </div>
                                            </div>

                                            {hasTrack ? (
                                                <Link
                                                    to={`/curso/${track.modules[0].slug}`}
                                                    className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-gradient-to-r ${track.gradient} hover:scale-105 shadow-xl hover:shadow-2xl transition-all duration-300`}
                                                >
                                                    <PlayCircle className="w-5 h-5 mr-2" />
                                                    Continuar Trilha
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => handleBuyTrack(track)}
                                                    className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-gradient-to-r ${track.gradient} hover:scale-105 shadow-xl hover:shadow-2xl transition-all duration-300`}
                                                >
                                                    Garanta sua Vaga - R$ {track.bundlePrice},00
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <PixModal
                isOpen={!!pixData}
                data={pixData}
                onClose={() => setPixData(null)}
                onConfirm={() => {
                    setPixData(null);
                    alert("Pagamento em análise! Seus cursos serão liberados em breve.");
                    window.location.reload();
                }}
            />
        </main>
    );
};
export default Tracks;
