import React, { useState } from 'react';
import { X, CreditCard, QrCode, CheckCircle, Lock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ isOpen, onClose, course, onSuccess }) => {
    const { user, login } = useAuth();
    const [method, setMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen || !course) return null;

    const handlePayment = async () => {
        setLoading(true);
        // Simulate API delay
        setTimeout(async () => {
            try {
                // Call backend to register purchase
                const response = await api.purchaseCourse(course.id || course._id);

                // Update local user context
                const token = localStorage.getItem('token');
                login({ ...user, purchasedCourses: response.purchasedCourses }, token);

                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onSuccess();
                    onClose();
                }, 2000);
            } catch (error) {
                alert("Erro ao processar pagamento.");
            } finally {
                setLoading(false);
            }
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    {success ? (
                        <div className="p-8 text-center bg-green-50 dark:bg-green-900/20">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">Pagamento Confirmado!</h3>
                            <p className="mt-2 text-green-700 dark:text-green-400">Você já pode acessar o curso.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800">
                            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">
                                        Checkout Seguro
                                    </h3>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Você está comprando:</p>
                                        <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{typeof course.title === 'string' ? course.title : (course.title.pt || 'Curso')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            R$ {course.price?.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex space-x-4 mb-6">
                                    <button
                                        onClick={() => setMethod('card')}
                                        className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center space-x-2 transition-all ${method === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        <span>Cartão</span>
                                    </button>
                                    <button
                                        onClick={() => setMethod('pix')}
                                        className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center space-x-2 transition-all ${method === 'pix' ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}
                                    >
                                        <QrCode className="w-5 h-5" />
                                        <span>Pix</span>
                                    </button>
                                </div>

                                {method === 'card' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Número do Cartão</label>
                                            <input type="text" placeholder="0000 0000 0000 0000" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Validade</label>
                                                <input type="text" placeholder="MM/AA" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">CVV</label>
                                                <input type="text" placeholder="123" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nome no Cartão</label>
                                            <input type="text" placeholder="Como impresso no cartão" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="bg-white p-4 inline-block rounded-lg shadow-sm border mb-4">
                                            <QrCode className="w-32 h-32 text-gray-900" />
                                        </div>
                                        <p className="text-sm text-gray-500">Escaneie o QR Code para pagar instantaneamente.</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handlePayment}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    {loading ? 'Processando...' : `Pagar R$ ${course.price?.toFixed(2)}`}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-3 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                            <div className="px-6 pb-6 text-center">
                                <p className="text-xs text-gray-400 flex items-center justify-center">
                                    <Lock className="w-3 h-3 mr-1" /> Pagamento 100% seguro e criptografado.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
