/* eslint-disable sort-imports */

import { AbilityData } from '@/data/ability-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { getLocalizedElementField, getLocalizedMessage, getLocalizedUIString } from '@/localization/prototype-localization';
import { describe, expect, it } from 'vitest';

describe('prototype localization catalog and resolver', () => {
	it('resolves the HeroEditPage semantic key without changing the English fallback', () => {
		expect(getLocalizedUIString('en', 'hero-edit.save-changes', 'Save Changes')).toBe('Save Changes');
		expect(getLocalizedUIString('zh-TW', 'hero-edit.save-changes', 'Save Changes')).toBe('【原型】儲存變更');
	});

	it('resolves the free-melee name by stable ID and falls back to its canonical target', () => {
		const ability = AbilityData.freeStrikeMelee;

		expect(getLocalizedElementField('zh-TW', ability.id, 'name', ability.name)).toBe('【原型】近戰自由攻擊');
		expect(getLocalizedElementField('zh-TW', ability.id, 'target', ability.target)).toBe('One creature or object');
	});

	it('formats a stable message key with structured parameters', () => {
		const message = getLocalizedMessage(
			'zh-TW',
			'ability.free-melee.summary',
			{ abilityName: 'Free Strike (melee)', target: 'One creature or object' },
			'{abilityName} | Target: {target}'
		);

		expect(message).toBe('【原型】Free Strike (melee)｜目標：One creature or object');
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
