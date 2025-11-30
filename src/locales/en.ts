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
        title: 'Administrator Permission Required',
        subtitle: 'System authentication dialog will appear to grant permissions.',
        systemDialogNotice: 'This operation requires administrator privileges to modify the system hosts file.\n\nAfter clicking "OK", the system will display an authentication dialog asking for your administrator password.',
        authenticate: 'OK',
        authenticating: 'Waiting for authentication...',
        notice: 'This action requires administrator privileges to modify the system hosts file. The system will prompt you for authentication.',
        permissionDenied: 'Operation canceled',
        invalidCredentials: 'Authentication failed. Please try again.',
    },
};
