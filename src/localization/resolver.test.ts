/* eslint-disable sort-imports */

import { AbilityData } from '@/data/ability-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { LocalizationEntry } from '@/localization/catalog';
import { createLocalizationResolver, localizeElementField, localizeMessage, localizeUIString } from '@/localization/resolver';
import { defaultLocale, isAppLocale } from '@/localization/locale';
import { describe, expect, it } from 'vitest';

// Engineering sentinels, not translations: no zh-TW game terminology has been approved,
// and none is introduced here. They only have to be visibly not the canonical English.
const zhUIString = '測試字串一';
const zhElementField = '測試字串二';
const zhMessageTemplate = '測試訊息 {abilityName} / {target}';

const ability = AbilityData.freeStrikeMelee;
const canonicalMessageTemplate = '{abilityName} | Target: {target}';
const messageParameters = { abilityName: ability.name, target: ability.target };

const approvedEntries: LocalizationEntry[] = [
	{ kind: 'ui', key: 'hero-edit.save-changes', canonicalEnglish: 'Save Changes', zhTW: zhUIString, approval: 'approved' },
	{ kind: 'element-field', elementID: ability.id, field: 'name', canonicalEnglish: ability.name, zhTW: zhElementField, approval: 'approved' },
	{
		kind: 'message',
		key: 'ability.free-melee.summary',
		canonicalEnglish: canonicalMessageTemplate,
		zhTW: zhMessageTemplate,
		approval: 'approved',
		placeholders: [ 'abilityName', 'target' ]
	}
];

const resolverWith = (...entries: LocalizationEntry[]) => createLocalizationResolver(entries);
const approvedResolver = resolverWith(...approvedEntries);

const uiEntry = (overrides: Partial<LocalizationEntry>) => {
	return { ...approvedEntries[0], ...overrides } as LocalizationEntry;
};

const messageEntry = (overrides: Record<string, unknown>) => {
	return { ...approvedEntries[2], ...overrides } as LocalizationEntry;
};

describe('locale model', () => {
	it('defaults to zh-TW', () => {
		expect(defaultLocale).toBe('zh-TW');
	});

	it('only accepts the supported locales', () => {
		expect(isAppLocale('en')).toBe(true);
		expect(isAppLocale('zh-TW')).toBe(true);
		expect(isAppLocale('zh')).toBe(false);
		expect(isAppLocale('fr')).toBe(false);
		expect(isAppLocale('')).toBe(false);
		expect(isAppLocale(undefined)).toBe(false);
		expect(isAppLocale(null)).toBe(false);
		expect(isAppLocale(1)).toBe(false);
	});
});

describe('resolver: approved zh-TW content', () => {
	it('shows an approved UI string, element field and composed message', () => {
		expect(approvedResolver.localizeUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe(zhUIString);
		expect(approvedResolver.localizeElementField('zh-TW', ability.id, 'name', ability.name)).toBe(zhElementField);
		expect(approvedResolver.localizeMessage('zh-TW', 'ability.free-melee.summary', messageParameters, canonicalMessageTemplate))
			.toBe(`測試訊息 ${ability.name} / ${ability.target}`);
	});

	it('shows canonical English in en, even where zh-TW is approved', () => {
		expect(approvedResolver.localizeUIString('en', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
		expect(approvedResolver.localizeElementField('en', ability.id, 'name', ability.name)).toBe(ability.name);
		expect(approvedResolver.localizeMessage('en', 'ability.free-melee.summary', messageParameters, canonicalMessageTemplate))
			.toBe(`${ability.name} | Target: ${ability.target}`);
	});
});

describe('resolver: canonical English fallback', () => {
	it('falls back when the catalog has no entry', () => {
		const empty = createLocalizationResolver([]);

		expect(empty.localizeUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
		expect(empty.localizeElementField('zh-TW', ability.id, 'name', ability.name)).toBe(ability.name);
		expect(empty.localizeMessage('zh-TW', 'ability.free-melee.summary', messageParameters, canonicalMessageTemplate))
			.toBe(`${ability.name} | Target: ${ability.target}`);
	});

	it('falls back for an unapproved entry', () => {
		const resolver = resolverWith(uiEntry({ approval: 'unapproved' }));

		expect(resolver.localizeUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
	});

	it('falls back for a stale entry, so outdated content is never shown as approved zh-TW', () => {
		// The catalog was approved against text the app no longer shows.
		const resolver = resolverWith(uiEntry({ canonicalEnglish: 'Save' }));

		expect(resolver.localizeUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
	});

	it('falls back for an approved entry with no usable content, never showing an empty string', () => {
		expect(resolverWith(uiEntry({ zhTW: '' })).localizeUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
		expect(resolverWith(uiEntry({ zhTW: '   ' })).localizeUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
	});

	it('falls back when one identity is claimed by more than one entry', () => {
		const resolver = resolverWith(approvedEntries[0], uiEntry({ zhTW: '測試字串三' }));

		expect(resolver.localizeUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
	});

	it('never shows an internal key, an identity or catalog metadata', () => {
		const resolver = resolverWith(uiEntry({ approval: 'unapproved' }));
		const resolved = resolver.localizeUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes');

		expect(resolved).toBe('Save Changes');
		expect(resolved).not.toContain('hero-edit.save-changes');
		expect(resolved).not.toContain('ui:');
		expect(resolved).not.toContain('unapproved');
	});
});

describe('resolver: composed messages', () => {
	it('keeps structured parameter values exactly as they are passed in', () => {
		const parameters = { abilityName: '**Bespoke** Ability 3 + 1', target: 'Player’s own text {here}' };
		const resolved = approvedResolver.localizeMessage('zh-TW', 'ability.free-melee.summary', parameters, canonicalMessageTemplate);

		expect(resolved).toBe('測試訊息 **Bespoke** Ability 3 + 1 / Player’s own text {here}');
	});

	it('falls back when the entry declares placeholders the templates do not use', () => {
		const missingInLocalized = resolverWith(messageEntry({ zhTW: '測試訊息 {abilityName}' }));
		const extraInLocalized = resolverWith(messageEntry({ zhTW: '測試訊息 {abilityName} / {target} / {extra}' }));
		const renamedInLocalized = resolverWith(messageEntry({ zhTW: '測試訊息 {abilityName} / {goal}' }));

		[ missingInLocalized, extraInLocalized, renamedInLocalized ].forEach(resolver => {
			expect(resolver.localizeMessage('zh-TW', 'ability.free-melee.summary', messageParameters, canonicalMessageTemplate))
				.toBe(`${ability.name} | Target: ${ability.target}`);
		});
	});

	it('falls back rather than showing a zh-TW template with an unfilled slot', () => {
		const resolved = approvedResolver.localizeMessage('zh-TW', 'ability.free-melee.summary', { abilityName: ability.name }, canonicalMessageTemplate);

		expect(resolved).not.toContain('測試訊息');
		expect(resolved).toBe(`${ability.name} | Target: {target}`);
	});
});

describe('resolver: canonical safety', () => {
	it('never mutates the canonical ability or its representative rule result', () => {
		const before = JSON.stringify(ability);
		const beforeDistance = AbilityLogic.getDistance(ability.distance[0], ability);

		approvedResolver.localizeElementField('zh-TW', ability.id, 'name', ability.name);
		approvedResolver.localizeMessage('zh-TW', 'ability.free-melee.summary', messageParameters, canonicalMessageTemplate);

		expect(ability.id).toBe('free-melee');
		expect(ability.name).toBe('Free Strike (melee)');
		expect(ability.target).toBe('One creature or object');
		expect(AbilityLogic.getDistance(ability.distance[0], ability)).toBe(beforeDistance);
		expect(JSON.stringify(ability)).toBe(before);
	});
});

describe('production resolver', () => {
	it('shows canonical English everywhere, because no zh-TW content is approved yet', () => {
		expect(localizeUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
		expect(localizeUIString('en', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
		expect(localizeElementField('zh-TW', ability.id, 'name', ability.name)).toBe(ability.name);
		expect(localizeElementField('zh-TW', ability.id, 'target', ability.target)).toBe(ability.target);
		expect(localizeMessage('zh-TW', 'ability.free-melee.summary', messageParameters, canonicalMessageTemplate))
			.toBe(`${ability.name} | Target: ${ability.target}`);
	});
});
