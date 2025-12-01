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
        title: '需要管理员权限',
        subtitle: '系统将显示身份验证对话框以授予权限。',
        systemDialogNotice: '此操作需要管理员权限来修改系统 hosts 文件。\n\n点击"确定"后，系统将显示身份验证对话框，要求输入管理员密码。',
        authenticate: '确定',
        authenticating: '等待身份验证...',
        notice: '此操作需要管理员权限来修改系统 hosts 文件。系统将提示您进行身份验证。',
        permissionDenied: '操作已取消',
        invalidCredentials: '身份验证失败。请重试。',
    },
    dialog: {
        deleteProfile: {
            title: '删除配置',
            message: '确定要删除此配置吗？',
            confirm: '删除',
            cancel: '取消',
        },
        addProfile: {
            message: '请输入配置名称：',
        },
    },
    status: {
        loaded: '系统 Hosts 已加载',
        error: '加载 Hosts 失败',
        saved: '保存成功',
        savedLocal: '配置已保存 (本地)',
        failedAdmin: '管理员权限保存失败',
    },
    sidebar: {
        profiles: '个配置',
        github: 'GitHub',
        enable: '启用',
        disable: '禁用',
        delete: '删除',
        types: {
            system: '系统',
            local: '本地',
            remote: '远程',
        },
    },
};
