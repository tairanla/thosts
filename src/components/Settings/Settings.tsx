import { Globe, Monitor, Moon, Sun, Type } from 'lucide-react';
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useTranslation } from '../../hooks/useTranslation';

export const Settings: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { t } = useTranslation();

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2>{t.settings.title}</h2>
                <p className="settings-subtitle">Customize your thosts experience</p>
            </div>

            <div className="settings-content">
                {/* Appearance Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <Moon size={20} />
                        <h3>{t.settings.appearance}</h3>
                    </div>

                    <div className="theme-grid">
                        <label className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="theme"
                                value="light"
                                checked={settings.theme === 'light'}
                                onChange={() => updateSettings({ theme: 'light' })}
                            />
                            <div className="theme-card">
                                <Sun size={24} />
                                <span>{t.settings.theme.light}</span>
                            </div>
                        </label>

                        <label className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="theme"
                                value="dark"
                                checked={settings.theme === 'dark'}
                                onChange={() => updateSettings({ theme: 'dark' })}
                            />
                            <div className="theme-card">
                                <Moon size={24} />
                                <span>{t.settings.theme.dark}</span>
                            </div>
                        </label>

                        <label className={`theme-option ${settings.theme === 'system' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="theme"
                                value="system"
                                checked={settings.theme === 'system'}
                                onChange={() => updateSettings({ theme: 'system' })}
                            />
                            <div className="theme-card">
                                <Monitor size={24} />
                                <span>{t.settings.theme.system}</span>
                            </div>
                        </label>
                    </div>
                </section>

                {/* Language Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <Globe size={20} />
                        <h3>{t.settings.language}</h3>
                    </div>

                    <div className="settings-field">
                        <select
                            className="settings-select"
                            value={settings.language}
                            onChange={(e) => updateSettings({ language: e.target.value as any })}
                        >
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁体中文</option>
                        </select>
                    </div>
                </section>

                {/* Font Settings Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <Type size={20} />
                        <h3>{t.settings.editorFont}</h3>
                    </div>

                    <div className="settings-field">
                        <label className="field-label">{t.settings.fontFamily}</label>
                        <input
                            type="text"
                            className="settings-input"
                            value={settings.fontFamily}
                            onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                            placeholder="Cascadia Mono, Consolas, Menlo..."
                        />
                    </div>

                    <div className="settings-field">
                        <label className="field-label">{t.settings.fontSize}</label>
                        <div className="font-size-control">
                            <input
                                type="range"
                                min="10"
                                max="24"
                                step="1"
                                value={settings.fontSize}
                                onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                                className="font-size-slider"
                            />
                            <div className="font-size-value">{settings.fontSize}px</div>
                        </div>
                    </div>

                    <div className="font-preview" style={{ fontFamily: settings.fontFamily, fontSize: `${settings.fontSize}px` }}>
                        127.0.0.1 localhost
                        <br />
                        ::1 localhost
                    </div>
                </section>
            </div>
        </div>
    );
};
