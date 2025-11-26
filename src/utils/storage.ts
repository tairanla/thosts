import { HostsProfile } from '../services/hostsService';

const STORAGE_KEY = 'thosts-profiles';

export const profileStorage = {
    save: (profiles: HostsProfile[]) => {
        // Don't save system hosts content, only metadata
        const toSave = profiles.map(p =>
            p.id === '1' ? { ...p, content: '' } : p
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    },

    load: (): HostsProfile[] | null => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;

        try {
            return JSON.parse(saved);
        } catch {
            return null;
        }
    },

    clear: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
