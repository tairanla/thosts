import { Translations } from './types';

export const zhCN: Translations = {
    common: {
        save: '保存',
        refresh: '刷新',
        settings: '设置',
        systemHosts: '系统 Hosts',
        addProfile: '添加配置',
        cancel: '取消',
    },
    settings: {
        title: '设置',
        appearance: '外观',
        theme: {
            light: '浅色',
            dark: '深色',
            system: '跟随系统',
        },
        language: '语言',
        editorFont: '编辑器字体',
        fontFamily: '字体系列',
        fontSize: '字体大小 (px)',
    },
    adminAuth: {
        title: '需要管理员身份验证',
        subtitle: '请输入管理员凭据以修改系统 hosts 文件。',
        username: '用户名',
        password: '密码',
        usernamePlaceholder: '输入管理员用户名',
        passwordPlaceholder: '输入管理员密码',
        authenticate: '验证',
        authenticating: '验证中...',
        notice: '此操作需要管理员权限来修改系统 hosts 文件。',
        permissionDenied: '权限被拒绝。管理员凭据无效。',
        invalidCredentials: '您输入的用户名或密码不正确。',
    },
};
