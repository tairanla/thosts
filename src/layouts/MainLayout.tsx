
import { confirm } from '@tauri-apps/plugin-dialog';
import { RefreshCw, Save } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { PasswordDialog } from '../components/Dialog/PasswordDialog';
import { Editor } from '../components/Editor/Editor';
import { Settings } from '../components/Settings/Settings';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { HostsProfile, hostsService } from '../services/hostsService';
import { profileStorage } from '../utils/storage';

export const MainLayout: React.FC = () => {
    const { t } = useTranslation();
    const [selectedId, setSelectedId] = useState('1');
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState(''); // Track original content for comparison
    const [systemPath, setSystemPath] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [pendingSaveContent, setPendingSaveContent] = useState<string | null>(null);

    const [profiles, setProfiles] = useState<HostsProfile[]>(() => {
        const saved = profileStorage.load();
        return saved || [
            { id: '1', name: 'System Hosts', active: true, type: 'system', content: '' },
            { id: '2', name: 'Dev Environment', active: false, type: 'local', content: '# Dev Hosts\n127.0.0.1 dev.local' },
            { id: '3', name: 'Staging', active: true, type: 'remote', content: '# Staging Hosts\n192.168.1.100 staging.local' },
        ];
    });

    // Save profiles when they change
    useEffect(() => {
        profileStorage.save(profiles);
    }, [profiles]);

    // Update system hosts name when language changes
    useEffect(() => {
        setProfiles(prev => prev.map(p =>
            p.id === '1' ? { ...p, name: t.common.systemHosts } : p
        ));
    }, [t.common.systemHosts]);

    useEffect(() => {
        loadSystemHosts();
    }, []);

    // When selecting a profile, update content and original content
    useEffect(() => {
        if (selectedId === 'settings') return;

        const profile = profiles.find(p => p.id === selectedId);
        if (profile) {
            setContent(profile.content);
            setOriginalContent(profile.content); // Set original content when switching profiles
        }
    }, [selectedId, profiles]);

    // Extract original system hosts content from file (remove profile sections)
    const extractOriginalSystemHosts = (fileContent: string): string => {
        // Check if file contains profile markers
        const profileMarkerRegex = /^# === .+ ===$/m;
        if (!profileMarkerRegex.test(fileContent)) {
            // No profile markers, return content as-is
            return fileContent;
        }

        // Find the first profile marker and extract content before it
        const lines = fileContent.split('\n');
        const firstMarkerIndex = lines.findIndex(line => /^# === .+ ===$/.test(line));

        if (firstMarkerIndex === -1) {
            return fileContent;
        }

        // Return content before the first profile marker (trimmed)
        return lines.slice(0, firstMarkerIndex).join('\n').trim();
    };

    const loadSystemHosts = async () => {
        try {
            setLoading(true);
            const path = await hostsService.getHostsPath();
            setSystemPath(path);
            const fileContent = await hostsService.readHosts(path);

            // Extract original system hosts content (without profiles)
            const originalSystemContent = extractOriginalSystemHosts(fileContent);

            setProfiles(prev => {
                const updated = prev.map(p =>
                    p.id === '1' ? { ...p, content: originalSystemContent } : p
                );

                if (selectedId === '1') {
                    // Set originalContent to the ACTUAL FILE CONTENT from disk
                    // This ensures isContentModified is false if the calculated merged content matches the file
                    setOriginalContent(fileContent);

                    // Calculate and show merged content if there are active profiles
                    const activeProfiles = updated.filter(p =>
                        p.active &&
                        p.id !== '1' &&
                        (p.type === 'local' || p.type === 'remote') &&
                        p.content.trim().length > 0
                    );

                    if (activeProfiles.length > 0) {
                        // Show merged content in editor
                        const parts: string[] = [];
                        if (originalSystemContent.trim()) {
                            parts.push(originalSystemContent.trim());
                        }
                        activeProfiles.forEach((profile) => {
                            if (profile.content.trim()) {
                                parts.push('');
                                parts.push(`# === ${profile.name} ===`);
                                parts.push(profile.content.trim());
                            }
                        });
                        setContent(parts.join('\n'));
                    } else {
                        // No active profiles, show just system content
                        setContent(originalSystemContent);
                    }
                }

                return updated;
            });

            setStatus(t.status.loaded);
        } catch (error) {
            console.error('Failed to load hosts:', error);
            setStatus(t.status.error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate merged hosts content: system hosts + active local/remote profiles
    // Note: This function is currently unused in the render path as we use direct content manipulation
    // for immediate feedback, but it might be useful for verification or export features in the future.
    /*
    const calculateMergedHosts = useCallback((): string => {
        // ... implementation ...
    }, [profiles]);
    */

    const handlePasswordSubmit = async (password: string) => {
        setShowPasswordDialog(false);
        if (!pendingSaveContent) return;

        try {
            setLoading(true);
            const success = await hostsService.setSudoPassword(password);
            if (success) {
                // Password valid and cached, retry save
                await hostsService.writeHostsWithAdmin(systemPath, pendingSaveContent);

                // Update state on success
                const newSystemContent = extractOriginalSystemHosts(pendingSaveContent);
                setProfiles(prev => prev.map(p =>
                    p.id === '1' ? { ...p, content: newSystemContent } : p
                ));
                setOriginalContent(pendingSaveContent);
                setStatus(t.status.saved);
            } else {
                setStatus('Invalid password');
            }
        } catch (error) {
            console.error('Save failed:', error);
            setStatus(t.status.failedAdmin);
        } finally {
            setLoading(false);
            setPendingSaveContent(null);
            setTimeout(() => setStatus(''), 3000);
        }
    };

    const handleSave = useCallback(async () => {
        if (selectedId === '1') {
            // For system hosts, always calculate merged content (even if content hasn't changed in editor)
            // This allows saving when profiles are toggled
            if (!systemPath) return;

            // Use content directly as merged content.
            // In System Hosts view, the editor content IS the merged content we want to save.
            // This ensures manual edits in the editor are preserved.
            const mergedContent = content;

            // Check if merged content is different from what's currently in the file
            // We compare with originalContent (the actual system hosts file content)
            if (mergedContent === originalContent) {
                // No changes to save
                return;
            }

            // First, try to save without admin privileges
            try {
                setLoading(true);
                await hostsService.writeHosts(systemPath, mergedContent);

                // Update local state
                // 1. Update profiles: extract pure system hosts content
                const newSystemContent = extractOriginalSystemHosts(mergedContent);
                setProfiles(prev => prev.map(p =>
                    p.id === '1' ? { ...p, content: newSystemContent } : p
                ));

                // 2. Update original content to reflect what's in the file now
                setOriginalContent(mergedContent);

                // 3. Editor content is already up to date (mergedContent)

                setStatus(t.status.saved);
                setTimeout(() => setStatus(''), 3000);
                setLoading(false);
            } catch (error) {
                console.error('Failed to save hosts without admin privileges:', error);

                // Check if we can do silent admin save (cached password)
                try {
                    setLoading(true);
                    await hostsService.writeHostsWithAdmin(systemPath, mergedContent);

                    // Success with cached password or pkexec
                    const newSystemContent = extractOriginalSystemHosts(mergedContent);
                    setProfiles(prev => prev.map(p =>
                        p.id === '1' ? { ...p, content: newSystemContent } : p
                    ));
                    setOriginalContent(mergedContent);
                    setStatus(t.status.saved);
                    setTimeout(() => setStatus(''), 3000);
                    setLoading(false);
                    return;
                } catch (adminError) {
                    // If silent save failed, prompts user
                    // On Linux, if pkexec was canceled or not available, we might want to try password input
                    // But first, let's fall back to standard flow or password dialog
                    console.log("Silent admin save failed, trying dialogs", adminError);
                }

                // If we are here, it means:
                // 1. Normal write failed
                // 2. writeHostsWithAdmin failed (either user canceled system dialog, or no cached password)

                // Ask user: "System Dialog" or "Enter Password (Cache)"?
                // For simplicity, let's use the password dialog if the platform is Linux and error suggests auth issue
                // But wait, writeHostsWithAdmin ALREADY tries pkexec (System Dialog).
                // If it failed, it means user canceled it or it's not available.

                // Let's offer the Password Dialog as a fallback/alternative specifically for "Session Mode"
                setPendingSaveContent(mergedContent);
                setShowPasswordDialog(true);
                setLoading(false);
            }
        } else {
            // Saving local profile
            setProfiles(prev => prev.map(p =>
                p.id === selectedId ? { ...p, content } : p
            ));
            setOriginalContent(content); // Update original content after save
            setStatus(t.status.savedLocal);
            setTimeout(() => setStatus(''), 3000);
        }
    }, [content, originalContent, selectedId, systemPath]);

    // Keyboard shortcut handler (Ctrl+S / Cmd+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl+S (Windows/Linux) or Cmd+S (macOS)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();

                // Only save if content has been modified and not in settings
                if (selectedId !== 'settings' && content !== originalContent && !loading) {
                    handleSave();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [content, originalContent, selectedId, loading, handleSave]);


    const handleToggleProfile = useCallback((id: string, active: boolean) => {
        setProfiles(prev => {
            const updated = prev.map(p =>
                p.id === id ? { ...p, active } : p
            );

            // If currently viewing system hosts, update content to show merged preview
            if (selectedId === '1') {
                // Get the system profile content (original, without profiles)
                const systemProfile = updated.find(p => p.id === '1');
                const systemContent = systemProfile?.content || '';

                // Calculate merged content with updated profiles
                const activeProfiles = updated.filter(p =>
                    p.active &&
                    p.id !== '1' &&
                    (p.type === 'local' || p.type === 'remote') &&
                    p.content.trim().length > 0
                );

                let newMergedContent: string;
                if (activeProfiles.length === 0) {
                    // No active profiles, show just system content
                    newMergedContent = systemContent;
                } else {
                    // Build merged content preview
                    const parts: string[] = [];

                    if (systemContent.trim()) {
                        parts.push(systemContent.trim());
                    }

                    activeProfiles.forEach((profile) => {
                        if (profile.content.trim()) {
                            parts.push('');
                            parts.push(`# === ${profile.name} ===`);
                            parts.push(profile.content.trim());
                        }
                    });

                    newMergedContent = parts.join('\n');
                }

                setContent(newMergedContent);

                // Auto-save to system hosts file if content changed
                // Use a separate effect-like approach to handle async save
                if (systemPath && newMergedContent !== originalContent) {
                    // Calculate merged content using the updated profiles
                    const saveMergedContent = async () => {
                        try {
                            setLoading(true);
                            await hostsService.writeHosts(systemPath, newMergedContent);

                            // Update originalContent to reflect what's in the file now
                            setOriginalContent(newMergedContent);

                            setStatus(t.status.saved);
                            setTimeout(() => setStatus(''), 3000);
                            setLoading(false);
                        } catch (error) {
                            console.error('Failed to save hosts without admin privileges:', error);

                            // If save failed, request admin permission using Tauri dialog
                            const hasPermission = await hostsService.requestAdminPermission(
                                t.adminAuth.title,
                                t.adminAuth.systemDialogNotice,
                                t.adminAuth.authenticate,
                                t.common.cancel
                            );
                            if (!hasPermission) {
                                setStatus(t.adminAuth.permissionDenied);
                                setTimeout(() => setStatus(''), 3000);
                                setLoading(false);
                                return;
                            }

                            // User confirmed, try to save with admin privileges
                            try {
                                await hostsService.writeHostsWithAdmin(systemPath, newMergedContent);

                                // Update local state on success
                                setOriginalContent(newMergedContent);
                                setContent(newMergedContent);

                                setStatus(t.status.saved);
                                setTimeout(() => setStatus(''), 3000);
                                setLoading(false);
                            } catch (adminError) {
                                console.error('Failed to save hosts with admin privileges:', adminError);
                                setStatus(t.status.failedAdmin);
                                setTimeout(() => setStatus(''), 3000);
                                setLoading(false);
                            }
                        }
                    };

                    // Use Promise.resolve().then() to defer execution after state update
                    Promise.resolve().then(() => {
                        saveMergedContent();
                    });
                }

                // Keep originalContent as the actual system hosts content (without profiles)
                // This ensures isContentModified works correctly
            }

            return updated;
        });
    }, [selectedId, systemPath, originalContent]);

    // Check if content has been modified
    // Simply check if current editor content differs from original
    const isContentModified = content !== originalContent;

    const handleAddProfile = async () => {
        const name = prompt(t.dialog.addProfile.message);
        if (!name) return;

        // Get current system hosts content
        let systemContent = '';
        try {
            const path = await hostsService.getHostsPath();
            systemContent = await hostsService.readHosts(path);
        } catch (error) {
            console.error('Failed to load system hosts for new profile:', error);
            systemContent = '# Failed to load system hosts\n';
        }

        const newProfile: HostsProfile = {
            id: Date.now().toString(),
            name,
            content: systemContent,
            active: false,
            type: 'local'
        };

        setProfiles(prev => [...prev, newProfile]);
        setSelectedId(newProfile.id);
    };

    const handleDeleteProfile = useCallback(async (id: string) => {
        const confirmed = await confirm(t.dialog.deleteProfile.message, {
            title: t.dialog.deleteProfile.title,
            kind: 'warning',
            okLabel: t.dialog.deleteProfile.confirm,
            cancelLabel: t.dialog.deleteProfile.cancel
        });

        if (!confirmed) return;

        setProfiles(prev => {
            const updated = prev.filter(p => p.id !== id);

            // If the deleted profile was selected, switch to system hosts
            if (selectedId === id) {
                setSelectedId('1');
            }

            return updated;
        });
    }, [selectedId]);

    return (
        <div className="app-container">
            <Sidebar
                profiles={profiles}
                onSelect={setSelectedId}
                selectedId={selectedId}
                onToggle={handleToggleProfile}
                onAddProfile={handleAddProfile}
                onDeleteProfile={handleDeleteProfile}
            />

            <div className="main-content">
                <div className="toolbar justify-between">
                    <div className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                        {selectedId === 'settings' ? t.common.settings : profiles.find(p => p.id === selectedId)?.name}
                        {selectedId !== 'settings' && status && <span className="text-xs text-[var(--text-tertiary)]">({status})</span>}
                    </div>

                    {selectedId !== 'settings' && (
                        <div className="flex gap-2">
                            <button
                                className="icon-btn"
                                title={t.common.refresh}
                                onClick={loadSystemHosts}
                                disabled={loading}
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                className="btn btn-primary"
                                title={t.common.save}
                                onClick={handleSave}
                                disabled={loading || !isContentModified}
                            >
                                <Save size={18} />
                                <span>{t.common.save}</span>
                            </button>
                        </div>
                    )}
                </div>

                {selectedId === 'settings' ? (
                    <Settings />
                ) : (
                    <Editor content={content} onChange={setContent} />
                )}
            </div>

            <PasswordDialog
                isOpen={showPasswordDialog}
                onClose={() => {
                    setShowPasswordDialog(false);
                    setPendingSaveContent(null);
                }}
                onSubmit={handlePasswordSubmit}
            />
        </div>
    );
};
