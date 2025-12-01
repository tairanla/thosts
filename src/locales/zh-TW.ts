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
        title: '需要管理員權限',
        subtitle: '系統將顯示身份驗證對話框以授予權限。',
        systemDialogNotice: '此操作需要管理員權限來修改系統 hosts 檔案。\n\n點擊"確定"後，系統將顯示身份驗證對話框，要求輸入管理員密碼。',
        authenticate: '確定',
        authenticating: '等待身份驗證...',
        notice: '此操作需要管理員權限來修改系統 hosts 檔案。系統將提示您進行身份驗證。',
        permissionDenied: '操作已取消',
        invalidCredentials: '身份驗證失敗。請重試。',
    },
    dialog: {
        deleteProfile: {
            title: '刪除設定檔',
            message: '確定要刪除此設定檔嗎？',
            confirm: '刪除',
            cancel: '取消',
        },
        addProfile: {
            message: '請輸入設定檔名稱：',
        },
    },
    status: {
        loaded: '系統 Hosts 已載入',
        error: '載入 Hosts 失敗',
        saved: '儲存成功',
        savedLocal: '設定檔已儲存 (本地)',
        failedAdmin: '管理員權限儲存失敗',
    },
    sidebar: {
        profiles: '個設定檔',
        github: 'GitHub',
        enable: '啟用',
        disable: '停用',
        delete: '刪除',
        types: {
            system: '系統',
            local: '本地',
            remote: '遠端',
        },
    },
};
