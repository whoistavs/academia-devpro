import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Printer, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import coursesData from '../data/cursos.json';

const Certificate = () => {
    const { slug } = useParams();
    const { user, isAuthenticated } = useAuth();
    const course = coursesData.find(c => c.slug === slug);
    const certificateRef = useRef(null);

    // Initial Loading State or Not Authenticated
    // If isAuthenticated is undefined, it means AuthContext is still loading
    if (isAuthenticated === undefined) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="animate-pulse">Carregando certificado...</div>
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

    // Course not found
    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <h2 className="text-2xl font-bold mb-4">Certificado não encontrado</h2>
                <p className="mb-4">O curso solicitado não existe.</p>
                <Link to="/dashboard" className="text-indigo-400 hover:underline">Voltar ao Dashboard</Link>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const currentDate = new Date().toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Generate safe verification code
    // HANDLE POTENTIAL MISSING ID SAFELY
    const safeUserId = (user.id || user._id || 'USER').toString().substring(0, 4).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `${randomPart}-${safeUserId}`;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-24 pb-10 print:bg-white print:p-0">
            {/* Valid for screen only */}
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

            {/* Certificate Container */}
            <div
                ref={certificateRef}
                className="certificate-container w-full max-w-5xl bg-white p-12 shadow-2xl relative border-8 border-double border-gray-200 text-center print:shadow-none print:border-8 print:w-full print:h-screen print:flex print:flex-col print:justify-center"
                style={{ aspectRatio: '1.414/1' }} // Landscape A4ish ratio
            >
                {/* Decorative Corners */}
                <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-indigo-900"></div>
                <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-indigo-900"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-indigo-900"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-indigo-900"></div>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex justify-center mb-6">
                        <Award className="w-20 h-20 text-indigo-600" />
                    </div>
                    <h1 className="text-5xl font-serif text-gray-900 font-bold tracking-wide uppercase mb-2">
                        Certificado de Conclusão
                    </h1>
                    <p className="text-gray-500 text-lg uppercase tracking-widest">DevPro Academy</p>
                </div>

                {/* Body */}
                <div className="mb-12">
                    <p className="text-xl text-gray-600 mb-6 italic">Certificamos que</p>
                    <h2 className="text-4xl font-bold text-indigo-900 mb-6 border-b-2 border-indigo-100 inline-block pb-2 px-8">
                        {user.name || "Aluno DevPro"}
                    </h2>
                    <p className="text-xl text-gray-600 mb-2">concluiu com êxito o curso de</p>
                    <h3 className="text-3xl font-bold text-gray-800 mb-6">{course.title.pt || course.title}</h3>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Demonstrando dedicação e competência nos tópicos abordados, completando a carga horária e superando a avaliação final.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-around items-end mt-16">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-800 mb-1">{currentDate}</div>
                        <div className="border-t border-gray-400 w-40 mx-auto mt-2"></div>
                        <p className="text-sm text-gray-500 mt-1">Data de Emissão</p>
                    </div>

                    <div className="text-center">
                        {/* Signature Mock */}
                        <div className="font-script text-3xl text-indigo-800 mb-1 font-bold italic" style={{ fontFamily: 'cursive' }}>
                            Octavio R. Schwab
                        </div>
                        <div className="border-t border-gray-400 w-56 mx-auto mt-2"></div>
                        <p className="text-sm text-gray-500 mt-1">Diretor Pedagógico</p>
                    </div>
                </div>

                {/* Verification Code */}
                <div className="absolute bottom-4 left-0 w-full text-center">
                    <p className="text-xs text-gray-400">
                        Código de Autenticidade: {code}
                    </p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { 
                        size: landscape;
                        margin: 0mm;
                    }
                    html, body {
                        width: 100%;
                        height: 100%;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden;
                        visibility: hidden;
                    }
                    .certificate-container, .certificate-container * {
                        visibility: visible;
                    }
                    .certificate-container {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        border: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transform: scale(0.98); /* Safety shrink to ensure 1 page */
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
