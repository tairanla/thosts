import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface PasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
}

export const PasswordDialog: React.FC<PasswordDialogProps> = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(password);
        setPassword('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--bg-primary)] p-6 rounded-lg shadow-xl w-96 border border-[var(--border-color)]">
                <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
                    Authentication Required
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Please enter your sudo password to save the hosts file.
                    <br />
                    <span className="text-xs opacity-75">(Password will be cached for this session)</span>
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md mb-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                            onClick={onClose}
                        >
                            {t.common.cancel}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-[var(--accent-color)] text-white rounded-md hover:bg-[var(--accent-hover)] transition-colors"
                        >
                            Authenticate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

