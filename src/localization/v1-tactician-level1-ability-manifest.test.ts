// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1TacticianLevel1AbilityRequiredCanonicalEnglish,
	getV1TacticianLevel1Abilities,
	v1LocalizationManifest,
	v1TacticianLevel1AbilityIDs
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

const required = createV1TacticianLevel1AbilityRequiredCanonicalEnglish();
const tacticianCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	entry.kind === 'element-field' && entry.elementID.startsWith('tactician-')
));

const getAbility = (id: typeof v1TacticianLevel1AbilityIDs[number]) => {
	const ability = getV1TacticianLevel1Abilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Tactician ability '${id}' is missing`);
	}
	return ability;
};

// Might 2 drives the authored characteristic damage and Might potency, Reason 3 drives the
// Mark: Trigger prose and the Reason potency. The Speed bonus makes the acting Hero's own
// Speed (7) unmistakable, so a wrongly substituted 'their speed' could not go unnoticed.
const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(2, 0, 3, 0, 0);
	hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
		id: 'tactician-production-speed-bonus',
		field: FeatureField.Speed,
		value: 2
	}));
	return hero;
};

const renderAbility = (id: typeof v1TacticianLevel1AbilityIDs[number], hero?: ReturnType<typeof makeHero>) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(AbilityPanel, { ability: getAbility(id), hero: hero, mode: PanelMode.Full })
	)
);

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent?.trim() || '');

const tierReading = (id: typeof v1TacticianLevel1AbilityIDs[number], field: string, tier: number, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getAbility(id), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const textReading = (id: typeof v1TacticianLevel1AbilityIDs[number], field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Tactician Level 1 ability manifest', () => {
	it('enumerates exactly the approved live Tactician slice and its 59 catalog identities', () => {
		expect(getV1TacticianLevel1Abilities().map(ability => ability.id)).toEqual([ ...v1TacticianLevel1AbilityIDs ]);
		expect(v1TacticianLevel1AbilityIDs).toHaveLength(11);
		expect(Object.keys(required)).toHaveLength(59);
		expect(tacticianCatalogEntries).toHaveLength(59);

		const catalogIdentities = tacticianCatalogEntries.map(getEntryIdentity);
		expect(new Set(catalogIdentities).size).toBe(59);
		expect(catalogIdentities.slice().sort()).toEqual(Object.keys(required).sort());
		expect(tacticianCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(tacticianCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
	});

	it('reaches the two Mark abilities through the Level 1 Multiple feature and stops at cost 7', () => {
		const sliceIDs = [ ...v1TacticianLevel1AbilityIDs ] as string[];

		// tactician-1-5a/b are nested under the tactician-1-5 Multiple feature, not top-level.
		expect(sliceIDs).toContain('tactician-1-5a');
		expect(sliceIDs).toContain('tactician-1-5b');
		expect(getAbility('tactician-1-5b').type.trigger).toContain('a creature marked by you');
		// Level 1 selects cost 3 and cost 5 abilities only.
		expect(getAbility('tactician-ability-8').cost).toBe(5);
		expect(sliceIDs).not.toContain('tactician-ability-9');
		expect(Object.keys(required).some(identity => identity.startsWith('element:tactician-ability-9/'))).toBe(false);
		expect(getV1TacticianLevel1Abilities().some(ability => /^tactician-ability-([9]|1\d|2\d)$/.test(ability.id))).toBe(false);
		expect(tacticianCatalogEntries.every(entry => sliceIDs.includes(entry.elementID))).toBe(true);
	});

	it('records exactly the approved Mark glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => row.startsWith('Mark,'))).toEqual([ 'Mark,標記,game-term,approved' ]);
	});

	it('keeps the parent authored-content domain unresolved and reports no new completeness issue', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.complete).toBe(false);
	});

	it('keeps the approved raw zh-TW reading on the Library / no-Hero path for every grammar family in this batch', () => {
		// Mark: Trigger keeps both Reason-score expressions unresolved, each carrying the
		// approved characteristic Markdown.
		const markTrigger = textReading('tactician-1-5b', 'sections.0.text');
		expect(markTrigger).toContain('該招式額外造成你`理智` × 2 的傷害。');
		expect(markTrigger).toContain('造成傷害的生物可以遁移最多等於你`理智`的格數。');
		expect(markTrigger).toContain('每次觸發最多只能選擇 1 個效果。');
		expect(markTrigger).not.toMatch(/Reason score/);
		// Characteristic damage + potency + condition.
		expect(tierReading('tactician-ability-2', 'sections.0.roll.tier1', 1)).toBe('3 + `力量`傷害；`力量` < [弱]，**暈眩**（豁免解除）');
		expect(tierReading('tactician-ability-6', 'sections.1.roll.tier1', 1)).toBe('4 + `力量`傷害；`理智` < [弱]，**虛弱**（豁免解除）');
		// Characteristic damage with trailing authored effect prose.
		expect(tierReading('tactician-ability-3', 'sections.0.roll.tier1', 1)).toBe('3 + `力量`傷害；你自己或 10 格內的 1 個盟友可以花費 1 點復元力');
		expect(tierReading('tactician-ability-5', 'sections.0.roll.tier3', 3)).toBe('12 + `力量`傷害；位於你 10 格內的 2 個盟友都可以使用免費反應動作對目標發動 1 次打擊招牌招式（檢定帶有 1 個優勢）');
		// Target-relative Speed.
		expect(textReading('tactician-ability-4', 'sections.0.text')).toBe('每個目標都可以移動最多等於自身速度的距離。');

		const { container } = renderAbility('tactician-ability-3');
		expect(container.textContent).toContain('你自己或 10 格內的 1 個盟友可以花費 1 點復元力');
		expect(container.textContent).not.toContain('spend a Recovery');
		expect(tierTexts(container)[0]).toBe('3 + 力量傷害；你自己或 10 格內的 1 個盟友可以花費 1 點復元力');
	});

	it('renders both unresolved Reason readings as Markdown inline code without a Hero', () => {
		const { container } = renderAbility('tactician-1-5b');

		// The approved backticks must reach the DOM as real inline code, not literal
		// backticks in the text, so the characteristic gets its normal styling.
		expect(Array.from(container.querySelectorAll('code')).map(node => node.textContent)).toEqual([ '理智', '理智' ]);
		expect(container.textContent).toContain('該招式額外造成你理智 × 2 的傷害。');
		expect(container.textContent).toContain('造成傷害的生物可以遁移最多等於你理智的格數。');
		expect(container.textContent).not.toContain('`');
		expect(container.textContent).not.toContain('Reason score');
	});

	it('calculates canonical English first and projects the resolved Tactician values into zh-TW', () => {
		const hero = makeHero();
		const ability = getAbility('tactician-1-5b');
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		// Mark: Trigger resolves twice-Reason damage and the Reason shift, and keeps the
		// approved taunted emphasis; neither value is a copied authored literal.
		const markTrigger = textReading('tactician-1-5b', 'sections.0.text', hero);
		expect(markTrigger).toContain('該招式額外造成 6 點傷害。');
		expect(markTrigger).toContain('造成傷害的生物可以遁移最多 3 格。');
		expect(markTrigger).toContain('**嘲諷**');
		expect(markTrigger).not.toContain('你`理智` × 2');
		expect(markTrigger).not.toContain('等於你`理智`');
		expect(markTrigger).not.toContain('理智');
		expect(markTrigger).not.toMatch(/Reason score|equal to \d/);
		// Characteristic damage + potency resolve through the existing Power Roll path.
		expect(tierReading('tactician-ability-2', 'sections.0.roll.tier1', 1, hero)).toBe('5 傷害；`力量` < 1，**暈眩**（豁免解除）');
		expect(tierReading('tactician-ability-6', 'sections.1.roll.tier3', 3, hero)).toBe('12 傷害；`理智` < 3，**虛弱**（豁免解除）');
		// Only the leading damage is projected; the trailing authored prose stays approved zh-TW.
		expect(tierReading('tactician-ability-3', 'sections.0.roll.tier1', 1, hero)).toBe('5 傷害；你自己或 10 格內的 1 個盟友可以花費 1 點復元力');
		expect(tierReading('tactician-ability-5', 'sections.0.roll.tier3', 3, hero)).toBe('14 傷害；位於你 10 格內的 2 個盟友都可以使用免費反應動作對目標發動 1 次打擊招牌招式（檢定帶有 1 個優勢）');
		// 'their speed' is target-relative: it must not become this Hero's Speed of 7.
		expect(textReading('tactician-ability-4', 'sections.0.text', hero)).toBe('每個目標都可以移動最多等於自身速度的距離。');
		expect(textReading('tactician-ability-4', 'sections.0.text', hero)).not.toContain('7');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		expect(getTextEffect.mock.calls.map(([ input ]) => input).some(input => input.includes('twice your Reason score'))).toBe(true);
		expect(getTierEffectCreature.mock.calls.map(([ input ]) => input)).toContain('3 + M damage; M < [weak], dazed (save ends)');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders the Hero-calculated Tactician readings through AbilityPanel and restores canonical English', () => {
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const markTrigger = renderAbility('tactician-1-5b', hero);
		expect(markTrigger.container.textContent).toContain('該招式額外造成 6 點傷害。');
		expect(markTrigger.container.textContent).toContain('造成傷害的生物可以遁移最多 3 格。');
		expect(Array.from(markTrigger.container.querySelectorAll('strong')).map(node => node.textContent)).toContain('嘲諷');
		expect(markTrigger.container.textContent).not.toContain('Reason score');

		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));
		expect(markTrigger.container.textContent).toContain('The ability deals extra damage equal to 6.');
		expect(markTrigger.container.textContent).toContain('shift up to a number of squares equal to 3.');
		expect(markTrigger.container.textContent).not.toMatch(chinese);
		markTrigger.unmount();

		const mindGame = renderAbility('tactician-ability-6', hero);
		expect(tierTexts(mindGame.container)).toEqual([
			'6 傷害；理智 < 1，虛弱（豁免解除）',
			'8 傷害；理智 < 2，虛弱（豁免解除）',
			'12 傷害；理智 < 3，虛弱（豁免解除）'
		]);
		expect(Array.from(mindGame.container.querySelectorAll('.power-roll-row .effect strong')).map(node => node.textContent)).toEqual([ '虛弱', '虛弱', '虛弱' ]);
		expect(mindGame.container.textContent).toContain('你標記目標。');
		expect(mindGame.container.textContent).not.toContain('weakened');
		mindGame.unmount();

		const squadForward = renderAbility('tactician-ability-4', hero);
		expect(squadForward.container.textContent).toContain('每個目標都可以移動最多等於自身速度的距離。');
		expect(squadForward.container.textContent).not.toContain('up to 7 squares');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('falls back to the whole calculated English result rather than a mixed partial reading', () => {
		const canonicalEnglish = required[elementFieldIdentity('tactician-1-5b', 'sections.0.text')];
		// A structural rewrite this batch does not authorize: the approved zh-TW grammar can no
		// longer be projected, so the entire calculated English reading is returned instead.
		const unsupported = canonicalEnglish.replace('The ability deals extra damage equal to twice your Reason score.', 'The ability deals extra piercing damage of 6.');

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'tactician-1-5b',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: unsupported
		})).toBe(unsupported);

		// The same projection is refused for an identity it was not approved against.
		const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, makeHero());
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'tactician-ability-6',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		})).toBe(calculatedEnglish);

		// English keeps the canonical calculated reading.
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'tactician-1-5b',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		})).toBe(calculatedEnglish);
	});
});
