export type AppLocale = 'en' | 'zh-TW';

export const defaultLocale: AppLocale = 'en';

type MessageParameters = Record<string, string>;

const uiCatalog: Record<AppLocale, Partial<Record<string, string>>> = {
	'en': {
		'hero-edit.save-changes': 'Save Changes'
	},
	'zh-TW': {
		// Prototype sentinel only; this is not an approved translation.
		'hero-edit.save-changes': '【原型】儲存變更'
	}
};

const elementCatalog: Partial<Record<AppLocale, Record<string, Partial<Record<string, string>>>>> = {
	'zh-TW': {
		// Prototype sentinel only; this is not an approved translation.
		'free-melee': {
			name: '【原型】近戰自由攻擊'
		}
	}
};

const messageCatalog: Record<AppLocale, Record<string, string>> = {
	'en': {
		'ability.free-melee.summary': '{abilityName} | Target: {target}'
	},
	'zh-TW': {
		// Prototype sentinel only; this is not an approved translation.
		'ability.free-melee.summary': '【原型】{abilityName}｜目標：{target}'
	}
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
