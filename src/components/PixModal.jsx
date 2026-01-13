import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Copy, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PixModal = ({ isOpen, onClose, data, onConfirm }) => {
    const { login, user } = useAuth();
    const [confirming, setConfirming] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    
    const [currentData, setCurrentData] = React.useState(data);

    React.useEffect(() => {
        setCurrentData(data);
        setCouponCode('');
        setCouponMessage('');
    }, [data]);

    if (!isOpen || !currentData) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(currentData.payload);
        alert('Código Pix copiado!');
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponMessage('');
        try {
            
            const res = await api.createPreference(currentData.courseId || data.courseId, couponCode);
            setCurrentData({ ...res, courseId: currentData.courseId || data.courseId }); 
            setCouponMessage({ type: 'success', text: `Desconto de R$ ${res.discount} aplicado!` });
        } catch (e) {
            setCouponMessage({ type: 'error', text: 'Cupom inválido ou expirado.' });
            console.error(e);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            
            
            
            const res = await api.confirmManualPayment(currentData.courseId, currentData.txId, couponCode);
            const token = localStorage.getItem('token');
            login({ ...user, purchasedCourses: res.purchasedCourses }, token);
            onConfirm();
            window.location.reload();
        } catch (e) {
            alert("Erro ao confirmar pagamento.");
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                <div className="p-6 text-center">
                    <div className="flex justify-between items-center mb-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Pix.svg" alt="Pix" className="h-8" />
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pague com Pix</h2>

                    {}
                    {(!currentData.discount || parseFloat(currentData.discount) === 0) && (
                        <div className="mb-4 flex gap-2">
                            <input
                                type="text"
                                placeholder="Cupom de desconto"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !couponCode}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {couponLoading ? '...' : 'Aplicar'}
                            </button>
                        </div>
                    )}

                    {couponMessage && (
                        <p className={`text-sm mb-4 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {couponMessage.text}
                        </p>
                    )}

                    {currentData.discount > 0 && (
                        <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-2 rounded text-green-700 dark:text-green-300 text-sm">
                            Cupom <strong>{couponCode}</strong> aplicado! Desconto: R$ {currentData.discount}
                        </div>
                    )}


                    <div className="bg-white p-4 rounded-xl shadow-inner inline-block mb-6 border border-gray-200">
                        <QRCode value={currentData.payload} size={180} />
                    </div>

                    <div className="mb-6">
                        {currentData.originalPrice && currentData.originalPrice > currentData.amount && (
                            <p className="text-sm text-gray-400 line-through">R$ {parseFloat(currentData.originalPrice).toFixed(2)}</p>
                        )}
                        <p className="text-3xl font-bold text-gray-900 dark:text-white text-green-600">
                            R$ {parseFloat(currentData.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">Pagamento direto para admin do sistema</p>
                    </div>

                    <div className="relative mb-6">
                        <input
                            type="text"
                            readOnly
                            value={currentData.payload}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 text-xs text-gray-600 dark:text-gray-300 font-mono"
                        />
                        <button
                            onClick={handleCopy}
                            className="absolute right-2 top-2 p-1.5 bg-white dark:bg-gray-600 rounded-md shadow hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            title="Copiar Código"
                        >
                            <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </button>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4 mb-6 text-left">
                        <div className="flex">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mr-2 flex-shrink-0" />
                            <p className="text-xs text-amber-800 dark:text-amber-200">
                                <strong>Importante:</strong> Após realizar o pagamento no seu banco, clique no botão abaixo para liberar seu acesso imediatamente.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={confirming}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center"
                    >
                        {confirming ? 'Verificando...' : 'Já realizei o pagamento'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PixModal;
