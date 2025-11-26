import { Translations } from './types';

export const zhTW: Translations = {
    common: {
        save: '儲存',
        refresh: '重新整理',
        settings: '設定',
        systemHosts: '系統 Hosts',
        addProfile: '新增設定檔',
        cancel: '取消',
    },
    settings: {
        title: '設定',
        appearance: '外觀',
        theme: {
            light: '淺色',
            dark: '深色',
            system: '跟隨系統',
        },
        language: '語言',
        editorFont: '編輯器字體',
        fontFamily: '字體系列',
        fontSize: '字體大小 (px)',
    },
    adminAuth: {
        title: '需要管理員身份驗證',
        subtitle: '請輸入管理員憑證以修改系統 hosts 檔案。',
        username: '使用者名稱',
        password: '密碼',
        usernamePlaceholder: '輸入管理員使用者名稱',
        passwordPlaceholder: '輸入管理員密碼',
        authenticate: '驗證',
        authenticating: '驗證中...',
        notice: '此操作需要管理員權限來修改系統 hosts 檔案。',
        permissionDenied: '權限被拒絕。管理員憑證無效。',
        invalidCredentials: '您輸入的使用者名稱或密碼不正確。',
    },
};
