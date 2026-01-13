import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Printer, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Certificate = () => {
    const { slug } = useParams();
    const { user, isAuthenticated, completedLessons } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef(null);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const data = await api.getCourse(slug);
                setCourse(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug]);

    
    if (isAuthenticated === undefined || loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="animate-pulse flex flex-col items-center">
                    <Award className="w-12 h-12 mb-4 text-indigo-500 animate-bounce" />
                    <p>Gerando certificado...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
                <p className="mb-4">Você precisa estar logado para ver seu certificado.</p>
                <Link to="/login" className="px-6 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700 transition">
                    Fazer Login
                </Link>
            </div>
        );
    }

    
    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <h2 className="text-2xl font-bold mb-4">Certificado não encontrado</h2>
                <p className="mb-4">O curso solicitado não existe.</p>
                <Link to="/cursos" className="text-indigo-400 hover:underline">Voltar aos Cursos</Link>
            </div>
        );
    }

    
    const totalLessons = course.modulos
        ? course.modulos.reduce((acc, m) => acc + (m.items ? m.items.length : 0), 0)
        : (course.aulas?.length || 0);

    const userProgress = completedLessons[course._id || course.id] || [];
    const isComplete = userProgress.length >= totalLessons && totalLessons > 0;

    
    

    const handlePrint = () => {
        window.print();
    };

    const currentDate = `São Paulo, ${new Date().toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })}`;

    
    const safeUserId = (user.id || user._id || 'USER').toString().substring(0, 8).toUpperCase();
    const courseCode = (course._id || course.id).toString().substring(0, 4).toUpperCase();
    const code = `DVP-${courseCode}-${safeUserId}-${Date.now().toString(36).substring(4).toUpperCase()}`;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-24 pb-10 print:bg-white print:p-0">
            {}
            <div className="w-full max-w-4xl px-4 mb-6 flex justify-between items-center print:hidden">
                <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar ao Dashboard
                </Link>
                <div className="flex flex-col items-end">
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                        Imprimir / Salvar PDF
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                        💡 Dica: Em "Destino", escolha "Salvar como PDF"
                    </p>
                </div>
            </div>

            {}
            <div
                ref={certificateRef}
                className="certificate-container w-full max-w-5xl bg-white p-10 shadow-2xl relative border-8 border-double border-gray-200 text-center print:shadow-none print:border-4 print:w-[297mm] print:h-[210mm] print:max-w-none print:p-6 print:m-0 print:absolute print:top-0 print:left-0 print:flex print:flex-col print:justify-between print:overflow-hidden"
                style={{ aspectRatio: '1.414/1' }} 
            >
                {}
                <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-indigo-900 print:top-4 print:left-4"></div>
                <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-indigo-900 print:top-4 print:right-4"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-indigo-900 print:bottom-4 print:left-4"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-indigo-900 print:bottom-4 print:right-4"></div>

                {}
                <div className="mb-12 print:mb-0">
                    <div className="flex justify-center mb-6 print:mb-2">
                        <Award className="w-20 h-20 text-indigo-600 print:w-16 print:h-16" />
                    </div>
                    <h1 className="text-5xl font-serif text-gray-900 font-bold tracking-wide uppercase mb-2 print:text-4xl">
                        Certificado de Conclusão
                    </h1>
                    <p className="text-gray-500 text-lg uppercase tracking-widest print:text-base">DevPro Academy</p>
                </div>

                {}
                <div className="mb-0 print:mb-0">
                    <p className="text-xl text-gray-600 mb-6 italic print:text-lg print:mb-2">Certificamos que</p>
                    <h2 className="text-4xl font-bold text-indigo-900 mb-2 border-b-2 border-indigo-100 inline-block pb-2 px-8 print:text-3xl print:mb-2">
                        {user.name || "Aluno DevPro"}
                    </h2>

                    {(() => {
                        const cpf = user.cpf || localStorage.getItem(`user_cpf_${user.id || user._id}`);
                        const rg = user.rg || localStorage.getItem(`user_rg_${user.id || user._id}`);

                        const formatCPF = (v) => v ? v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : '';
                        
                        const formatRG = (v) => {
                            if (!v) return '';
                            const clean = v.replace(/\D/g, '');
                            if (clean.length === 9) {
                                return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
                            }
                            return v; 
                        };

                        
                        return (
                            <div className="text-sm text-gray-600 mb-6 font-mono print:text-xs print:mb-2 print:text-gray-800">
                                {cpf && <span>CPF: {formatCPF(cpf)}</span>}
                                {cpf && rg && <span className="mx-3">•</span>}
                                {rg && <span>RG: {formatRG(rg)}</span>}
                            </div>
                        );
                    })()}

                    <p className="text-xl text-gray-600 mb-2 print:text-lg">concluiu com êxito o curso de</p>
                    <h3 className="text-3xl font-bold text-gray-800 mb-6 print:text-2xl print:mb-2">
                        {typeof course.title === 'object' ? (course.title.pt || course.title.en) : course.title}
                    </h3>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed print:text-base print:max-w-full">
                        Demonstrando dedicação e competência nos tópicos abordados, completando a carga horária de <span className="font-bold text-gray-800">
                            {course.duration && (course.duration.toString().includes('h') || course.duration.toString().includes('min'))
                                ? course.duration
                                : `${course.duration || '0'} horas`}
                        </span> e superando a avaliação final.
                    </p>
                </div>

                {}
                <div className="flex justify-between items-end mt-8 w-full px-20 print:px-12 print:mt-0 print:mb-8">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-800 mb-1 print:text-base">{currentDate}</div>
                        <div className="border-t border-gray-400 w-72 mx-auto mt-2"></div>
                        <p className="text-sm text-gray-500 mt-1">Data de Emissão</p>
                    </div>

                    <div className="text-center">
                        {}
                        <div className="font-script text-3xl text-indigo-800 mb-1 font-bold italic print:text-2xl" style={{ fontFamily: 'cursive' }}>
                            Octavio R. Schwab
                        </div>
                        <div className="border-t border-gray-400 w-72 mx-auto mt-2"></div>
                        <p className="text-sm text-gray-500 mt-1">Diretor Pedagógico</p>
                    </div>
                </div>

                {}
                <div
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 print:right-4"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    <p className="text-[10px] text-gray-300 font-mono tracking-widest uppercase whitespace-nowrap">
                        Autenticidade: {code}
                    </p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { 
                        size: landscape;
                        margin: 0;
                    }
                    html, body {
                        height: 100%;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .certificate-container, .certificate-container * {
                        visibility: visible;
                    }
                    .certificate-container {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        z-index: 9999 !important;
                        background: white !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important; /* Center everything vertically */
                        gap: 2rem !important; /* Add gap between sections */
                        align-items: center !important;
                        overflow: hidden !important;
                        
                        /* Reset adjustments */
                        box-shadow: none !important;
                        border: 4px solid #e5e7eb !important;
                        border-style: double !important;
                    }
                    .print\\:hidden {    
                        display: none !important;
                    } 
                }
            `}</style>
        </div>
    );
};

export default Certificate;
