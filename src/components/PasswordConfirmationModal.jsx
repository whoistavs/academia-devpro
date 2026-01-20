import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PasswordConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;


    const isGoogle = user?.authProvider === 'google';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isGoogle) {

                if (password !== 'EXCLUIR') {
                    throw new Error("Digite EXCLUIR para confirmar.");
                }
            } else {
                await api.verifyPassword(password);
            }


            await onConfirm();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Senha incorreta.');
        } finally {
            setLoading(false);
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title || "Confirmar Ação"}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                    {message || "Por favor, confirme esta ação."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        {isGoogle ? (
                            <>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Digite <strong>EXCLUIR</strong> para confirmar
                                </label>
                                <input
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                                    placeholder="EXCLUIR"
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 p-2 pr-10 border"
                                    placeholder="Sua senha"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordConfirmationModal;
