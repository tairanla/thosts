import { useSettings } from '../contexts/SettingsContext';
import { en } from '../locales/en';
import { Translations } from '../locales/types';
import { zhCN } from '../locales/zh-CN';
import { zhTW } from '../locales/zh-TW';

const translations: Record<string, Translations> = {
    'en': en,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
};

export const useTranslation = () => {
    const { settings } = useSettings();
    const t = translations[settings.language] || en;
    return { t };
};
