
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Tag, ArrowLeft, Edit2 } from 'lucide-react';

const AdminCoupons = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: 10,
        validUntil: '',
        maxUses: '',
        maxUsesPerUser: 1
    });

    const resetForm = () => {
        setFormData({ code: '', discountPercentage: 10, validUntil: '', maxUses: '', maxUsesPerUser: 1 });
        setEditingId(null);
        setIsCreating(false);
    };

    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ['admin-coupons'],
        queryFn: async () => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const res = await fetch(`${apiUrl}/admin/coupons`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Failed to fetch coupons');
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const res = await fetch(`${apiUrl}/admin/coupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Erro ao criar cupom');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-coupons']);
            resetForm();
        },
        onError: (err) => alert(err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const res = await fetch(`${apiUrl}/admin/coupons/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Erro ao atualizar cupom');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-coupons']);
            resetForm();
        },
        onError: (err) => alert(err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const res = await fetch(`${apiUrl}/admin/coupons/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-coupons']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (coupon) => {
        setFormData({
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
            validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
            maxUses: coupon.maxUses || '',
            maxUsesPerUser: coupon.maxUsesPerUser || 1
        });
        setEditingId(coupon._id);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) return <div className="p-8 pt-24 text-center dark:text-white">Carregando...</div>;

    return (
        <div className="p-6 pt-24 min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Tag className="mr-2" /> Gerenciar Cupons
                    </h1>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            resetForm();
                            setIsCreating(!isCreating);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" /> {isCreating ? 'Cancelar' : 'Novo Cupom'}
                    </button>
                </div>
            </div>

            {isCreating && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8 border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h2 className="text-lg font-bold mb-4 dark:text-white">{editingId ? 'Editar Cupom' : 'Criar Novo Cupom'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                placeholder="EX: PROMO50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Desconto (%)</label>
                            <input
                                type="number"
                                value={formData.discountPercentage}
                                onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                min="1" max="100" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Validade (Opcional)</label>
                            <input
                                type="date"
                                value={formData.validUntil}
                                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Usos Global (Opcional)</label>
                            <input
                                type="number"
                                value={formData.maxUses}
                                onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Total de vendas com este cupom"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Usos por Usuário</label>
                            <input
                                type="number"
                                value={formData.maxUsesPerUser}
                                onChange={e => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                min="1"
                                placeholder="Padrão: 1"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Cancelar</button>
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 shadow-sm font-medium">{editingId ? 'Atualizar' : 'Salvar Cupom'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Desconto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usos (Global)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Validade</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {coupons.map((coupon) => (
                            <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{coupon.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">{coupon.discountPercentage}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'Ilimitado'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(coupon)}
                                        className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            
                                            deleteMutation.mutate(coupon._id);
                                        }}
                                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                    <p className="text-lg">Nenhum cupom criado.</p>
                                    <p className="text-sm mt-1">Clique em "Novo Cupom" para começar.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCoupons;
