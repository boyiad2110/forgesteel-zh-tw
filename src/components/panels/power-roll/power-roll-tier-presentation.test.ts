/* eslint-disable sort-imports */

import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const resolver = vi.hoisted(() => ({ result: '' }));

vi.mock('@/localization/resolver', () => ({
	localizeElementField: vi.fn(() => resolver.result)
}));

const canonicalEnglish = '2 + M holy damage; P < [weak], slowed (save ends)';
const calculatedEnglish = '4 holy damage; `P < 0` **slowed** (save ends)';
const zhTW = '2 + `力量`神聖傷害；`氣場` < [弱]，緩速（豁免解除）';

const localize = (overrides: Partial<Parameters<typeof localizePowerRollTierPresentation>[0]> = {}) => {
	return localizePowerRollTierPresentation({
		locale: 'zh-TW',
		abilityID: 'fixture-ability',
		field: 'sections.0.roll.tier1',
		canonicalEnglish: canonicalEnglish,
		calculatedEnglish: calculatedEnglish,
		...overrides
	});
};

beforeEach(() => {
	resolver.result = zhTW;
});

describe('localized calculated Power Roll tier presentation', () => {
	it('projects characteristic and potency results onto an approved raw zh-TW reading', () => {
		expect(localize()).toBe('4 神聖傷害；`氣場` < 0，**緩速**（豁免解除）');
	});

	it('projects a calculated fixed damage value without changing the translated effect', () => {
		resolver.result = '2 神聖傷害；推動 1';

		expect(localize({
			canonicalEnglish: '2 holy damage; push 1',
			calculatedEnglish: '5 holy damage; push 2'
		})).toBe('5 神聖傷害；推動 2');
	});

	it.each([
		[ 'pull', '拉動' ],
		[ 'slide', '滑動' ]
	])('projects a calculated %s value onto its approved zh-TW grammar', (canonicalVerb, localizedVerb) => {
		resolver.result = `${localizedVerb} 2`;

		expect(localize({
			canonicalEnglish: `${canonicalVerb} 2`,
			calculatedEnglish: `${canonicalVerb} 4`
		})).toBe(`${localizedVerb} 4`);
	});

	it('keeps English calculated presentation unchanged', () => {
		expect(localize({ locale: 'en' })).toBe(calculatedEnglish);
	});

	it('honors the resolver canonical fallback used for missing, stale or ambiguous entries', () => {
		resolver.result = canonicalEnglish;

		expect(localize()).toBe(calculatedEnglish);
	});

	it('keeps calculated English when the localized forced-movement verb does not match canonical mechanics', () => {
		resolver.result = '2 神聖傷害；拉動 1';

		expect(localize({
			canonicalEnglish: '2 holy damage; push 1',
			calculatedEnglish: '5 holy damage; push 2'
		})).toBe('5 holy damage; push 2');
	});

	it('keeps calculated English when the rewrite is outside the supported projection grammar', () => {
		expect(localize({ calculatedEnglish: '4 holy damage; `P < 0` **slowed** until the end of the encounter' }))
			.toBe('4 holy damage; `P < 0` **slowed** until the end of the encounter');
	});

	it('returns the approved raw reading when calculation made no change', () => {
		expect(localize({ calculatedEnglish: canonicalEnglish })).toBe(zhTW);
	});
});
