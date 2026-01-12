import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BankDetailsModal = ({ isOpen, onClose }) => {
    const { user, login } = useAuth(); // login to update user context
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        pixKey: '',
        bank: '',
        agency: '',
        account: '',
        accountType: 'corrente'
    });

    useEffect(() => {
        if (user && user.bankAccount) {
            setFormData({
                pixKey: user.bankAccount.pixKey || '',
                bank: user.bankAccount.bank || '',
                agency: user.bankAccount.agency || '',
                account: user.bankAccount.account || '',
                accountType: user.bankAccount.accountType || 'corrente'
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const data = await api.updateBankDetails(formData);
            // Update local user context
            // Assuming login can handle partial updates or we just mutate user object (which is antipattern but common in simple contexts)
            // Ideally we re-fetch user profile or update context.
            // Let's assume login updates the user state.
            const token = localStorage.getItem('token');
            login({ ...user, bankAccount: data.bankAccount }, token);

            setMessage('Dados salvos com sucesso!');
            setTimeout(() => {
                setMessage('');
                onClose();
            }, 1500);
        } catch (error) {
            setMessage('Erro ao salvar dados.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                            <X className="h-6 w-6" />
                        </button>

                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                    Dados para Recebimento (Brasil)
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Configure sua conta bancária ou chave Pix para receber 90% das vendas.
                                    </p>

                                    {message && <p className={`text-sm mb-4 ${message.includes('Erro') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chave Pix (Preferencial)</label>
                                            <input
                                                type="text"
                                                name="pixKey"
                                                value={formData.pixKey}
                                                onChange={handleChange}
                                                placeholder="CPF, Email, ou Aleatória"
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <p className="text-xs text-gray-500 mb-2 font-semibold">Ou Conta Bancária</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banco</label>
                                            <input
                                                type="text"
                                                name="bank"
                                                value={formData.bank}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agência</label>
                                                <input
                                                    type="text"
                                                    name="agency"
                                                    value={formData.agency}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta</label>
                                                <input
                                                    type="text"
                                                    name="account"
                                                    value={formData.account}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Conta</label>
                                            <select
                                                name="accountType"
                                                value={formData.accountType}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="corrente">Corrente</option>
                                                <option value="poupanca">Poupança</option>
                                            </select>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                                            >
                                                {loading ? 'Salvando...' : 'Salvar Dados'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankDetailsModal;
