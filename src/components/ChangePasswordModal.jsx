import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const { t, language } = useTranslation();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const togglePassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError(t('auth.changePassword.errorMatch'));
            return;
        }

        // Strong Password Validation
        const minLength = 8;
        const hasNumber = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/;

        if (formData.newPassword.length < minLength) {
            setError(t('auth.forgotPassword.passwordLengthError'));
            return;
        }
        if (!hasNumber.test(formData.newPassword)) {
            setError(t('auth.forgotPassword.passwordNumberError'));
            return;
        }
        if (!hasSpecialChar.test(formData.newPassword)) {
            setError(t('auth.forgotPassword.passwordSpecialError'));
            return;
        }

        setLoading(true);

        try {
            await api.changePassword(formData.oldPassword, formData.newPassword, language);
            setSuccess(t('auth.changePassword.success'));
            setTimeout(() => {
                onClose();
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setSuccess('');
            }, 1500);
        } catch (err) {
            setError(err.message || t('auth.changePassword.errorGeneric'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('auth.changePassword.title')}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Old Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.changePassword.currentPassword')}</label>
                        <div className="relative">
                            <input
                                type={showPasswords.old ? "text" : "password"}
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 pr-10 border"
                                required
                            />
                            <button type="button" onClick={() => togglePassword('old')} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                                {showPasswords.old ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.changePassword.newPassword')}</label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 pr-10 border"
                                required
                            />
                            <button type="button" onClick={() => togglePassword('new')} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                                {showPasswords.new ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.changePassword.confirmPassword')}</label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 pr-10 border"
                                required
                            />
                            <button type="button" onClick={() => togglePassword('confirm')} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                                {showPasswords.confirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    {success && <p className="text-green-500 text-sm font-medium">{success}</p>}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {t('auth.changePassword.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? t('auth.changePassword.saving') : t('auth.changePassword.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
