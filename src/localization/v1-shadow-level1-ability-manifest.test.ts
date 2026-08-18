// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1ShadowLevel1AbilityRequiredCanonicalEnglish,
	getV1ShadowLevel1Abilities,
	v1LocalizationManifest,
	v1ShadowLevel1AbilityIDs
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

const required = createV1ShadowLevel1AbilityRequiredCanonicalEnglish();
const shadowCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const getAbility = (id: typeof v1ShadowLevel1AbilityIDs[number]) => {
	const ability = getV1ShadowLevel1Abilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Shadow ability '${id}' is missing`);
	}
	return ability;
};

// Agility 2 and Intuition 1 drive the authored characteristic and potency arithmetic; the
// two bonuses make the resolved Speed (7) and slide (+1) distinguishable from the authored
// numbers, so a projected value cannot be mistaken for a copied literal.
const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(0, 2, 0, 1, 0);
	hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
		id: 'shadow-production-speed-bonus',
		field: FeatureField.Speed,
		value: 2
	}));
	hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
		id: 'shadow-production-slide-bonus',
		field: FeatureField.ForcedMovementSlide,
		value: 1
	}));
	return hero;
};

const renderAbility = (id: typeof v1ShadowLevel1AbilityIDs[number], hero?: ReturnType<typeof makeHero>) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(AbilityPanel, { ability: getAbility(id), hero: hero, mode: PanelMode.Full })
	)
);

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent?.trim() || '');

const tierReading = (id: typeof v1ShadowLevel1AbilityIDs[number], field: string, tier: number, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getAbility(id), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const textReading = (id: typeof v1ShadowLevel1AbilityIDs[number], field: string, hero?: ReturnType<typeof makeHero>) => {
	const canonicalEnglish = required[elementFieldIdentity(id, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Shadow Level 1 ability manifest', () => {
	it('enumerates exactly the approved live Shadow slice and its 82 catalog identities', () => {
		expect(getV1ShadowLevel1Abilities().map(ability => ability.id)).toEqual([ ...v1ShadowLevel1AbilityIDs ]);
		expect(v1ShadowLevel1AbilityIDs).toHaveLength(13);
		expect(Object.keys(required)).toHaveLength(82);
		expect(shadowCatalogEntries).toHaveLength(82);

		const catalogIdentities = shadowCatalogEntries.map(getEntryIdentity);
		expect(new Set(catalogIdentities).size).toBe(82);
		expect(catalogIdentities.slice().sort()).toEqual(Object.keys(required).sort());
		expect(shadowCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(shadowCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
	});

	it('leaves later Shadow abilities and every Shadow subclass out of this slice', () => {
		const sliceIDs = [ ...v1ShadowLevel1AbilityIDs ] as string[];

		expect(sliceIDs).not.toContain('shadow-ability-13');
		expect(Object.keys(required).some(identity => identity.startsWith('element:shadow-ability-13/'))).toBe(false);
		expect(shadowCatalogEntries.every(entry => sliceIDs.includes(entry.elementID))).toBe(true);
		// Shadow's own data carries later abilities and three subclasses; none of them may be
		// swept into this slice by the enumeration above.
		expect(getAbility('shadow-ability-12').id).toBe('shadow-ability-12');
		expect(getV1ShadowLevel1Abilities().some(ability => /^shadow-ability-(1[3-9]|2\d)$/.test(ability.id))).toBe(false);
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
		// Characteristic arithmetic, dice + characteristic, forced movement and static damage.
		expect(tierReading('shadow-ability-1', 'sections.0.roll.tier1', 1)).toBe('3 + `敏捷`傷害');
		expect(tierReading('shadow-ability-9', 'sections.0.roll.tier1', 1)).toBe('2d6 + 7 + `敏捷`傷害');
		expect(tierReading('shadow-ability-5', 'sections.0.roll.tier1', 1)).toBe('4 + `敏捷`傷害；滑動 2');
		expect(tierReading('shadow-ability-8', 'sections.0.roll.tier1', 1)).toBe('4傷害');
		// Potency + condition, both the emphasised and the plain-effect reading. The canonical
		// calculator emphasises a condition name with no Hero in play, so the approved zh-TW
		// keeps the authored potency unresolved while carrying that same Markdown emphasis.
		expect(tierReading('shadow-ability-6', 'sections.0.roll.tier1', 1)).toBe('4 + `敏捷`傷害；`敏捷` < [弱]，**出血** （豁免解除）');
		expect(tierReading('shadow-ability-11', 'sections.0.roll.tier1', 1)).toBe('6 + `敏捷`傷害；`理智` < [弱]，目標具有傷害弱點 5 （豁免解除）');
		// Authored Speed prose stays unresolved rather than falling back to English.
		expect(textReading('shadow-ability-7', 'sections.1.text')).toBe('你可以遁移最多等於速度的距離，而且可以在打擊之前或之後隨意分配這段遁移。');
		expect(textReading('shadow-ability-10', 'sections.0.text')).toBe('你遁移最多等於速度的距離，指定最多 3 個在你移動期間曾與你相鄰的敵人，然後進行 1 次檢定。');

		const { container } = renderAbility('shadow-ability-7');
		expect(container.textContent).toContain('你可以遁移最多等於速度的距離，而且可以在打擊之前或之後隨意分配這段遁移。');
		expect(container.textContent).not.toContain('up to your speed');
		expect(tierTexts(container)).toEqual([ '5 + 敏捷傷害', '8 + 敏捷傷害', '11 + 敏捷傷害' ]);
		expect(Array.from(container.querySelectorAll('code')).map(node => node.textContent)).toContain('敏捷');
	});

	it('calculates canonical English first and projects the resolved Shadow values into zh-TW', () => {
		const hero = makeHero();
		const ability = getAbility('shadow-ability-7');
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		// Characteristic arithmetic, and potency + condition emphasis.
		expect(tierReading('shadow-ability-1', 'sections.0.roll.tier1', 1, hero)).toBe('5 傷害');
		expect(tierReading('shadow-ability-1', 'sections.0.roll.tier3', 3, hero)).toBe('10 傷害；`直覺` < 2，**伏地**');
		expect(tierReading('shadow-ability-6', 'sections.0.roll.tier2', 2, hero)).toBe('8 傷害；`敏捷` < 1，**出血** （豁免解除）');
		expect(tierReading('shadow-ability-11', 'sections.0.roll.tier3', 3, hero)).toBe('15 傷害；`理智` < 2，目標具有傷害弱點 5 （豁免解除）');
		// Dice + characteristic: the dice term the calculator never resolves is carried through.
		expect(tierReading('shadow-ability-9', 'sections.0.roll.tier3', 3, hero)).toBe('2d6 + 18 傷害');
		// Forced movement keeps the canonical result, including this Hero's slide bonus.
		expect(tierReading('shadow-ability-5', 'sections.0.roll.tier1', 1, hero)).toBe('6 傷害；滑動 3');
		// Static damage needs no projection at all.
		expect(tierReading('shadow-ability-8', 'sections.0.roll.tier2', 2, hero)).toBe('6傷害');
		// Authored Speed prose projects the calculator's resolved Speed, never a copied literal.
		expect(textReading('shadow-ability-7', 'sections.1.text', hero)).toBe('你可以遁移最多 7 格，而且可以在打擊之前或之後隨意分配這段遁移。');
		expect(textReading('shadow-ability-10', 'sections.0.text', hero)).toBe('你遁移最多 7 格，指定最多 3 個在你移動期間曾與你相鄰的敵人，然後進行 1 次檢定。');
		expect(textReading('shadow-ability-7', 'sections.1.text', hero)).not.toContain('等於速度');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		expect(getTierEffectCreature.mock.calls.map(([ input ]) => input)).toContain('2d6 + 16 + A damage');
		expect(getTextEffect.mock.calls.map(([ input ]) => input)).toContain('You can shift up to your speed, dividing that movement before or after your strike as desired.');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders the Hero-calculated Shadow readings through AbilityPanel and restores canonical English', () => {
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const getInOut = renderAbility('shadow-ability-7', hero);
		expect(getInOut.container.textContent).toContain('你可以遁移最多 7 格，而且可以在打擊之前或之後隨意分配這段遁移。');
		expect(tierTexts(getInOut.container)).toEqual([ '7 傷害', '10 傷害', '13 傷害' ]);

		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));
		expect(getInOut.container.textContent).toContain('You can shift up to 7 squares, dividing that movement before or after your strike as desired.');
		expect(tierTexts(getInOut.container)).toEqual([ '7 damage', '10 damage', '13 damage' ]);
		expect(getInOut.container.textContent).not.toMatch(chinese);
		getInOut.unmount();

		const hundredThroats = renderAbility('shadow-ability-10', hero);
		expect(hundredThroats.container.textContent).toContain('你遁移最多 7 格，指定最多 3 個在你移動期間曾與你相鄰的敵人，然後進行 1 次檢定。');
		expect(tierTexts(hundredThroats.container)).toEqual([ '3傷害', '6傷害', '9傷害' ]);
		hundredThroats.unmount();

		const eviscerate = renderAbility('shadow-ability-6', hero);
		expect(tierTexts(eviscerate.container)).toEqual([
			'6 傷害；敏捷 < 0，出血 （豁免解除）',
			'8 傷害；敏捷 < 1，出血 （豁免解除）',
			'12 傷害；敏捷 < 2，出血 （豁免解除）'
		]);
		expect(Array.from(eviscerate.container.querySelectorAll('.power-roll-row .effect strong')).map(node => node.textContent)).toEqual([ '出血', '出血', '出血' ]);
		expect(eviscerate.container.textContent).not.toContain('bleeding');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('falls back to the whole calculated English result rather than a mixed partial reading', () => {
		const speedIdentity = 'You can shift up to your speed, dividing that movement before or after your strike as desired.';
		// A structural rewrite this batch does not authorize: the approved zh-TW grammar can no
		// longer be projected, so the entire calculated English reading is returned instead.
		const unsupported = 'You can teleport up to 7 squares, dividing that movement before or after your strike as desired.';

		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'shadow-ability-7',
			field: 'sections.1.text',
			canonicalEnglish: speedIdentity,
			calculatedEnglish: unsupported
		})).toBe(unsupported);

		// The same projection is refused for an identity it was not approved against.
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'shadow-ability-5',
			field: 'sections.1.text',
			canonicalEnglish: speedIdentity,
			calculatedEnglish: 'You can shift up to 7 squares, dividing that movement before or after your strike as desired.'
		})).toBe('You can shift up to 7 squares, dividing that movement before or after your strike as desired.');

		// English keeps the canonical calculated reading.
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'en',
			elementID: 'shadow-ability-7',
			field: 'sections.1.text',
			canonicalEnglish: speedIdentity,
			calculatedEnglish: 'You can shift up to 7 squares, dividing that movement before or after your strike as desired.'
		})).toBe('You can shift up to 7 squares, dividing that movement before or after your strike as desired.');
	});
});
