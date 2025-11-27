import { FileText, Github, Plus, Power, PowerOff, Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { HostsProfile } from '../../services/hostsService';

interface SidebarProps {
    profiles: HostsProfile[];
    selectedId: string;
    showAdminAuth?: boolean;
    onSelect: (id: string) => void;
    onToggle: (id: string, active: boolean) => void;
    onAddProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ profiles, selectedId, onSelect, onToggle, onAddProfile }) => {
    const { t } = useTranslation();

    return (
        <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="app-title">
                    <div className="app-icon">H</div>
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
            <div className="sidebar-footer">
                <button
                    className={`settings-btn ${selectedId === 'settings' ? 'active' : ''}`}
                    onClick={() => onSelect('settings')}
                    title={t.common.settings}
                >
                    <Settings size={18} />
                </button>
                <button
                    className="github-btn"
                    onClick={() => window.open('https://github.com/tairanla/thosts', '_blank')}
                    title="GitHub"
                >
                    <Github size={18} />
                </button>
            </div>
        </div>
    );
};
