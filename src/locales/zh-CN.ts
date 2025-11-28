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
        subtitle: '系统将显示身份验证对话框以授予权限。',
        systemDialogNotice: '点击"验证"继续。系统将显示身份验证对话框，要求输入管理员密码。请在系统对话框中输入您的凭据。',
        authenticate: '验证',
        authenticating: '等待身份验证...',
        notice: '此操作需要管理员权限来修改系统 hosts 文件。系统将提示您进行身份验证。',
        permissionDenied: '权限被拒绝或身份验证已取消。',
        invalidCredentials: '身份验证失败。请重试。',
    },
};
