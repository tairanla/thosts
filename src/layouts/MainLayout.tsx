
import { RefreshCw, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AdminAuthModal } from '../components/AdminAuthModal/AdminAuthModal';
import { Editor } from '../components/Editor/Editor';
import { Settings } from '../components/Settings/Settings';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import { AdminCredentials, HostsProfile, hostsService } from '../services/hostsService';
import { profileStorage } from '../utils/storage';

export const MainLayout: React.FC = () => {
    const { t } = useTranslation();
    const [selectedId, setSelectedId] = useState('1');
    const [content, setContent] = useState('');
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

    // When selecting a profile, update content
    useEffect(() => {
        if (selectedId === 'settings') return;

        const profile = profiles.find(p => p.id === selectedId);
        if (profile) {
            setContent(profile.content);
        }
    }, [selectedId, profiles]);

    const loadSystemHosts = async () => {
        try {
            setLoading(true);
            const path = await hostsService.getHostsPath();
            setSystemPath(path);
            const fileContent = await hostsService.readHosts(path);

            setProfiles(prev => prev.map(p =>
                p.id === '1' ? { ...p, content: fileContent } : p
            ));

            if (selectedId === '1') {
                setContent(fileContent);
            }

            setStatus('Loaded system hosts');
        } catch (error) {
            console.error('Failed to load hosts:', error);
            setStatus('Error loading hosts');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (selectedId === '1') {
            // Saving system hosts
            if (!systemPath) return;

            // First, try to save without admin privileges
            try {
                setLoading(true);
                await hostsService.writeHosts(systemPath, content);

                // Update local state
                setProfiles(prev => prev.map(p =>
                    p.id === '1' ? { ...p, content } : p
                ));

                setStatus('Saved successfully');
                setTimeout(() => setStatus(''), 3000);
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
            setStatus('Profile saved (local)');
            setTimeout(() => setStatus(''), 3000);
        }
    };

    const handleAdminAuth = async (username: string, password: string): Promise<boolean> => {
        if (!systemPath) return false;

        setIsAuthenticating(true);
        setAdminAuthError('');

        try {
            const credentials: AdminCredentials = { username, password };

            // Directly try to save with admin privileges
            await hostsService.writeHostsWithAdmin(systemPath, content, credentials);

            // Update local state on success
            setProfiles(prev => prev.map(p =>
                p.id === '1' ? { ...p, content } : p
            ));

            setStatus('Saved successfully with admin privileges');
            setTimeout(() => setStatus(''), 3000);

            return true;
        } catch (error) {
            console.error('Failed to save hosts with admin privileges:', error);
            const errorMessage = typeof error === 'string' ? error : String(error);

            if (errorMessage.includes('Invalid administrator credentials') ||
                errorMessage.includes('incorrect password') ||
                errorMessage.includes('authentication failure')) {
                setAdminAuthError(t.adminAuth.invalidCredentials);
            } else {
                setAdminAuthError(`${t.adminAuth.permissionDenied}: ${errorMessage}`);
            }

            return false;
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleToggleProfile = (id: string, active: boolean) => {
        setProfiles(prev => prev.map(p =>
            p.id === id ? { ...p, active } : p
        ));
        // TODO: Re-calculate and apply system hosts based on active profiles
    };

    const handleAddProfile = () => {
        const name = prompt('Enter profile name:');
        if (!name) return;

        const newProfile: HostsProfile = {
            id: Date.now().toString(),
            name,
            content: '# New Profile\n',
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
                            disabled={loading || selectedId === 'settings'}
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
                onSubmit={handleAdminAuth}
                isLoading={isAuthenticating}
                error={adminAuthError}
            />
        </div>
    );
};
