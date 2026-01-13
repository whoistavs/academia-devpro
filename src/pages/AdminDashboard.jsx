import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Users, ShieldAlert, Edit, BookOpen, DollarSign, TrendingUp, Wallet, ArrowUpRight, Check, Ban, Clock, X, Tag } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TableSkeleton from '../components/TableSkeleton';
import CourseSkeleton from '../components/CourseSkeleton';
import BankDetailsModal from '../components/BankDetailsModal';

import QRCode from 'react-qr-code';
import { generatePixPayload } from '../utils/pix';

const ProfessorDebtsSection = () => {
    const queryClient = useQueryClient();
    const { data: debts = [], isLoading } = useQuery({
        queryKey: ['professorDebts'],
        queryFn: api.getProfessorDebts
    });

    
    const [payModal, setPayModal] = useState(null);
    const [amountToPay, setAmountToPay] = useState('');
    const [notes, setNotes] = useState('Pagamento Comissão DevPro');

    const openPayModal = (debt) => {
        if (!debt.pixKey || debt.pixKey === 'Não configurada') {
            return alert("O professor não configurou a chave Pix.");
        }
        setPayModal(debt);
        setAmountToPay(debt.balance.toFixed(2));
    };

    const handleConfirmPay = async () => {
        if (!payModal) return;
        const amount = parseFloat(amountToPay);
        if (isNaN(amount) || amount <= 0) return alert("Valor inválido");

        try {
            await api.registerManualPayout({ professorId: payModal.professorId, amount, notes });
            alert("Pagamento registrado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['professorDebts'] });
            queryClient.invalidateQueries({ queryKey: ['financials'] });
            setPayModal(null);
        } catch (e) {
            alert("Erro ao registrar pagamento: " + (e.message || "Erro desconhecido"));
        }
    };

    
    let pixPayload = '';
    if (payModal && amountToPay) {
        const amt = parseFloat(amountToPay);
        if (!isNaN(amt) && amt > 0) {
            pixPayload = generatePixPayload({
                key: payModal.pixKey,
                name: payModal.name,
                city: 'SAO PAULO',
                amount: amt,
                txid: 'DEVPROPAY'
            });
        }
    }

    if (isLoading) return <TableSkeleton rows={2} />;
    if (debts.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-purple-200 dark:border-purple-900">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
                <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-100 flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    Contas a Pagar (Professores)
                </h2>
            </div>
            <div className="p-6">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {debts.map(d => (
                        <li key={d.professorId} className="py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {d.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Chave Pix: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{d.pixKey}</span>
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    Vendas: R$ {d.totalEarned.toFixed(2)} | Já Pago: R$ {d.totalPaid.toFixed(2)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <span className="block text-sm text-gray-500 dark:text-gray-400">Saldo a Pagar</span>
                                    <span className="block text-xl font-bold text-green-600 dark:text-green-400">R$ {d.balance.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => openPayModal(d)}
                                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium transition-colors"
                                >
                                    <Check className="w-4 h-4 mr-1" /> Pagar Manualmente
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {}
            {payModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in relative">
                        <button
                            onClick={() => setPayModal(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Wallet className="w-6 h-6 mr-2 text-green-600" />
                            Pagamento via Pix
                        </h3>

                        <div className="mb-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pagando para:</p>
                            <p className="text-lg font-semibold dark:text-white">{payModal.name}</p>
                            <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 inline-block px-2 py-1 rounded mt-1">
                                {payModal.pixKey}
                            </p>
                        </div>

                        <div className="mb-6 flex justify-center">
                            {pixPayload && (
                                <div className="p-4 bg-white rounded-lg shadow-inner border border-gray-200">
                                    <QRCode value={pixPayload} size={180} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor a Pagar (R$)</label>
                                <input
                                    type="number"
                                    value={amountToPay}
                                    onChange={(e) => setAmountToPay(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Copia e Cola</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        readOnly
                                        value={pixPayload}
                                        className="block w-full rounded-l-md border-gray-300 bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 sm:text-xs"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(pixPayload);
                                            alert("Copiado!");
                                        }}
                                        className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 sm:text-sm"
                                    >
                                        Copiar
                                    </button>
                                </div>
                            </div>

                            <hr className="dark:border-gray-700" />

                            <button
                                onClick={handleConfirmPay}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Confirmar Pagamento Realizado
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PendingPaymentsSection = () => {
    const queryClient = useQueryClient();
    const { data: approvals = [], isLoading } = useQuery({
        queryKey: ['approvals'],
        queryFn: api.getPendingApprovals
    });

    const handleApprove = async (id) => {
        console.log("Botão Aprovar clicado para ID:", id);
        
        console.log("Enviando requisição de aprovação...");
        try {
            const res = await api.approveTransaction(id);
            console.log("Resposta da aprovação:", res);
            alert("Pagamento aprovado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            queryClient.invalidateQueries({ queryKey: ['financials'] });
        } catch (e) {
            console.error("Erro na aprovação:", e);
            alert("Erro ao aprovar: " + e.message);
        }
    };

    const handleReject = async (id) => {
        console.log("Botão Rejeitar clicado para ID:", id);
        
        try {
            await api.rejectTransaction(id);
            alert("Pagamento rejeitado!");
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
        } catch (e) {
            console.error("Erro na rejeição:", e);
            alert("Erro ao rejeitar: " + e.message);
        }
    };

    if (isLoading) return <TableSkeleton rows={2} />;
    if (approvals.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-blue-200 dark:border-blue-900">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-100 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Aprovações de Pagamento Pendentes ({approvals.length})
                </h2>
            </div>
            <div className="p-6">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {approvals.map(t => (
                        <li key={t._id} className="py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {t.courseTitle}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Aluno: <span className="font-semibold">{t.buyerName}</span> ({t.buyerEmail})
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Valor: R$ {t.amount?.toFixed(2)} • ID: {t.mpPaymentId}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleApprove(t._id)}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                                >
                                    <Check className="w-4 h-4 mr-1" /> Aprovar
                                </button>
                                <button
                                    onClick={() => handleReject(t._id)}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
                                >
                                    <Ban className="w-4 h-4 mr-1" /> Rejeitar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showBankModal, setShowBankModal] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    
    React.useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    
    const { data: users = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: api.getUsers,
        enabled: user?.role === 'admin'
    });

    const { data: courses = [], isLoading: loadingCourses } = useQuery({
        queryKey: ['courses', 'all'], 
        queryFn: () => api.getCourses("all=true"),
        enabled: user?.role === 'admin'
    });

    const { data: financials, isLoading: loadingFinancials, error: financialError } = useQuery({
        queryKey: ['financials'],
        queryFn: api.getFinancials,
        enabled: user?.role === 'admin'
    });


    
    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.dashboard.confirmDelete'))) return;
        try {
            await api.adminDeleteUser(id);
            
            queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch (err) {
            alert('Erro ao excluir usuário.');
        }
    };

    const handleRoleChange = async (id, currentRole) => {
        let newRole = 'student';
        if (currentRole === 'student' || !currentRole) newRole = 'professor';
        else if (currentRole === 'professor') newRole = 'admin';
        else if (currentRole === 'admin') newRole = 'student';

        if (!window.confirm(t('admin.dashboard.confirmRole', { role: newRole }))) return;

        try {
            await api.updateUserRole(id, newRole);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch (err) {
            console.error(err);
            alert(err.message || 'Erro ao atualizar função.');
        }
    };

    const handleCourseStatus = async (courseId, status) => {
        if (!window.confirm(t('admin.dashboard.confirmStatus', { status }))) return;
        try {
            await api.updateCourseStatus(courseId, status);
            queryClient.invalidateQueries({ queryKey: ['courses', 'all'] });
            queryClient.invalidateQueries({ queryKey: ['courses'] }); 
        } catch (e) {
            alert("Erro ao moderar curso");
        }
    };

    const handleWithdraw = async () => {
        if (!financials || financials.summary.availableBalance <= 0) return;

        const pixKey = user.bankAccount?.pixKey;
        const message = pixKey
            ? `Confirma a transferência de R$ ${financials.summary.availableBalance.toFixed(2)} para a chave Pix: ${pixKey}?`
            : `Confirma o saque de R$ ${financials.summary.availableBalance.toFixed(2)} para a conta configurada?`;

        if (!window.confirm(message)) return;

        setWithdrawing(true);
        try {
            await api.requestPayout();
            alert(pixKey ? "Pix enviado com sucesso! Verifique sua conta." : "Saque solicitado! O valor cairá na sua conta em breve.");
            queryClient.invalidateQueries({ queryKey: ['financials'] });
        } catch (e) {
            alert(e.message);
        } finally {
            setWithdrawing(false);
        }
    };

    if (!user || user.role !== 'admin') return null;

    const pendingCourses = courses.filter(c => c.status === 'pending');

    
    const getTitle = (c) => typeof c.title === 'string' ? c.title : (c.title?.pt || c.title?.en || "Curso");

    return (
        <main className="flex-grow pt-24 pb-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <ShieldAlert className="w-8 h-8 mr-3 text-red-600" />
                        {t('admin.dashboard.title')}
                    </h1>
                    <button
                        onClick={() => navigate('/admin/coupons')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center shadow-md"
                    >
                        <Tag className="w-4 h-4 mr-2" /> Gerenciar Cupons
                    </button>
                </div>

                {}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" />
                            Visão Geral Financeira
                        </h2>
                        {financials && (
                            <button
                                onClick={() => setShowBankModal(true)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Wallet className="w-4 h-4 mr-2 text-green-500" />
                                Configurar Conta Itaú (Admin)
                            </button>
                        )}
                    </div>

                    {loadingFinancials && (
                        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                            <p className="text-gray-500">Carregando financeiro...</p>
                        </div>
                    )}

                    {financialError && (
                        <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="font-bold">Erro ao carregar dados financeiros:</p>
                            <p>{financialError.message}</p>
                            {financialError.message.includes('403') && (
                                <p className="mt-2 text-sm">
                                    Sua sessão pode estar expirada. Tente fazer <button onClick={() => navigate('/login')} className="underline font-bold">login novamente</button>.
                                </p>
                            )}
                        </div>
                    )}

                    {financials && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium uppercase">Vendas Totais</p>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ {financials.summary.totalSales.toFixed(2)}</h3>
                                        </div>
                                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                            <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    </div>
                                </div>

                                {}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
                                    <div className="flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <p className="text-gray-500 text-sm font-medium uppercase">Sua Comissão (Saldo)</p>
                                                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {financials.summary.availableBalance.toFixed(2)}</h3>
                                                <p className="text-xs text-gray-400">Total Acumulado: R$ {financials.summary.totalFees.toFixed(2)}</p>
                                            </div>
                                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-gray-400">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium uppercase">A Pagar Aos Pro.</p>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ {financials.summary.totalPayouts.toFixed(2)}</h3>
                                        </div>
                                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                                            <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {}
                <div className="mb-8">
                    <ProfessorDebtsSection />
                </div>

                {}
                {
                    <div className="mb-8">
                        <PendingPaymentsSection />
                    </div>
                }

                {}
                {
                    loadingCourses ? (
                        <div className="mb-8"><TableSkeleton rows={2} /></div>
                    ) : pendingCourses.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-amber-200 dark:border-amber-700 mb-8">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
                                <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-100 flex items-center">
                                    <ShieldAlert className="w-5 h-5 mr-2" />
                                    {t('admin.dashboard.pendingApproval')} ({pendingCourses.length})
                                </h2>
                            </div>
                            <div className="p-6">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {pendingCourses.map(course => (
                                        <li key={course.id} className="py-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {getTitle(course)}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Autor ID: {course.authorId} | Categoria: {course.category}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleCourseStatus(course._id || course.id, 'published')}
                                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                                                >
                                                    {t('admin.dashboard.approve')}
                                                </button>
                                                <button
                                                    onClick={() => handleCourseStatus(course._id || course.id, 'rejected')}
                                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
                                                >
                                                    {t('admin.dashboard.reject')}
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )
                }


                {}
                {
                    loadingCourses ? (
                        <div className="mb-8"><TableSkeleton rows={3} /></div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-900 mb-8">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
                                <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200 flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    {t('admin.dashboard.manageCourses')} ({courses.length})
                                </h2>
                            </div>
                            <div className="p-6">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                                    {courses.map(course => (
                                        <li key={course.id} className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 px-2 rounded -mx-2">
                                            <div className="flex items-center">
                                                {course.status === 'published' ? (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-3" title="Publicado"></span>
                                                ) : course.status === 'pending' ? (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-3 animate-pulse" title="Pendente"></span>
                                                ) : (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-3" title="Rascunho/Outro"></span>
                                                )}
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {getTitle(course)}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {course.status.toUpperCase()} | {t('admin.dashboard.lessons')}: {course.totalLessons}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => navigate(`/professor/editor/${(course._id || course.id).toString().trim()}`)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                                    title="Editar Curso"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )
                }

                {}

                {
                    loadingUsers ? (
                        <TableSkeleton rows={8} />
                    ) : (
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    {t('admin.dashboard.registeredUsers')} ({users.length})
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-gray-600 dark:text-gray-300">
                                    <thead className="bg-gray-100 dark:bg-gray-700 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">{t('admin.dashboard.table.name')}</th>
                                            <th className="px-6 py-4">{t('admin.dashboard.table.email')}</th>
                                            <th className="px-6 py-4">{t('admin.dashboard.table.role')}</th>
                                            <th className="px-6 py-4 text-right">{t('admin.dashboard.table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 font-medium flex items-center">
                                                    {u.avatar && <img src={u.avatar} alt="" className="w-6 h-6 rounded-full mr-2 object-cover" />}
                                                    {u.name}
                                                </td>
                                                <td className="px-6 py-4">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => u._id !== user.id && handleRoleChange(u._id, u.role)}
                                                        className={`px - 3 py - 1 rounded - full text - xs font - bold transition - all transform active: scale - 95
                                                        ${u.role === 'admin' ? 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200' :
                                                                u.role === 'professor' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200' :
                                                                    'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                                                            } `}
                                                        title={u._id !== user.id ? "Alterar: Estudante -> Professor -> Admin" : "Atual"}
                                                        disabled={u._id === user.id}
                                                        style={{ minWidth: '80px' }}
                                                    >
                                                        {(u.role || 'student').toUpperCase()}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {u._id !== user.id && (
                                                        <button
                                                            onClick={() => handleDelete(u._id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                                            title="Excluir Usuário"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                                                    {t('admin.dashboard.noUsers')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }
            </div >
            <BankDetailsModal isOpen={showBankModal} onClose={() => setShowBankModal(false)} />
        </main >
    );
};

export default AdminDashboard;
