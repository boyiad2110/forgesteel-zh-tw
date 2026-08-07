/* eslint-disable sort-imports */

import { AbilityData } from '@/data/ability-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { defaultLocale, getLocalizedElementField, getLocalizedMessage, getLocalizedUIString, isAppLocale } from '@/localization/prototype-localization';
import { describe, expect, it } from 'vitest';

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

describe('localization catalog and resolver', () => {
	it('resolves a catalog entry in preference to the value passed in', () => {
		expect(getLocalizedUIString('en', 'hero-edit.save-changes', 'Unused Fallback')).toBe('Save Changes');
		expect(getLocalizedMessage(
			'en',
			'ability.free-melee.summary',
			{ abilityName: 'Free Strike (melee)', target: 'One creature or object' },
			'unused {abilityName}'
		)).toBe('Free Strike (melee) | Target: One creature or object');
	});

	it('shows canonical English when zh-TW has no approved UI string', () => {
		expect(getLocalizedUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
	});

	it('shows canonical English when zh-TW has no approved element field', () => {
		const ability = AbilityData.freeStrikeMelee;

		expect(getLocalizedElementField('zh-TW', ability.id, 'name', ability.name)).toBe('Free Strike (melee)');
		expect(getLocalizedElementField('zh-TW', ability.id, 'target', ability.target)).toBe('One creature or object');
	});

	it('formats a stable message key with structured parameters and a canonical English template', () => {
		const message = getLocalizedMessage(
			'zh-TW',
			'ability.free-melee.summary',
			{ abilityName: 'Free Strike (melee)', target: 'One creature or object' },
			'{abilityName} | Target: {target}'
		);

		expect(message).toBe('Free Strike (melee) | Target: One creature or object');
	});

	it('never mutates the canonical ability or its representative rule result', () => {
		const ability = AbilityData.freeStrikeMelee;
		const before = JSON.stringify(ability);
		const beforeDistance = AbilityLogic.getDistance(ability.distance[0], ability);

		getLocalizedElementField('zh-TW', ability.id, 'name', ability.name);
		getLocalizedElementField('zh-TW', ability.id, 'target', ability.target);
		getLocalizedMessage('zh-TW', 'ability.free-melee.summary', { abilityName: ability.name, target: ability.target }, '{abilityName} | Target: {target}');

		expect(ability.id).toBe('free-melee');
		expect(ability.name).toBe('Free Strike (melee)');
		expect(ability.target).toBe('One creature or object');
		expect(AbilityLogic.getDistance(ability.distance[0], ability)).toBe(beforeDistance);
		expect(JSON.stringify(ability)).toBe(before);
	});
});
