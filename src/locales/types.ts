export interface Translations {
    common: {
        save: string;
        refresh: string;
        settings: string;
        systemHosts: string;
        addProfile: string;
        cancel: string;
    };
    settings: {
        title: string;
        appearance: string;
        theme: {
            light: string;
            dark: string;
            system: string;
        };
        language: string;
        editorFont: string;
        fontFamily: string;
        fontSize: string;
    };
    adminAuth: {
        title: string;
        subtitle: string;
        systemDialogNotice: string;
        authenticate: string;
        authenticating: string;
        notice: string;
        permissionDenied: string;
        invalidCredentials: string;
    };
    dialog: {
        deleteProfile: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
        };
        addProfile: {
            message: string;
        };
    };
    status: {
        loaded: string;
        error: string;
        saved: string;
        savedLocal: string;
        failedAdmin: string;
    };
    sidebar: {
        profiles: string;
        github: string;
        enable: string;
        disable: string;
        delete: string;
        types: {
            system: string;
            local: string;
            remote: string;
        };
    };
}
