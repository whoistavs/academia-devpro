
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

    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTracks = async () => {
            try {
                const data = await api.getTracks();
                // If API returns empty (first load before seed?), use fallback or just wait.
                // But backend seeds on startup, so it should be fine.
                // We need to ensure the data structure matches what UI expects.
                // UI expects: id, title, description, icon (component), gradient, modules, duration, bundlePrice.
                // DB has: id, title, description, icon (string), gradient, modules (string[]), duration, bundlePrice.

                // We need to Map the DB data to UI data.
                // Specifically: icon component and modules objects.
                // The DB 'modules' is array of IDs. The UI needs { title, slug, id } to display list.
                // The frontend Tracks.jsx DOES NOT have access to course content unless we fetch them all.
                // We should probably fetch all courses to map the names?
                // Or update the backend to populate modules?
                // Let's fetch all courses here to map titles.

                const allCourses = await api.getCourses();

                const formattedTracks = data.map(t => {
                    const mappedModules = t.modules.map(modId => {
                        const found = allCourses.find(c => c._id === modId || c.id === modId || c.id === parseInt(modId));
                        return found ? {
                            title: found.title.pt || found.title,
                            slug: found.slug,
                            id: found._id
                        } : { title: "Curso Removido", slug: "#", id: modId };
                    });

                    // Icon mapping? We only stored string.
                    // We can map string keys to icons.
                    let IconComp = Layers;
                    if (t.id.includes('data')) IconComp = Database;
                    if (t.id.includes('mobile')) IconComp = Smartphone;

                    return {
                        ...t,
                        modules: mappedModules,
                        icon: <IconComp className="w-16 h-16 text-white" />
                    };
                });

                setTracks(formattedTracks);
            } catch (e) {
                console.error("Failed loading tracks", e);
            } finally {
                setLoading(false);
            }
        };
        loadTracks();
    }, []);

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
