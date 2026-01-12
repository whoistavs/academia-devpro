import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, login } = useAuth();

    // Check parameters from MercadoPago return (or just status params)
    const status = searchParams.get('status') || searchParams.get('collection_status');
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const courseId = searchParams.get('courseId');

    const [verifying, setVerifying] = useState(true);
    const [result, setResult] = useState(null); // 'approved', 'rejected', 'error'

    useEffect(() => {
        const verify = async () => {
            if (status === 'approved' && paymentId && courseId) {
                try {
                    const data = await api.verifyPayment(paymentId, courseId);
                    if (data.status === 'approved') {
                        setResult('approved');
                        // Update user context with new purchased course
                        const token = localStorage.getItem('token');
                        login({ ...user, purchasedCourses: data.purchasedCourses }, token);
                    } else {
                        setResult(data.status);
                    }
                } catch (e) {
                    console.error(e);
                    setResult('error');
                }
            } else if (status === 'failure' || status === 'rejected') {
                setResult('rejected');
            } else {
                setResult('pending');
            }
            setVerifying(false);
        };

        if (courseId) verify();
        else {
            setVerifying(false);
            setResult('error'); // Missing info
        }

    }, [searchParams]);

    if (verifying) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Verificando pagamento...</h2>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full text-center">
                {result === 'approved' ? (
                    <>
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 mb-6">
                            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pagamento Aprovado!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            Seu acesso ao curso foi liberado. Bons estudos!
                        </p>
                        <button
                            onClick={() => navigate(`/curso/${api.getCourse(courseId).slug || ''}`)} // Try to go back, but we might not have slug easily. Can redirect to dashboard
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                        >
                            Ir para Meus Cursos
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                        >
                            Voltar ao Dashboard
                        </button>
                    </>
                ) : result === 'rejected' ? (
                    <>
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900 mb-6">
                            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pagamento Recusado</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            Houve um problema com seu pagamento. Tente novamente.
                        </p>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Tentar Novamente
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processando...</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            Aguardando confirmação do pagamento.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                        >
                            Voltar ao Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;
