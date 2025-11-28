
import { RefreshCw, Save } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { AdminAuthModal } from '../components/AdminAuthModal/AdminAuthModal';
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
    const [showAdminAuth, setShowAdminAuth] = useState(false);
    const [adminAuthError, setAdminAuthError] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);

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
                    // Set originalContent to the actual system hosts content (without profiles)
                    setOriginalContent(originalSystemContent);
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

            setStatus('Loaded system hosts');
        } catch (error) {
            console.error('Failed to load hosts:', error);
            setStatus('Error loading hosts');
        } finally {
            setLoading(false);
        }
    };

    // Calculate merged hosts content: system hosts + active local/remote profiles
    const calculateMergedHosts = useCallback((): string => {
        // Always use the original system hosts content from the profile (not the merged preview)
        // This ensures we don't double-merge when saving
        const systemProfile = profiles.find(p => p.id === '1');
        const systemContent = systemProfile?.content || '';

        // Get active local and remote profiles (excluding system profile)
        const activeProfiles = profiles.filter(p =>
            p.active &&
            p.id !== '1' &&
            (p.type === 'local' || p.type === 'remote') &&
            p.content.trim().length > 0
        );

        if (activeProfiles.length === 0) {
            // No active profiles, just return system content
            return systemContent;
        }

        // Build merged content
        const parts: string[] = [];

        // Start with system hosts (original content, not merged)
        if (systemContent.trim()) {
            parts.push(systemContent.trim());
        }

        // Add separator and active profiles
        activeProfiles.forEach((profile) => {
            if (profile.content.trim()) {
                parts.push('');
                parts.push(`# === ${profile.name} ===`);
                parts.push(profile.content.trim());
            }
        });

        return parts.join('\n');
    }, [profiles]);

    const handleSave = useCallback(async () => {
        if (selectedId === '1') {
            // For system hosts, always calculate merged content (even if content hasn't changed in editor)
            // This allows saving when profiles are toggled
            if (!systemPath) return;

            // Calculate merged content: system hosts + active local/remote profiles
            const mergedContent = calculateMergedHosts();

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
                // Note: We don't update system profile content with merged content
                // System profile content should remain as the original system hosts (without profiles)
                // The merged content is what gets written to the file
                setOriginalContent(mergedContent); // Update original content to reflect what's in the file now

                // Update the editor content to match what was saved
                setContent(mergedContent);

                setStatus('Saved successfully');
                setTimeout(() => setStatus(''), 3000);
                setLoading(false);
            } catch (error) {
                console.error('Failed to save hosts without admin privileges:', error);

                // If save failed, show admin auth dialog
                setAdminAuthError('');
                setShowAdminAuth(true);
                setLoading(false);
            }
        } else {
            // Saving local profile
            setProfiles(prev => prev.map(p =>
                p.id === selectedId ? { ...p, content } : p
            ));
            setOriginalContent(content); // Update original content after save
            setStatus('Profile saved (local)');
            setTimeout(() => setStatus(''), 3000);
        }
    }, [content, originalContent, selectedId, systemPath, calculateMergedHosts]);

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

    const handleAdminAuth = async (): Promise<boolean> => {
        if (!systemPath) return false;

        setIsAuthenticating(true);
        setAdminAuthError('');

        try {
            // Call the system authentication dialog with timeout
            // This will trigger:
            // - Windows: UAC dialog
            // - Linux: polkit/pkexec dialog or sudo password prompt
            // - macOS: sudo password prompt or system authentication dialog
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Operation timeout')), 300000); // 5 minutes timeout
            });

            // Calculate merged content before saving
            const mergedContent = calculateMergedHosts();

            await Promise.race([
                hostsService.writeHostsWithAdmin(systemPath, mergedContent),
                timeoutPromise
            ]);

            // Update local state on success
            // Note: We don't update system profile content with merged content
            // System profile content should remain as the original system hosts (without profiles)
            setOriginalContent(mergedContent); // Update original content to reflect what's in the file now

            // Update the editor content to match what was saved
            setContent(mergedContent);

            setStatus('Saved successfully');
            setTimeout(() => setStatus(''), 3000);
            setIsAuthenticating(false);

            return true;
        } catch (error) {
            console.error('Failed to save hosts with admin privileges:', error);
            const errorMessage = typeof error === 'string' ? error : String(error);

            // Handle different error scenarios
            if (errorMessage.includes('timeout') || errorMessage.includes('Operation timeout')) {
                setAdminAuthError('Operation timed out. Please try again.');
            } else if (errorMessage.includes('canceled') ||
                errorMessage.includes('denied') ||
                errorMessage.includes('Authentication failed') ||
                errorMessage.includes('not authorized') ||
                errorMessage.includes('拒绝')) {
                setAdminAuthError(t.adminAuth.permissionDenied);
            } else if (errorMessage.includes('Invalid administrator credentials') ||
                errorMessage.includes('incorrect password') ||
                errorMessage.includes('authentication failure')) {
                setAdminAuthError(t.adminAuth.invalidCredentials);
            } else {
                // Generic error message
                setAdminAuthError(t.adminAuth.permissionDenied);
            }

            setIsAuthenticating(false);
            return false;
        }
    };

    const handleToggleProfile = (id: string, active: boolean) => {
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

                if (activeProfiles.length === 0) {
                    // No active profiles, show just system content
                    setContent(systemContent);
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

                    setContent(parts.join('\n'));
                }

                // Keep originalContent as the actual system hosts content (without profiles)
                // This ensures isContentModified works correctly
            }

            return updated;
        });
    };

    // Check if content has been modified
    // For system hosts, check if merged content differs from original
    const isContentModified = selectedId === '1'
        ? calculateMergedHosts() !== originalContent
        : content !== originalContent;

    const handleAddProfile = async () => {
        const name = prompt('Enter profile name:');
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

    return (
        <div className="app-container">
            <Sidebar
                profiles={profiles}
                onSelect={setSelectedId}
                selectedId={selectedId}
                onToggle={handleToggleProfile}
                onAddProfile={handleAddProfile}
                showAdminAuth={showAdminAuth}
            />

            <div className="main-content">
                <div className="toolbar justify-between">
                    <div className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                        {selectedId === 'settings' ? t.common.settings : profiles.find(p => p.id === selectedId)?.name}
                        {status && <span className="text-xs text-[var(--text-tertiary)]">({status})</span>}
                    </div>

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
                            disabled={loading || selectedId === 'settings' || !isContentModified}
                        >
                            <Save size={18} />
                            <span>{t.common.save}</span>
                        </button>
                    </div>
                </div>

                {selectedId === 'settings' ? (
                    <Settings />
                ) : (
                    <Editor content={content} onChange={setContent} />
                )}
            </div>

            {/* Admin Authentication Modal */}
            <AdminAuthModal
                isOpen={showAdminAuth}
                onClose={() => {
                    setShowAdminAuth(false);
                    setAdminAuthError('');
                }}
                onConfirm={handleAdminAuth}
                isLoading={isAuthenticating}
                error={adminAuthError}
            />
        </div>
    );
};
