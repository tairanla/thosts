import React, { useState } from 'react';
import { X, Eye, EyeOff, Shield } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface AdminAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (username: string, password: string) => Promise<boolean>;
    isLoading?: boolean;
    error?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    error = ''
}) => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;

        setIsSubmitting(true);
        try {
            const success = await onSubmit(username, password);
            if (success) {
                // Clear form on success
                setUsername('');
                setPassword('');
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isLoading && !isSubmitting) {
            setUsername('');
            setPassword('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
            <div className="bg-[var(--bg-primary)] rounded-lg shadow-2xl w-full max-w-md mx-4 border border-[var(--border-color)]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg">
                            <Shield size={20} className="text-[var(--accent-color)]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                {t.adminAuth.title}
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {t.adminAuth.subtitle}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading || isSubmitting}
                        className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} className="text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                                {t.adminAuth.username}
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={t.adminAuth.usernamePlaceholder}
                                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent"
                                disabled={isLoading || isSubmitting}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                                {t.adminAuth.password}
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t.adminAuth.passwordPlaceholder}
                                    className="w-full px-3 py-2 pr-10 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent"
                                    disabled={isLoading || isSubmitting}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                                    disabled={isLoading || isSubmitting}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Platform notice */}
                    <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
                        <p className="text-xs text-[var(--text-secondary)]">
                            {t.adminAuth.notice}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading || isSubmitting}
                            className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t.common.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isSubmitting || !username.trim() || !password.trim()}
                            className="flex-1 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading || isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t.adminAuth.authenticating}
                                </>
                            ) : (
                                <>
                                    <Shield size={16} />
                                    {t.adminAuth.authenticate}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};