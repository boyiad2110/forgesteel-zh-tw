export type AppLocale = 'en' | 'zh-TW';

export const appLocales: AppLocale[] = [ 'en', 'zh-TW' ];

export const defaultLocale: AppLocale = 'zh-TW';

export const isAppLocale = (value: unknown): value is AppLocale => {
	return appLocales.some(locale => locale === value);
};

type MessageParameters = Record<string, string>;

// The zh-TW catalogs hold approved translations only. Until an entry is approved, the
// resolvers fall back to the canonical English text passed in by the presentation layer.
const uiCatalog: Record<AppLocale, Partial<Record<string, string>>> = {
	'en': {
		'hero-edit.save-changes': 'Save Changes'
	},
	'zh-TW': {}
};

const elementCatalog: Partial<Record<AppLocale, Record<string, Partial<Record<string, string>>>>> = {};

const messageCatalog: Record<AppLocale, Record<string, string>> = {
	'en': {
		'ability.free-melee.summary': '{abilityName} | Target: {target}'
	},
	'zh-TW': {}
};

const interpolate = (template: string, parameters: MessageParameters) => {
	return template.replace(/\{([^}]+)\}/g, (_match, name: string) => parameters[name] ?? `{${name}}`);
};

export const getLocalizedUIString = (locale: AppLocale, key: string, canonicalFallback: string) => {
	return uiCatalog[locale][key] ?? canonicalFallback;
};

export const getLocalizedElementField = (locale: AppLocale, elementID: string, field: string, canonicalFallback: string) => {
	return elementCatalog[locale]?.[elementID]?.[field] ?? canonicalFallback;
};

export const getLocalizedMessage = (locale: AppLocale, key: string, parameters: MessageParameters, canonicalFallback: string) => {
	return interpolate(messageCatalog[locale][key] ?? canonicalFallback, parameters);
};
