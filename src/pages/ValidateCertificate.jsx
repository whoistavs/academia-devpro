import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Award } from 'lucide-react';
import { api } from '../services/api';

const ValidateCertificate = () => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();


        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await api.validateCertificate(code);
            setResult(data);
        } catch (err) {

            setError('Erro ao conectar com o serviço de validação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex flex-col items-center px-4 dark:bg-gray-900">
            <div className="w-full max-w-2xl text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 mb-6">
                    <Award className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Validação de Certificados
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Verifique a autenticidade de um certificado emitido pela DevPro Academy.
                </p>
            </div>

            <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <form onSubmit={handleVerify} className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Código de Autenticidade
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ex: DVP-ABCD-1234-XYZ"
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono"
                        />
                        <button
                            type="submit"
                            disabled={loading || !code.trim()}
                            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Search className="w-5 h-5 mr-2" />
                                    Verificar
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {result && (
                    <div className={`rounded-xl p-6 ${result.valid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                        {result.valid ? (
                            <div className="flex items-start">
                                <CheckCircle className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">
                                        Certificado Válido
                                    </h3>
                                    <div className="space-y-1 text-gray-700 dark:text-gray-300">
                                        <p><span className="font-semibold">Aluno:</span> {result.studentName}</p>
                                        <p><span className="font-semibold">Curso:</span> {result.courseTitle}</p>
                                        <p><span className="font-semibold">Data de Emissão:</span> {new Date(result.date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800/50 text-xs text-green-700 dark:text-green-400">
                                        Este certificado foi emitido oficialmente pela DevPro Academy e sua autenticidade está confirmada.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-bold text-red-800 dark:text-red-300">
                                        Certificado Inválido ou Não Encontrado
                                    </h3>
                                    <p className="text-red-600 dark:text-red-400 mt-1">
                                        Não encontramos nenhum registro para o código informado. Verifique se digitou corretamente.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ValidateCertificate;
