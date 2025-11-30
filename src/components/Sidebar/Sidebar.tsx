import { getVersion } from '@tauri-apps/api/app';
import { FileText, Github, Kayak, Plus, Power, PowerOff, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { HostsProfile } from '../../services/hostsService';

interface SidebarProps {
    profiles: HostsProfile[];
    selectedId: string;
    onSelect: (id: string) => void;
    onToggle: (id: string, active: boolean) => void;
    onAddProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ profiles, selectedId, onSelect, onToggle, onAddProfile }) => {
    const { t } = useTranslation();
    const [appVersion, setAppVersion] = useState('0.1.0');

    useEffect(() => {
        getVersion().then(version => {
            setAppVersion(version);
        }).catch(() => {
            // Fallback to default version if failed
            setAppVersion('0.1.0');
        });
    }, []);

    return (
        <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="app-title">
                    <div className="app-icon">
                        <Kayak size={20} strokeWidth={2.5} />
                    </div>
                    <h1>thosts</h1>
                </div>
                <button className="add-profile-btn" title={t.common.addProfile} onClick={onAddProfile}>
                    <Plus size={18} strokeWidth={2.5} />
                </button>
            </div>

            {/* Profile List */}
            <div className="profile-list">
                <div className="profile-list-header">
                    <span className="profile-count">{profiles.length} Profiles</span>
                </div>
                {profiles.map((profile) => (
                    <div
                        key={profile.id}
                        className={`profile-item ${selectedId === profile.id ? 'active' : ''}`}
                        onClick={() => onSelect(profile.id)}
                    >
                        <div className="profile-icon">
                            <FileText size={18} />
                        </div>
                        <div className="profile-info">
                            <span className="profile-name">{profile.name}</span>
                            <span className="profile-type">{profile.type}</span>
                        </div>
                        <button
                            className={`profile-toggle ${profile.active ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle(profile.id, !profile.active);
                            }}
                            title={profile.active ? 'Disable' : 'Enable'}
                        >
                            {profile.active ? <Power size={16} /> : <PowerOff size={16} />}
                        </button>
                    </div>
                ))}
            </div>

            {/* Settings Button */}
            <div className="sidebar-footer flex items-center justify-between">
                <div className="flex-1">
                    <div className="version-info ml-2 text-sm">v{appVersion}</div>
                </div>
                <div className="flex justify-end gap-2 items-center h-full">
                    <button className="icon-btn w-10 h-10" onClick={() => window.open('https://github.com/tairanla/thosts', '_blank')} title="GitHub"><Github size={18} /></button>
                    <button className="icon-btn w-10 h-10" onClick={() => onSelect('settings')} title={t.common.settings}><Settings size={18} /></button>
                </div>
            </div>
        </div>
    );
};
