import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'zh-CN' | 'zh-TW';

interface Settings {
    theme: Theme;
    language: Language;
    fontFamily: string;
    fontSize: number;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
    theme: 'system',
    language: 'en',
    fontFamily: 'Cascadia Mono, Consolas, Menlo, Monaco, Ubuntu Mono, monospace',
    fontSize: 14,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('thosts-settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('thosts-settings', JSON.stringify(settings));
        applyTheme(settings.theme);
        applyFont(settings.fontFamily, settings.fontSize);
    }, [settings]);

    const applyTheme = (theme: Theme) => {
        const root = document.documentElement;
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', theme);
        }
    };

    const applyFont = (family: string, size: number) => {
        const root = document.documentElement;
        root.style.setProperty('--font-mono', family);
        // We might want to apply font size to the editor specifically, 
        // but for now let's set a variable or just use it in the Editor component.
        // Let's set a global variable for editor font size
        root.style.setProperty('--editor-font-size', `${size}px`);
    };

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
