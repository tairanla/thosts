import { Translations } from './types';

export const en: Translations = {
    common: {
        save: 'Save',
        refresh: 'Refresh',
        settings: 'Settings',
        systemHosts: 'System Hosts',
        addProfile: 'Add Profile',
        cancel: 'Cancel',
    },
    settings: {
        title: 'Settings',
        appearance: 'Appearance',
        theme: {
            light: 'Light',
            dark: 'Dark',
            system: 'System',
        },
        language: 'Language',
        editorFont: 'Editor Font',
        fontFamily: 'Font Family',
        fontSize: 'Font Size (px)',
    },
    adminAuth: {
        title: 'Administrator Authentication Required',
        subtitle: 'Please enter administrator credentials to modify the system hosts file.',
        username: 'Username',
        password: 'Password',
        usernamePlaceholder: 'Enter administrator username',
        passwordPlaceholder: 'Enter administrator password',
        authenticate: 'Authenticate',
        authenticating: 'Authenticating...',
        notice: 'This action requires administrator privileges to modify the system hosts file.',
        permissionDenied: 'Permission denied. Invalid administrator credentials.',
        invalidCredentials: 'The username or password you entered is incorrect.',
    },
};
