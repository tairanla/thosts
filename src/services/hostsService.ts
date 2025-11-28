import { invoke } from '@tauri-apps/api/core';

export interface HostsProfile {
    id: string;
    name: string;
    content: string;
    active: boolean;
    type: 'system' | 'local' | 'remote';
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

    /**
     * Write hosts file with system authentication dialog.
     * This will trigger the system's native authentication dialog:
     * - Windows: UAC (User Account Control) dialog
     * - macOS/Linux: sudo authentication dialog
     */
    writeHostsWithAdmin: async (path: string, content: string): Promise<void> => {
        return await invoke('write_hosts_with_admin', { path, content });
    },
};
