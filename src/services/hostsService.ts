import { invoke } from '@tauri-apps/api/core';

export interface HostsProfile {
    id: string;
    name: string;
    content: string;
    active: boolean;
    type: 'system' | 'local' | 'remote';
}

export interface AdminCredentials {
    username: string;
    password: string;
}

export const hostsService = {
    getHostsPath: async (): Promise<string> => {
        return await invoke('get_hosts_path');
    },

    readHosts: async (path: string): Promise<string> => {
        return await invoke('read_hosts', { path });
    },

    writeHosts: async (path: string, content: string): Promise<void> => {
        return await invoke('write_hosts', { path, content });
    },

    writeHostsWithAdmin: async (path: string, content: string, credentials: AdminCredentials): Promise<void> => {
        return await invoke('write_hosts_with_admin', { path, content, credentials });
    },

    validateAdminCredentials: async (credentials: AdminCredentials): Promise<boolean> => {
        return await invoke('validate_admin_credentials', { credentials });
    },

    // Helper to parse hosts file content (simple version)
    // In a real app, we might want to parse it into structured data
};
