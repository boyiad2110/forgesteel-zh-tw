// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1BeastheartLevel1BaseAbilityRequiredCanonicalEnglish,
	getV1BeastheartLevel1BaseAbilities,
	v1BeastheartLevel1BaseAbilityIDs,
	v1LocalizationManifest
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
import { beastheart } from '@/data/classes/beastheart/beastheart';
import { FactoryLogic } from '@/logic/factory-logic';
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

const required = createV1BeastheartLevel1BaseAbilityRequiredCanonicalEnglish();

// The approved slice, transcribed from packet `beastheart-l1-base-ability-localization-r1`
// rather than generated from the enumerator under test, so a change to that enumerator cannot
// silently redefine what this slice is expected to contain.
const approvedSliceIdentities = [
	'element:beastheart-ability-1/name',
	'element:beastheart-ability-1/target',
	'element:beastheart-ability-1/description',
	'element:beastheart-ability-1/sections.0.text',
	'element:beastheart-ability-1/sections.1.roll.tier1',
	'element:beastheart-ability-1/sections.1.roll.tier2',
	'element:beastheart-ability-1/sections.1.roll.tier3',
	'element:beastheart-ability-2/name',
	'element:beastheart-ability-2/target',
	'element:beastheart-ability-2/description',
	'element:beastheart-ability-2/sections.0.roll.tier1',
	'element:beastheart-ability-2/sections.0.roll.tier2',
	'element:beastheart-ability-2/sections.0.roll.tier3',
	'element:beastheart-ability-2/sections.1.text',
	'element:beastheart-ability-3/name',
	'element:beastheart-ability-3/target',
	'element:beastheart-ability-3/description',
	'element:beastheart-ability-3/sections.0.roll.tier1',
	'element:beastheart-ability-3/sections.0.roll.tier2',
	'element:beastheart-ability-3/sections.0.roll.tier3',
	'element:beastheart-ability-3/sections.1.text',
	'element:beastheart-ability-4/name',
	'element:beastheart-ability-4/target',
	'element:beastheart-ability-4/description',
	'element:beastheart-ability-4/sections.0.roll.tier1',
	'element:beastheart-ability-4/sections.0.roll.tier2',
	'element:beastheart-ability-4/sections.0.roll.tier3',
	'element:beastheart-ability-4/sections.1.text',
	'element:beastheart-ability-5/name',
	'element:beastheart-ability-5/target',
	'element:beastheart-ability-5/description',
	'element:beastheart-ability-5/sections.0.roll.tier1',
	'element:beastheart-ability-5/sections.0.roll.tier2',
	'element:beastheart-ability-5/sections.0.roll.tier3',
	'element:beastheart-ability-5/sections.1.name',
	'element:beastheart-ability-5/sections.1.effect',
	'element:beastheart-ability-6/name',
	'element:beastheart-ability-6/target',
	'element:beastheart-ability-6/description',
	'element:beastheart-ability-6/sections.0.roll.tier1',
	'element:beastheart-ability-6/sections.0.roll.tier2',
	'element:beastheart-ability-6/sections.0.roll.tier3',
	'element:beastheart-ability-6/sections.1.text',
	'element:beastheart-ability-7/name',
	'element:beastheart-ability-7/target',
	'element:beastheart-ability-7/description',
	'element:beastheart-ability-7/sections.0.roll.tier1',
	'element:beastheart-ability-7/sections.0.roll.tier2',
	'element:beastheart-ability-7/sections.0.roll.tier3',
	'element:beastheart-ability-8/name',
	'element:beastheart-ability-8/target',
	'element:beastheart-ability-8/description',
	'element:beastheart-ability-8/sections.0.roll.tier1',
	'element:beastheart-ability-8/sections.0.roll.tier2',
	'element:beastheart-ability-8/sections.0.roll.tier3',
	'element:beastheart-ability-8/sections.1.text',
	'element:beastheart-ability-9/name',
	'element:beastheart-ability-9/target',
	'element:beastheart-ability-9/description',
	'element:beastheart-ability-9/sections.0.text',
	'element:beastheart-ability-9/sections.1.name',
	'element:beastheart-ability-9/sections.1.effect',
	'element:beastheart-ability-10/name',
	'element:beastheart-ability-10/target',
	'element:beastheart-ability-10/description',
	'element:beastheart-ability-10/sections.0.roll.tier1',
	'element:beastheart-ability-10/sections.0.roll.tier2',
	'element:beastheart-ability-10/sections.0.roll.tier3',
	'element:beastheart-ability-10/sections.1.text',
	'element:beastheart-ability-11/name',
	'element:beastheart-ability-11/target',
	'element:beastheart-ability-11/description',
	'element:beastheart-ability-11/sections.0.roll.tier1',
	'element:beastheart-ability-11/sections.0.roll.tier2',
	'element:beastheart-ability-11/sections.0.roll.tier3',
	'element:beastheart-ability-11/sections.1.text',
	'element:beastheart-ability-12/name',
	'element:beastheart-ability-12/target',
	'element:beastheart-ability-12/description',
	'element:beastheart-ability-12/sections.0.roll.tier1',
	'element:beastheart-ability-12/sections.0.roll.tier2',
	'element:beastheart-ability-12/sections.0.roll.tier3',
	'element:beastheart-ability-12/sections.1.text'
];

// Identity-precise rather than a loose `beastheart-` prefix match: the Companion records, the
// two Level 1 feature abilities and the Wild Nature subclasses all share that prefix, and a
// prefix filter would sweep them into this ability-only slice as soon as they are translated.
const beastheartCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const getAbility = (id: typeof v1BeastheartLevel1BaseAbilityIDs[number]) => {
	const ability = getV1BeastheartLevel1BaseAbilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Beastheart ability '${id}' is missing`);
	}
	return ability;
};

// Might 2 drives the '+ M' damage tiers and Intuition 3 the '+ I' ones, so the two are never
// confusable in an assertion. AbilityLogic derives every potency from the Hero’s highest
// characteristic, which is Intuition here, giving weak 1 / average 2 / strong 3.
const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(2, 1, 0, 3, 1);
	return hero;
};

const renderAbility = (id: typeof v1BeastheartLevel1BaseAbilityIDs[number], hero?: ReturnType<typeof makeHero>) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(AbilityPanel, { ability: getAbility(id), hero: hero, mode: PanelMode.Full })
	)
);

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent?.trim() || '');

const tierReading = (id: typeof v1BeastheartLevel1BaseAbilityIDs[number], field: string, tier: number, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getAbility(id), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const textReading = (id: typeof v1BeastheartLevel1BaseAbilityIDs[number], field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Beastheart Level 1 base ability localization', () => {
	it('enumerates exactly the approved 83-identity Beastheart Level 1 base-ability slice', () => {
		expect(getV1BeastheartLevel1BaseAbilities().map(ability => ability.id)).toEqual([ ...v1BeastheartLevel1BaseAbilityIDs ]);
		expect(v1BeastheartLevel1BaseAbilityIDs).toHaveLength(12);
		expect(approvedSliceIdentities).toHaveLength(83);
		expect(Object.keys(required).sort()).toEqual([ ...approvedSliceIdentities ].sort());

		const catalogIdentities = beastheartCatalogEntries.map(getEntryIdentity);
		expect(catalogIdentities).toHaveLength(83);
		expect(new Set(catalogIdentities).size).toBe(83);
		expect(catalogIdentities.slice().sort()).toEqual([ ...approvedSliceIdentities ].sort());
		expect(beastheartCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(beastheartCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
	});

	it('excludes the feature abilities, Companion records, subclasses and ability 13 and later', () => {
		const sliceIDs = [ ...v1BeastheartLevel1BaseAbilityIDs ] as string[];

		// The two Level 1 feature abilities exist in the live class data and are still excluded.
		expect(beastheart.featuresByLevel.some(level => JSON.stringify(level.features).includes('beastheart-1-3a'))).toBe(true);
		expect(sliceIDs).not.toContain('beastheart-1-3a');
		expect(sliceIDs).not.toContain('beastheart-1-3b');
		expect(Object.keys(required).some(identity => /^element:beastheart-1-3[ab]:/.test(identity))).toBe(false);

		// No Companion or Summon record reaches this slice.
		expect(Object.keys(required).some(identity => identity.includes('beastheart-companion'))).toBe(false);
		expect(Object.keys(required).some(identity => identity.includes('summon'))).toBe(false);

		// The four Wild Nature subclasses stay outside the slice.
		expect(beastheart.subclasses.map(subclass => subclass.id)).toEqual([ 'beastheart-sub-1', 'beastheart-sub-2', 'beastheart-sub-3', 'beastheart-sub-4' ]);
		expect(Object.keys(required).some(identity => identity.startsWith('element:beastheart-sub-'))).toBe(false);

		// Ability 13 exists and is deliberately the first one left out.
		expect(beastheart.abilities.some(ability => ability.id === 'beastheart-ability-13')).toBe(true);
		expect(sliceIDs).not.toContain('beastheart-ability-13');
		expect(Object.keys(required).some(identity => /^element:beastheart-ability-(1[3-9]|[2-9]\d):/.test(identity))).toBe(false);
		expect(beastheartCatalogEntries.every(entry => sliceIDs.includes(entry.elementID))).toBe(true);
	});

	it('records no glossary change for this batch', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		// 契獸 is approved only inside this batch’s own identities; no reusable Companion mapping
		// was approved, so the glossary must not gain one.
		expect(rows.some(row => row.includes('契獸'))).toBe(false);
		expect(rows.some(row => /^Companion,/.test(row))).toBe(false);
		expect(rows).toContain('Beastheart,獸魂者,game-term,approved');
	});

	it('keeps the parent domains unresolved and reports no new completeness issue', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('reproduces the Owner-approved readings exactly', () => {
		const entry = (id: string, field: string) => {
			const found = beastheartCatalogEntries.find(candidate => (candidate.elementID === id) && (candidate.field === field));
			if (!found) {
				throw new Error(`Beastheart entry '${id}/${field}' is missing`);
			}
			return found;
		};

		// The Owner overrode these three Hungry like the Wolf tiers back to 契獸 after review.
		expect(entry('beastheart-ability-7', 'sections.0.roll.tier1').zhTW).toBe('4 + `力量`傷害；你的契獸可以花費 1 點復元力');
		expect(entry('beastheart-ability-7', 'sections.0.roll.tier2').zhTW).toBe('7 + `力量`傷害；你和你的契獸都可以各花費 1 點復元力');
		expect(entry('beastheart-ability-7', 'sections.0.roll.tier3').zhTW).toBe('11 + `力量`傷害；`敏捷` < [強]，出血（EoT）；你和你的契獸都可以各花費 1 點復元力並遁移最多 2 格');
		// The one permitted mechanical correction: no trailing whitespace on this name.
		expect(entry('beastheart-ability-12', 'name').zhTW).toBe('寸步獵殺');
		expect(beastheartCatalogEntries.every(candidate => candidate.zhTW === candidate.zhTW.trim())).toBe(true);
		// No approved value carries a synthetic truncation ellipsis.
		expect(beastheartCatalogEntries.some(candidate => candidate.canonicalEnglish.endsWith('...') || candidate.zhTW.endsWith('...'))).toBe(false);

		// Every Chinese characteristic reference keeps its Markdown backticks. All of You Versus
		// All of Me’s description is the one exception: its canonical “shatter yourselves against
		// your might!” is flavour prose, not a characteristic reference, so its 力量 is deliberately
		// left unbackticked and never reaches a calculated projection.
		const characteristics = [ '氣場', '敏捷', '直覺', '理智', '力量' ];
		const flavourProse = elementFieldIdentity('beastheart-ability-9', 'description');
		expect(required[flavourProse]).toBe('Let all of them come forward and shatter yourselves against your might!');
		beastheartCatalogEntries.filter(candidate => getEntryIdentity(candidate) !== flavourProse).forEach(candidate => {
			characteristics.forEach(characteristic => {
				let index = candidate.zhTW.indexOf(characteristic);
				while (index >= 0) {
					expect((candidate.zhTW[index - 1] === '`') && (candidate.zhTW[index + characteristic.length] === '`'), `${getEntryIdentity(candidate)} / ${characteristic}`).toBe(true);
					index = candidate.zhTW.indexOf(characteristic, index + 1);
				}
			});
		});
	});

	it('keeps the approved raw zh-TW reading on the Library / no-Hero path for every calculated family', () => {
		// Family 1: the shared compact `N + M/I damage` grammar, with and without trailing prose.
		expect(tierReading('beastheart-ability-1', 'sections.1.roll.tier1', 1)).toBe('3 + `直覺`傷害');
		expect(tierReading('beastheart-ability-7', 'sections.0.roll.tier1', 1)).toBe('4 + `力量`傷害；你的契獸可以花費 1 點復元力');
		// Family 2: Stormrage keeps its approved multi-type expression unresolved.
		expect(tierReading('beastheart-ability-4', 'sections.0.roll.tier1', 1)).toBe('2 + `力量`寒冷、火焰、閃電或音波傷害');
		// Family 3: damage, potency, condition emphasis and forced movement together.
		expect(tierReading('beastheart-ability-6', 'sections.0.roll.tier1', 1)).toBe('5 + `力量`傷害；滑動 1；`直覺` < [弱]，**虛弱**（豁免解除）');
		expect(tierReading('beastheart-ability-5', 'sections.0.roll.tier3', 3)).toBe('7 音波傷害；推動 3；`氣場` < [強]，**畏縮**（豁免解除）');
		expect(tierReading('beastheart-ability-12', 'sections.0.roll.tier1', 1)).toBe('8 + `力量`傷害；`力量` < [弱]，**擒制**');
		expect(tierReading('beastheart-ability-7', 'sections.0.roll.tier3', 3)).toBe('11 + `力量`傷害；`敏捷` < [強]，**出血**（EoT）；你和你的契獸都可以各花費 1 點復元力並遁移最多 2 格');
		// Family 4: the three Beastheart Intuition readings keep the approved unresolved wording.
		expect(textReading('beastheart-ability-2', 'sections.1.text')).toBe('你的契獸可以發動 1 次近戰基礎打擊。你和契獸都可以遁移最多等於你`直覺`的距離。');
		expect(textReading('beastheart-ability-3', 'sections.1.text')).toBe('若目標沒有處於**伏地**，他必須使用免費反應動作進入**伏地**，否則會額外受到等於你`直覺` ×2 的傷害。你的契獸可以遁移最多等於其`直覺`的距離。');
		expect(textReading('beastheart-ability-8', 'sections.1.text')).toBe('此強制移動可以穿過你的方格，但不能在你的方格內結束。若目標穿過你的方格，目標會陷入**伏地**，並額外受到等於你`直覺`的傷害。');
		// Family 5: condition emphasis only, once and twice in the same reading.
		expect(textReading('beastheart-ability-9', 'sections.0.text')).toBe('你可以花費 1 點復元力，並獲得目標數量 ×3 的臨時體力。每個目標都會被你**嘲諷**，直到各自的下個回合結束。');
		expect(textReading('beastheart-ability-9', 'sections.1.effect')).toBe('此招式也會影響以你的契獸為源點的 3 格爆發區域。第 2 個區域內的目標會被你的契獸**嘲諷**。同時位於 2 個區域內的敵人只會被你**嘲諷**。');
		expect(textReading('beastheart-ability-10', 'sections.1.text')).toBe('若目標因為這次傷害而死亡，或在受到這次傷害後陷入疲態或**出血**，你會獲得 2 點鬥志。');
		// Rain of Fire’s plain numeric tiers are outside the calculated matrix and read the same way.
		expect(tierReading('beastheart-ability-11', 'sections.0.roll.tier1', 1)).toBe('3 火焰傷害');
	});

	it('calculates canonical English first and projects the resolved Beastheart values into zh-TW', () => {
		const hero = makeHero();
		const ability = getAbility('beastheart-ability-4');
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		// Family 1 resolves through the existing shared Power Roll presenter.
		expect(tierReading('beastheart-ability-1', 'sections.1.roll.tier1', 1, hero)).toBe('6 傷害');
		expect(tierReading('beastheart-ability-2', 'sections.0.roll.tier1', 1, hero)).toBe('4 傷害');
		expect(tierReading('beastheart-ability-7', 'sections.0.roll.tier1', 1, hero)).toBe('6 傷害；你的契獸可以花費 1 點復元力');
		// Family 2: only the resolved Might arithmetic is carried into the approved type list.
		expect(tierReading('beastheart-ability-4', 'sections.0.roll.tier1', 1, hero)).toBe('4 寒冷、火焰、閃電或音波傷害');
		expect(tierReading('beastheart-ability-4', 'sections.0.roll.tier2', 2, hero)).toBe('6 寒冷、火焰、閃電或音波傷害');
		expect(tierReading('beastheart-ability-4', 'sections.0.roll.tier3', 3, hero)).toBe('8 寒冷、火焰、閃電或音波傷害');
		// Family 3: damage, potency, condition and forced movement resolve together.
		expect(tierReading('beastheart-ability-5', 'sections.0.roll.tier1', 1, hero)).toBe('3 音波傷害；推動 1；`氣場` < 1，**嘲諷**（豁免解除）');
		expect(tierReading('beastheart-ability-6', 'sections.0.roll.tier3', 3, hero)).toBe('13 傷害；滑動 4；`直覺` < 3，**虛弱**（豁免解除）');
		expect(tierReading('beastheart-ability-7', 'sections.0.roll.tier3', 3, hero)).toBe('13 傷害；`敏捷` < 3，**出血**（EoT）；你和你的契獸都可以各花費 1 點復元力並遁移最多 2 格');
		expect(tierReading('beastheart-ability-12', 'sections.0.roll.tier1', 1, hero)).toBe('10 傷害；`力量` < 1，**擒制**');
		// Family 4: the Hero’s Intuition of 3 resolves, doubled where the canonical text doubles it.
		const comeOn = textReading('beastheart-ability-2', 'sections.1.text', hero);
		expect(comeOn).toBe('你的契獸可以發動 1 次近戰基礎打擊。你和契獸都可以遁移最多 3 格。');
		expect(comeOn).not.toContain('直覺');
		expect(textReading('beastheart-ability-3', 'sections.1.text', hero)).toBe('若目標沒有處於**伏地**，他必須使用免費反應動作進入**伏地**，否則會額外受到 6 點傷害。你的契獸可以遁移最多等於其`直覺`的距離。');
		expect(textReading('beastheart-ability-8', 'sections.1.text', hero)).toBe('此強制移動可以穿過你的方格，但不能在你的方格內結束。若目標穿過你的方格，目標會陷入**伏地**，並額外受到 3 點傷害。');
		// Family 5 is unchanged by a Hero and never falls back to English.
		expect(textReading('beastheart-ability-9', 'sections.1.effect', hero)).toBe('此招式也會影響以你的契獸為源點的 3 格爆發區域。第 2 個區域內的目標會被你的契獸**嘲諷**。同時位於 2 個區域內的敵人只會被你**嘲諷**。');
		// Rain of Fire stays exactly the approved authored reading.
		expect(tierReading('beastheart-ability-11', 'sections.0.roll.tier1', 1, hero)).toBe('3 火焰傷害');

		// Calculation only ever sees canonical English, and neither the ability nor the Hero moves.
		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		expect(getTierEffectCreature.mock.calls.map(([ input ]) => input)).toContain('2 + M cold, fire, lightning, or sonic damage');
		expect(getTextEffect.mock.calls.map(([ input ]) => input).some(input => input.includes('equal to twice your Intuition score'))).toBe(true);
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders the Hero-calculated Beastheart readings through AbilityPanel and restores canonical English', () => {
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const stormrage = renderAbility('beastheart-ability-4', hero);
		expect(tierTexts(stormrage.container)).toEqual([
			'4 寒冷、火焰、閃電或音波傷害',
			'6 寒冷、火焰、閃電或音波傷害',
			'8 寒冷、火焰、閃電或音波傷害'
		]);
		expect(stormrage.container.textContent).toContain('你的契獸可以使用免費反應動作發動此招式');
		expect(stormrage.container.textContent).not.toContain('cold, fire, lightning');

		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));
		expect(tierTexts(stormrage.container)).toEqual([
			'4 cold, fire, lightning, sonic damage',
			'6 cold, fire, lightning, sonic damage',
			'8 cold, fire, lightning, sonic damage'
		]);
		expect(stormrage.container.textContent).not.toMatch(chinese);
		stormrage.unmount();

		const coveringFire = renderAbility('beastheart-ability-3', hero);
		expect(coveringFire.container.textContent).toContain('否則會額外受到 6 點傷害。');
		expect(coveringFire.container.textContent).toContain('你的契獸可以遁移最多等於其直覺的距離。');
		expect(Array.from(coveringFire.container.querySelectorAll('strong')).map(node => node.textContent)).toContain('伏地');
		expect(coveringFire.container.textContent).not.toContain('prone');
		expect(coveringFire.container.textContent).not.toContain('`');
		coveringFire.unmount();

		const herdTheSheep = renderAbility('beastheart-ability-6', hero);
		expect(tierTexts(herdTheSheep.container)).toEqual([
			'7 傷害；滑動 1；直覺 < 1，虛弱（豁免解除）',
			'10 傷害；滑動 2；直覺 < 2，虛弱（豁免解除）',
			'13 傷害；滑動 4；直覺 < 3，虛弱（豁免解除）'
		]);
		expect(Array.from(herdTheSheep.container.querySelectorAll('.power-roll-row .effect strong')).map(node => node.textContent)).toEqual([ '虛弱', '虛弱', '虛弱' ]);
		herdTheSheep.unmount();

		const comeOn = renderAbility('beastheart-ability-2', hero);
		expect(comeOn.container.textContent).toContain('你和契獸都可以遁移最多 3 格。');
		expect(comeOn.container.textContent).not.toContain('Intuition score');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders the unresolved Beastheart readings as Markdown inline code without a Hero', () => {
		const { container } = renderAbility('beastheart-ability-2');

		expect(Array.from(container.querySelectorAll('code')).map(node => node.textContent)).toContain('直覺');
		expect(container.textContent).toContain('你和契獸都可以遁移最多等於你直覺的距離。');
		expect(container.textContent).not.toContain('`');
		expect(container.textContent).not.toContain('Intuition score');
	});

	it('falls back to the whole calculated English result rather than a mixed partial reading', () => {
		const hero = makeHero();
		const stormrageCanonical = required[elementFieldIdentity('beastheart-ability-4', 'sections.0.roll.tier1')];
		const stormrageCalculated = AbilityLogic.getTierEffectCreature(stormrageCanonical, 1, getAbility('beastheart-ability-4'), undefined, hero);

		// The Stormrage projection is refused for an identity it was not approved against.
		expect(localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: 'beastheart-ability-10',
			field: 'sections.0.roll.tier1',
			canonicalEnglish: stormrageCanonical,
			calculatedEnglish: stormrageCalculated
		})).toBe(stormrageCalculated);

		// And for a calculated grammar this batch does not authorize.
		const unsupportedTier = '4 cold damage and 4 fire damage';
		expect(localizePowerRollTierPresentation({
			locale: 'zh-TW',
			abilityID: 'beastheart-ability-4',
			field: 'sections.0.roll.tier1',
			canonicalEnglish: stormrageCanonical,
			calculatedEnglish: unsupportedTier
		})).toBe(unsupportedTier);

		// English keeps the canonical calculated reading.
		expect(localizePowerRollTierPresentation({
			locale: 'en',
			abilityID: 'beastheart-ability-4',
			field: 'sections.0.roll.tier1',
			canonicalEnglish: stormrageCanonical,
			calculatedEnglish: stormrageCalculated
		})).toBe(stormrageCalculated);

		const comeOnCanonical = required[elementFieldIdentity('beastheart-ability-2', 'sections.1.text')];
		const comeOnCalculated = AbilityLogic.getTextEffect(comeOnCanonical, hero);

		// The Intuition projection is refused for an identity it was not approved against.
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'beastheart-ability-11',
			field: 'sections.1.text',
			canonicalEnglish: comeOnCanonical,
			calculatedEnglish: comeOnCalculated
		})).toBe(comeOnCalculated);

		// A structural rewrite this batch does not authorize falls back whole.
		const unsupportedText = comeOnCanonical.replace('You both shift up to a number of squares equal to your Intuition score.', 'You both teleport up to 3 squares.');
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'beastheart-ability-2',
			field: 'sections.1.text',
			canonicalEnglish: comeOnCanonical,
			calculatedEnglish: unsupportedText
		})).toBe(unsupportedText);
	});
});
