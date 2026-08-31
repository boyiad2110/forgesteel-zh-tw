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

	it('projects the four calculated Perk paths from canonical English while preserving raw no-Hero zh-TW and Invisible Force pass-through', () => {
		const hero = FactoryLogic.createHero();
		hero.class = { ...beastheart, level: 2, characteristics: FactoryLogic.createCharacteristics(2, 1, 0, 1, 0) };
		const protectedState = protectCanonicalState({
			label: 'Perk calculation inputs',
			capture: () => JSON.stringify({ hero, brawny: perk('perk-brawny'), luckyDog: perk('perk-lucky-dog'), friendCatapult: perk('perk-friend-catapult'), wildRumpus: perk('perk-wild-rumpus') })
		});
		const textCases = [
			{ id: 'perk-brawny', text: perk('perk-brawny').description, field: 'description', expectedHeroZhTW: '每當你的`力量`考驗失敗時，你可以消耗 1d6 + 2 點體力，將考驗的結果提升 1 階。此專長每次考驗只能使用 1 次。', expectedRawZhTWSnippet: '消耗 1d6 + 你等級的體力' },
			{ id: 'perk-lucky-dog', text: perk('perk-lucky-dog').description, field: 'description', expectedHeroZhTW: '每當你使用隱密類技能進行考驗而失敗時，你可以消耗 1d6 + 2 點體力，將考驗結果提升 1 階。此專長每次考驗只能使用 1 次。', expectedRawZhTWSnippet: '消耗 1d6 + 你等級的體力' },
			{ id: 'perk-friend-catapult-1', text: abilityText('perk-friend-catapult'), field: 'sections.0.text', expectedHeroZhTW: '你抓住 1 個相鄰的自願盟友或體型 ≦ 你的物體，然後將目標垂直推動最多 4 格。若你推動的生物因此墜落，墜落的有效距離會減少 4 格。使用此專長後，你必須至少獲得 1 點勝利值才能再次使用。', expectedRawZhTWSnippet: '垂直推動最多等於你`力量` ×2 的格數' },
			{ id: 'perk-wild-rumpus-1', text: abilityText('perk-wild-rumpus'), field: 'sections.0.text', expectedHeroZhTW: '除了各自原本的移動類型外，你與契獸也會獲得彼此的移動類型，持續 1 分鐘或直到你或契獸受到傷害為止。你與契獸都會使用雙方之中較高的速度。在首次發動此招式之後，每額外發動 1 次，你就會受到 2 點傷害，直到你完成 1 次休整或獲得 1 點以上的勝利值。這些傷害無法被任何方式減免，但也不會解除此招式的效果。', expectedRawZhTWSnippet: '受到等於你等級的傷害' }
		];
		for (const testCase of textCases) {
			const { id, text, field, expectedHeroZhTW, expectedRawZhTWSnippet } = testCase;
			assertCanonicalEnglishCalculationInput(text);
			const calculatedEnglish = AbilityLogic.getTextEffect(text, hero);
			expect(calculatedEnglish).not.toBe(text);
			expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field, canonicalEnglish: text, calculatedEnglish })).toBe(expectedHeroZhTW);
			const rawZhTW = localizeElementField('zh-TW', id, field, text);
			expect(rawZhTW).toContain(expectedRawZhTWSnippet);
			expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field, canonicalEnglish: text, calculatedEnglish: AbilityLogic.getTextEffect(text, undefined) })).toBe(rawZhTW);
		}
		const invisible = abilityText('perk-invisible-force');
		assertCanonicalEnglishCalculationInput(invisible);
		expect(AbilityLogic.getTextEffect(invisible, hero)).toBe(invisible);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'perk-invisible-force-1', field: 'sections.0.text', canonicalEnglish: invisible, calculatedEnglish: invisible })).not.toBe(invisible);
		protectedState.assertUnchanged();
	});
});
