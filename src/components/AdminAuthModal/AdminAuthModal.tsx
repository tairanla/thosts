import React from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface AdminAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<boolean>;
    isLoading?: boolean;
    error?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    error = ''
}) => {
    const { t } = useTranslation();

    const handleConfirm = async () => {
        const success = await onConfirm();
        if (success) {
            onClose();
        }
    };

    const handleClose = () => {
        if (!isLoading) {
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
                        disabled={isLoading}
                        className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} className="text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                            <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                                {t.adminAuth.systemDialogNotice}
                            </p>
                        </div>

                        {/* Platform-specific instructions */}
                        <div className="p-3 bg-[var(--accent-light)] rounded-lg">
                            <p className="text-xs text-[var(--text-secondary)]">
                                {t.adminAuth.notice}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t.common.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
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
                </div>
            </div>
        </div>
    );
};