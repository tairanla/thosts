import { invoke } from '@tauri-apps/api/core';
import { confirm } from '@tauri-apps/plugin-dialog';

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
     * Request admin permission using Tauri dialog.
     * Returns true if user confirms, false otherwise.
     * @param title - Dialog title (optional, defaults to English)
     * @param message - Dialog message (optional, defaults to English)
     * @param okLabel - OK button label (optional, defaults to "OK")
     * @param cancelLabel - Cancel button label (optional, defaults to "Cancel")
     */
    requestAdminPermission: async (
        title?: string,
        message?: string,
        okLabel?: string,
        cancelLabel?: string
    ): Promise<boolean> => {
        const confirmed = await confirm(
            message || 'This operation requires administrator privileges to modify the system hosts file.\n\nAfter clicking "OK", the system will display an authentication dialog asking for your administrator password.',
            {
                title: title || 'Administrator Permission Required',
                kind: 'warning',
                okLabel: okLabel || 'OK',
                cancelLabel: cancelLabel || 'Cancel',
            }
        );
        return confirmed;
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
