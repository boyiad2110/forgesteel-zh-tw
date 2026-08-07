export type AppLocale = 'en' | 'zh-TW';

export const appLocales: AppLocale[] = [ 'en', 'zh-TW' ];

export const defaultLocale: AppLocale = 'zh-TW';

export const isAppLocale = (value: unknown): value is AppLocale => {
	return appLocales.some(locale => locale === value);
};
