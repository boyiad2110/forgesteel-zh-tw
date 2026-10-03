export type Language = 'zh-TW' | 'en';

const STORAGE_KEY = 'forgesteel-language';

const subscribers = new Set<() => void>();

const isLanguage = (value: string | null): value is Language => {
	return value === 'zh-TW' || value === 'en';
};

/**
 * The language the user picked. Anything unrecognised — including nothing
 * saved at all — is Traditional Chinese, the fork default.
 *
 * This lives in localStorage, the same kind of store as the theme. It is not
 * an Options field, so it never enters a hero file or a share code.
 */
export const getLanguage = (): Language => {
	const saved = localStorage.getItem(STORAGE_KEY);
	return isLanguage(saved) ? saved : 'zh-TW';
};

/** Called whenever the language changes. Returns an unsubscribe function. */
export const subscribeToLanguage = (onChange: () => void) => {
	subscribers.add(onChange);
	return () => {
		subscribers.delete(onChange);
	};
};

/** Records the user's choice and wakes anything listening. */
export const setLanguage = (language: Language) => {
	localStorage.setItem(STORAGE_KEY, language);
	subscribers.forEach(onChange => onChange());
};

/** Flips between Traditional Chinese and English. */
export const toggleLanguage = () => {
	setLanguage(getLanguage() === 'zh-TW' ? 'en' : 'zh-TW');
};

/** Short label for the footer button: the language currently in effect. */
export const languageLabel = (language: Language) => {
	return language === 'zh-TW' ? '中文' : 'EN';
};

/** The settings drawer name for zh-TW. The footer button stays on languageLabel. */
export const settingsLanguageLabel = '正體中文';
