import { describe, expect, it } from 'vitest';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { core } from '@/data/sourcebooks/official/core';
import { beastheart } from '@/data/classes/beastheart/beastheart';
import { beastheartSourcebook } from '@/data/sourcebooks/official/beastheart';
import { localizeElementField } from '@/localization/resolver';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';

const perk = (id: string) => {
	const value = [ ...core.perks, ...beastheartSourcebook.perks ].find(candidate => candidate.id === id);
	if (!value) { throw new Error(`Missing Perk ${id}`); }
	return value;
};

const abilityText = (perkID: string) => {
	const value = perk(perkID);
	if (value.type !== FeatureType.Ability) { throw new Error(`Missing ability for ${perkID}`); }
	const section = value.data.ability.sections.find(candidate => candidate.type === 'text');
	if (!section) { throw new Error(`Missing text section for ${perkID}`); }
	return section.text;
};

describe('V1 Perks localization safety', () => {
	it('localizes only the frozen Familiar path and preserves non-packet Monster fallback', () => {
		const familiarPerk = perk('perk-familiar');
		if (familiarPerk.type !== FeatureType.Summon) { throw new Error('Missing Familiar summon'); }
		const familiar = familiarPerk.data.summons[0];
		if (!familiar) { throw new Error('Missing Familiar'); }
		const nonPacketMonster = core.monsterGroups[0].monsters[0];
		const protectedState = protectCanonicalState({
			label: 'Familiar and non-packet Monster canonical data',
			capture: () => JSON.stringify({ familiar, nonPacketMonster })
		});
		let locale: 'en' | 'zh-TW' = 'zh-TW';
		const reading = (elementID: string, canonicalEnglish: string) => localizeElementField(locale, elementID, 'description', canonicalEnglish);

		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectedState ],
			assertZhTW: () => {
				expect(reading(familiar.id, familiar.description)).toContain('超自然精魂');
				expect(reading(nonPacketMonster.id, nonPacketMonster.description)).toBe(nonPacketMonster.description);
			},
			switchToEnglish: () => { locale = 'en'; },
			assertEnglish: () => expect(reading(familiar.id, familiar.description)).toBe(familiar.description),
			switchToZhTW: () => { locale = 'zh-TW'; },
			assertZhTWAfterRoundTrip: () => expect(reading(familiar.id, familiar.description)).toContain('超自然精魂')
		});
	});

	it('keeps calculated Perk text canonical-English-first with existing fallback and Invisible Force pass-through', () => {
		const hero = FactoryLogic.createHero();
		hero.class = { ...beastheart, level: 2, characteristics: FactoryLogic.createCharacteristics(2, 1, 0, 1, 0) };
		const protectedState = protectCanonicalState({
			label: 'Perk calculation inputs',
			capture: () => JSON.stringify({ hero, brawny: perk('perk-brawny'), luckyDog: perk('perk-lucky-dog'), friendCatapult: perk('perk-friend-catapult'), wildRumpus: perk('perk-wild-rumpus') })
		});
		for (const id of [ 'perk-brawny', 'perk-lucky-dog' ]) {
			const text = perk(id).description;
			assertCanonicalEnglishCalculationInput(text);
			const calculatedEnglish = AbilityLogic.getTextEffect(text, hero);
			expect(calculatedEnglish).not.toBe(text);
			// These Level B paths are intentionally not projection grammar: a changed calculation
			// must stay a whole canonical-English reading rather than creating mixed-language prose.
			expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field: 'description', canonicalEnglish: text, calculatedEnglish })).toBe(calculatedEnglish);
		}
		for (const id of [ 'perk-friend-catapult', 'perk-wild-rumpus' ]) {
			const text = abilityText(id);
			assertCanonicalEnglishCalculationInput(text);
			const calculatedEnglish = AbilityLogic.getTextEffect(text, hero);
			expect(calculatedEnglish).not.toBe(text);
			expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: `${id}-1`, field: 'sections.0.text', canonicalEnglish: text, calculatedEnglish })).toBe(calculatedEnglish);
		}
		const invisible = abilityText('perk-invisible-force');
		assertCanonicalEnglishCalculationInput(invisible);
		expect(AbilityLogic.getTextEffect(invisible, hero)).toBe(invisible);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'perk-invisible-force-1', field: 'sections.0.text', canonicalEnglish: invisible, calculatedEnglish: invisible })).not.toBe(invisible);
		protectedState.assertUnchanged();
	});
});
