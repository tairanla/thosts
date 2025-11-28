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
        subtitle: 'System authentication dialog will appear to grant permissions.',
        systemDialogNotice: 'Click "Authenticate" to proceed. A system authentication dialog will appear asking for your administrator password. Please enter your credentials in the system dialog.',
        authenticate: 'Authenticate',
        authenticating: 'Waiting for authentication...',
        notice: 'This action requires administrator privileges to modify the system hosts file. The system will prompt you for authentication.',
        permissionDenied: 'Permission denied or authentication canceled.',
        invalidCredentials: 'Authentication failed. Please try again.',
    },
};
