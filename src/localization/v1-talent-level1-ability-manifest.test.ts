// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1TalentLevel1AbilityRequiredCanonicalEnglish,
	getV1TalentLevel1Abilities,
	v1LocalizationManifest,
	v1TalentLevel1AbilityIDs
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { talent } from '@/data/classes/talent/talent';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureField } from '@/enums/feature-field';
import { PanelMode } from '@/enums/panel-mode';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const chinese = /[一-鿿]/;

const required = createV1TalentLevel1AbilityRequiredCanonicalEnglish();
// Identity-precise (matching this slice's own required identities), not a raw elementID
// prefix match: the Talent Level 1 completion batch also owns many 'talent-'-prefixed
// identities, and a loose prefix filter would sweep those into this ability-only slice too.
const talentCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const getAbility = (id: typeof v1TalentLevel1AbilityIDs[number]) => {
	const ability = getV1TalentLevel1Abilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Talent ability '${id}' is missing`);
	}
	return ability;
};

// Reason 3 drives Talent's authored characteristic damage, distances and potencies, and
// Presence 2 drives Awe. The Slide bonus makes the calculator's own forced movement result
// unmistakable: every projected Slide value differs from each authored tier literal.
const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(0, 0, 3, 0, 2);
	hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
		id: 'talent-production-slide-bonus',
		field: FeatureField.ForcedMovementSlide,
		value: 1
	}));
	return hero;
};

const renderAbility = (id: typeof v1TalentLevel1AbilityIDs[number], hero?: ReturnType<typeof makeHero>) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(AbilityPanel, { ability: getAbility(id), hero: hero, mode: PanelMode.Full })
	)
);

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent?.trim() || '');

const tierReading = (id: typeof v1TalentLevel1AbilityIDs[number], field: string, tier: number, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getAbility(id), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const textReading = (id: typeof v1TalentLevel1AbilityIDs[number], field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Talent Level 1 ability manifest', () => {
	it('enumerates exactly the approved live Talent slice and its 131 catalog identities', () => {
		expect(getV1TalentLevel1Abilities().map(ability => ability.id)).toEqual([ ...v1TalentLevel1AbilityIDs ]);
		expect(v1TalentLevel1AbilityIDs).toHaveLength(18);
		expect(Object.keys(required)).toHaveLength(131);
		expect(talentCatalogEntries).toHaveLength(131);

		const catalogIdentities = talentCatalogEntries.map(getEntryIdentity);
		expect(new Set(catalogIdentities).size).toBe(131);
		expect(catalogIdentities.slice().sort()).toEqual(Object.keys(required).sort());
		expect(talentCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(talentCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
	});

	it('reaches Repulsive Ward through the Talent Ward choice and stops before ability 17', () => {
		const sliceIDs = [ ...v1TalentLevel1AbilityIDs ] as string[];

		// talent-1-6b is nested in the talent-1-6 Ward choice, not a direct Level 1 feature.
		expect(sliceIDs).toContain('talent-1-6b');
		expect(getAbility('talent-1-6b').name).toBe('Repulsive Ward');
		expect(talent.abilities.some(ability => ability.id === 'talent-1-6b')).toBe(false);
		// Level 1 selects signature, cost 3 and cost 5 abilities only.
		expect(getAbility('talent-ability-16').cost).toBe(5);
		expect(sliceIDs).not.toContain('talent-ability-17');
		expect(Object.keys(required).some(identity => /^element:talent-ability-(1[7-9]|[2-9]\d)\//.test(identity))).toBe(false);
		expect(getV1TalentLevel1Abilities().some(ability => /^talent-ability-(1[7-9]|[2-9]\d)$/.test(ability.id))).toBe(false);
		// Talent Traditions stay unresolved.
		expect(talent.subclasses.map(subclass => subclass.id)).toEqual([ 'talent-sub-1', 'talent-sub-2', 'talent-sub-3' ]);
		expect(talentCatalogEntries.every(entry => sliceIDs.includes(entry.elementID))).toBe(true);
	});

	it('records exactly the approved Talent glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^(Strained|Clarity|Psionic),/.test(row))).toEqual([
			'Strained,焦慮,game-term,approved',
			'Clarity,明晰,game-term,approved',
			'Psionic,靈能,game-term,approved'
		]);
	});

	it('keeps the parent authored-content domain unresolved and reports no new completeness issue', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.complete).toBe(false);
	});

	it('reproduces the Owner-finalized readings exactly and keeps every characteristic backticked', () => {
		const entry = (id: string, field: string) => {
			const found = talentCatalogEntries.find(candidate => (candidate.elementID === id) && (candidate.field === field));
			if (!found) {
				throw new Error(`Talent entry '${id}/${field}' is missing`);
			}
			return found.zhTW;
		};

		// The latest Owner decision restores these two exact readings; neither is normalized.
		expect(entry('talent-ability-9', 'sections.0.text')).toBe('若目標為盟友，他會獲得等於你`氣場` ×3 的臨時體力，而且可以解除 1 個能夠透過豁免解除或 EoT 的效果 。若目標為敵人，你進行 1 次檢定。');
		expect(entry('talent-ability-14', 'description')).toBe('你的靈能力包覆目標，並將周圍的一切推離。');
		// The two Reviewer mechanical corrections.
		expect(entry('talent-1-6b', 'sections.0.text')).toBe('你可以將攻擊者推動最多等於你`理智`的格數。');
		expect(entry('talent-ability-2', 'sections.1.effect')).toBe(entry('talent-ability-2', 'sections.1.effect').trim());
		// The reusable anchors this batch froze.
		expect(entry('talent-1-2', 'sections.1.name')).toBe('焦慮');
		expect(entry('talent-ability-11', 'name')).toBe('預知');
		expect(entry('talent-ability-16', 'name')).toBe('澄澈明晰');

		// Every Chinese characteristic reference keeps its Markdown backticks, so the approved
		// readings render as inline code rather than as bare prose.
		const characteristics = [ '理智', '氣場', '力量', '敏捷', '直覺' ];
		talentCatalogEntries.forEach(candidate => {
			characteristics.forEach(characteristic => {
				let index = candidate.zhTW.indexOf(characteristic);
				while (index >= 0) {
					const backticked = (candidate.zhTW[index - 1] === '`') && (candidate.zhTW[index + characteristic.length] === '`');
					// '心靈力量' is authored prose ('mental power'), not a characteristic reference.
					const prose = candidate.zhTW.slice(index - 2, index + characteristic.length) === '心靈力量';
					expect(backticked || prose, `${getEntryIdentity(candidate)} / ${characteristic}`).toBe(true);
					index = candidate.zhTW.indexOf(characteristic, index + 1);
				}
			});
		});
	});

	it('keeps the approved raw zh-TW reading on the Library / no-Hero path for every grammar family in this batch', () => {
		// Family A: compact damage / potency / condition, including Hoarfrost's (EoT) notation.
		expect(tierReading('talent-1-2', 'sections.0.roll.tier1', 1)).toBe('2 + `理智`心靈傷害');
		expect(tierReading('talent-ability-1', 'sections.0.roll.tier1', 1)).toBe('2 + `氣場`腐朽傷害；`氣場` < [弱]，**緩速**（豁免解除）');
		expect(tierReading('talent-ability-2', 'sections.0.roll.tier2', 2)).toBe('4 + `理智`寒冷傷害；`力量` < [中]，**緩速**（EoT）');
		// Family B: Kinetic Grip keeps the authored characteristic distance.
		expect(tierReading('talent-ability-4', 'sections.0.roll.tier1', 1)).toBe('滑動 2 + `理智`');
		expect(tierReading('talent-ability-4', 'sections.0.roll.tier3', 3)).toBe('滑動 6 + `理智`；**伏地**');
		// Family C: Smolder's trailing weakness arithmetic stays authored.
		expect(tierReading('talent-ability-12', 'sections.1.roll.tier3', 3)).toBe('9 + `理智`傷害；`理智` < [強]，目標獲得指定弱點 5 + 你的`理智`（豁免解除）');
		// Choke's tier 3 keeps its authored damage and potency and emphasizes 束縛.
		expect(tierReading('talent-ability-10', 'sections.0.roll.tier3', 3)).toBe('8 + `理智`傷害；`力量` < [強]，**束縛**（豁免解除）');
		// Family D: Reason-score prose.
		expect(textReading('talent-1-6b', 'sections.0.text')).toBe('你可以將攻擊者推動最多等於你`理智`的格數。');
		expect(textReading('talent-ability-6', 'sections.2.effect')).toBe('物體在造成傷害後隨即爆炸，與目標相鄰的每個生物都會受到等於你`理智`的傷害。你也同時受到等於你`理智`的傷害（無法被任何方式減免）。');
		expect(textReading('talent-ability-7', 'sections.2.effect')).toBe('你獲得 1 點可以立刻使用的鬥志，但你也會受到等於你`理智`的傷害（無法被任何方式減免）。');
		expect(textReading('talent-ability-15', 'sections.0.text')).toBe('目標的穩度增加等於你`理智`的數值，並獲得 10 點臨時體力和 2 點鬥志。當此招式賦予的臨時體力歸 0 時，穩度的加值也會跟著消失。');
		// Family E: Awe keeps the approved three-times-Presence expression.
		expect(textReading('talent-ability-9', 'sections.0.text')).toContain('等於你`氣場` ×3 的臨時體力');
		// Family F: only condition emphasis is added to the approved Strained effects. Both
		// 緩速 readings and the 束縛 reading are emphasized, so the calculated Markdown the
		// canonical calculator introduced is never preserved for only part of one sentence.
		expect(textReading('talent-ability-2', 'sections.1.effect')).toBe('你自己也陷入**緩速**狀態，直到你下個回合結束。此外，被此招式**緩速**的目標會改為陷入**束縛**。');
		expect(textReading('talent-ability-10', 'sections.1.text')).toBe('你可以將目標垂直拉動最多 2 格。若目標因此招式而陷入**束縛**，這次強制移動會無視他的穩度。');
		expect(textReading('talent-ability-5', 'sections.1.effect')).toBe('爆發區域 +2，但你會陷入**出血**狀態，直到你下個回合開始。');
		expect(textReading('talent-ability-13', 'sections.1.effect')).toBe('你受到 1d6 點傷害，並陷入**緩速**狀態（豁免解除）。');
		expect(textReading('talent-ability-14', 'sections.1.effect')).toBe('你陷入**虛弱**狀態（豁免解除）。若你因此方式陷入**虛弱**，每當你被強制移動時，強制移動的距離會 +5。');
	});

	it('renders the unresolved Reason readings as Markdown inline code without a Hero', () => {
		const { container } = renderAbility('talent-1-6b');

		// The approved backticks must reach the DOM as real inline code, not literal backticks.
		expect(Array.from(container.querySelectorAll('code')).map(node => node.textContent)).toEqual([ '理智' ]);
		expect(container.textContent).toContain('你可以將攻擊者推動最多等於你理智的格數。');
		expect(container.textContent).not.toContain('`');
		expect(container.textContent).not.toContain('Reason score');
	});

	it('calculates canonical English first and projects the resolved Talent values into zh-TW', () => {
		const hero = makeHero();
		const ability = getAbility('talent-ability-4');
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		// Family A resolves through the existing generic Power Roll presenter.
		expect(tierReading('talent-1-2', 'sections.0.roll.tier1', 1, hero)).toBe('5 心靈傷害');
		expect(tierReading('talent-ability-1', 'sections.0.roll.tier1', 1, hero)).toBe('4 腐朽傷害；`氣場` < 1，**緩速**（豁免解除）');
		expect(tierReading('talent-ability-2', 'sections.0.roll.tier2', 2, hero)).toBe('7 寒冷傷害；`力量` < 2，**緩速**（EoT）');
		// Family B: 2/4/6 + Reason 3 + the Slide bonus 1, and never a leftover '+ 理智'.
		expect(tierReading('talent-ability-4', 'sections.0.roll.tier1', 1, hero)).toBe('滑動 6');
		expect(tierReading('talent-ability-4', 'sections.0.roll.tier2', 2, hero)).toBe('滑動 8');
		expect(tierReading('talent-ability-4', 'sections.0.roll.tier3', 3, hero)).toBe('滑動 10；**伏地**');
		[ 1, 2, 3 ].forEach(tier => expect(tierReading('talent-ability-4', `sections.0.roll.tier${tier}`, tier, hero)).not.toContain('理智'));
		// Choke's tier 3 projects damage and potency exactly as before and emphasizes 束縛.
		expect(tierReading('talent-ability-10', 'sections.0.roll.tier1', 1, hero)).toBe('6 傷害；`力量` < 1，**緩速**（豁免解除）');
		expect(tierReading('talent-ability-10', 'sections.0.roll.tier3', 3, hero)).toBe('11 傷害；`力量` < 3，**束縛**（豁免解除）');
		expect(textReading('talent-ability-10', 'sections.1.text', hero)).toBe('你可以將目標垂直拉動最多 2 格。若目標因此招式而陷入**束縛**，這次強制移動會無視他的穩度。');
		// Family C: damage, potency and the trailing weakness arithmetic all resolve.
		expect(tierReading('talent-ability-12', 'sections.1.roll.tier1', 1, hero)).toBe('6 傷害；`理智` < 1，目標獲得指定弱點 5（豁免解除）');
		expect(tierReading('talent-ability-12', 'sections.1.roll.tier3', 3, hero)).toBe('12 傷害；`理智` < 3，目標獲得指定弱點 8（豁免解除）');
		// Family D: Reason-score prose, including Materialize's two separate damage values.
		expect(textReading('talent-1-6b', 'sections.0.text', hero)).toBe('你可以將攻擊者推動最多 3 格。');
		expect(textReading('talent-ability-6', 'sections.2.effect', hero)).toBe('物體在造成傷害後隨即爆炸，與目標相鄰的每個生物都會受到 3 點傷害。你也同時受到 3 點傷害（無法被任何方式減免）。');
		expect(textReading('talent-ability-7', 'sections.2.effect', hero)).toBe('你獲得 1 點可以立刻使用的鬥志，但你也會受到 3 點傷害（無法被任何方式減免）。');
		expect(textReading('talent-ability-14', 'sections.0.text', hero)).toContain('他可以將 1 個相鄰的生物推動最多 3 格。');
		expect(textReading('talent-ability-15', 'sections.0.text', hero)).toBe('目標的穩度增加 3，並獲得 10 點臨時體力和 2 點鬥志。當此招式賦予的臨時體力歸 0 時，穩度的加值也會跟著消失。');
		// Family E: three times Presence 2 is resolved by the calculator, not multiplied here.
		const awe = textReading('talent-ability-9', 'sections.0.text', hero);
		expect(awe).toContain('他會獲得 6 點臨時體力，');
		expect(awe).toContain('效果 。若目標為敵人，你進行 1 次檢定。');
		expect(awe).not.toContain('氣場');
		[ 'talent-1-6b/sections.0.text', 'talent-ability-6/sections.2.effect', 'talent-ability-7/sections.2.effect', 'talent-ability-15/sections.0.text' ]
			.forEach(identity => {
				const [ id, field ] = identity.split('/');
				expect(textReading(id as typeof v1TalentLevel1AbilityIDs[number], field, hero)).not.toMatch(/Reason score|理智/);
			});

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		expect(getTextEffect.mock.calls.map(([ input ]) => input).some(input => input.includes('three times your Presence score'))).toBe(true);
		expect(getTierEffectCreature.mock.calls.map(([ input ]) => input)).toContain('Slide 6 + R; prone');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders the Hero-calculated Talent readings through AbilityPanel and restores canonical English', () => {
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const kineticGrip = renderAbility('talent-ability-4', hero);
		expect(tierTexts(kineticGrip.container)).toEqual([ '滑動 6', '滑動 8', '滑動 10；伏地' ]);
		expect(Array.from(kineticGrip.container.querySelectorAll('.power-roll-row .effect strong')).map(node => node.textContent)).toEqual([ '伏地' ]);
		expect(kineticGrip.container.textContent).not.toContain('理智');

		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));
		expect(tierTexts(kineticGrip.container)).toEqual([ 'Slide 6', 'Slide 8', 'Slide 10; prone' ]);
		expect(kineticGrip.container.textContent).not.toMatch(chinese);
		kineticGrip.unmount();

		const smolder = renderAbility('talent-ability-12', hero);
		expect(tierTexts(smolder.container)).toEqual([
			'6 傷害；理智 < 1，目標獲得指定弱點 5（豁免解除）',
			'9 傷害；理智 < 2，目標獲得指定弱點 5（豁免解除）',
			'12 傷害；理智 < 3，目標獲得指定弱點 8（豁免解除）'
		]);
		expect(smolder.container.textContent).not.toContain('weakness');
		smolder.unmount();

		const choke = renderAbility('talent-ability-10', hero);
		expect(tierTexts(choke.container)).toEqual([
			'6 傷害；力量 < 1，緩速（豁免解除）',
			'8 傷害；力量 < 2，緩速（豁免解除）',
			'11 傷害；力量 < 3，束縛（豁免解除）'
		]);
		// The approved 束縛 reading reaches the DOM as real emphasis, exactly like 緩速.
		expect(Array.from(choke.container.querySelectorAll('.power-roll-row .effect strong')).map(node => node.textContent)).toEqual([ '緩速', '緩速', '束縛' ]);
		expect(Array.from(choke.container.querySelectorAll('strong')).map(node => node.textContent)).toContain('束縛');
		expect(choke.container.textContent).toContain('若目標因此招式而陷入束縛，這次強制移動會無視他的穩度。');
		expect(choke.container.textContent).not.toContain('restrained');
		choke.unmount();

		const awe = renderAbility('talent-ability-9', hero);
		expect(awe.container.textContent).toContain('他會獲得 6 點臨時體力');
		expect(awe.container.textContent).not.toContain('temporary Stamina');
		awe.unmount();

		const iron = renderAbility('talent-ability-15', hero);
		expect(iron.container.textContent).toContain('目標的穩度增加 3，並獲得 10 點臨時體力和 2 點鬥志。');
		expect(iron.container.textContent).not.toContain('stability increases');
		iron.unmount();

		const inertiaSoak = renderAbility('talent-ability-14', hero);
		expect(inertiaSoak.container.textContent).toContain('你的靈能力包覆目標，並將周圍的一切推離。');
		expect(inertiaSoak.container.textContent).toContain('他可以將 1 個相鄰的生物推動最多 3 格。');
		expect(Array.from(inertiaSoak.container.querySelectorAll('strong')).map(node => node.textContent)).toContain('虛弱');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('falls back to the whole calculated English result rather than a mixed partial reading', () => {
		const canonicalEnglish = required[elementFieldIdentity('talent-ability-15', 'sections.0.text')];
		// A structural rewrite this batch does not authorize: the approved zh-TW grammar can no
		// longer be projected, so the entire calculated English reading is returned instead.
		const unsupported = canonicalEnglish.replace('The target’s stability increases by an amount equal to your Reason score,', 'The target’s stability is doubled,');

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'talent-ability-15',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupported
		})).toBe(unsupported);

		// The same projection is refused for an identity it was not approved against.
		const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, makeHero());
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'talent-ability-16',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		})).toBe(calculatedEnglish);

		// A Power Roll tier whose structure the calculator mutated beyond the approved grammar.
		const tierCanonical = required[elementFieldIdentity('talent-ability-4', 'sections.0.roll.tier3')];
		expect(localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: 'talent-ability-4',
			field: 'sections.0.roll.tier3',
			canonicalEnglish: tierCanonical,
			calculatedEnglish: 'Slide 9 squares; **prone**'
		})).toBe('Slide 9 squares; **prone**');

		// English keeps the canonical calculated reading.
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'talent-ability-15',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		})).toBe(calculatedEnglish);
	});
});
