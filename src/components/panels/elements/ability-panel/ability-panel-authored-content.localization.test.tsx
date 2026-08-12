// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { AbilityData } from '@/data/ability-data';
import { AppLocale } from '@/localization/locale';
import { Characteristic } from '@/enums/characteristic';
import { FeatureField } from '@/enums/feature-field';
import { PanelMode } from '@/enums/panel-mode';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Records what each call site hands the presentation boundary, then answers exactly as the
// production resolver does. The recording is what makes the field path each call site uses
// - and the fact that it is canonical English going in - observable.
const boundary = vi.hoisted(() => ({ calls: [] as { elementID: string, field: string, canonicalEnglish: string }[] }));

vi.mock('@/localization/resolver', async importActual => {
	const actual = await importActual<typeof import('@/localization/resolver')>();
	const calculatedTierResolver = actual.createLocalizationResolver([
		{
			kind: 'element-field',
			elementID: 'localized-calculated-tier',
			field: 'sections.0.roll.tier1',
			canonicalEnglish: '2 + M holy damage; P < [weak], slowed (save ends); push 1',
			zhTW: '2 + `力量`神聖傷害；`氣場` < [弱]，緩速（豁免解除）；推動 1',
			approval: 'approved'
		}
	]);
	return {
		...actual,
		localizeElementField: (locale: AppLocale, elementID: string, field: string, canonicalEnglish: string) => {
			boundary.calls.push({ elementID: elementID, field: field, canonicalEnglish: canonicalEnglish });
			if (elementID === 'localized-calculated-tier') {
				return calculatedTierResolver.localizeElementField(locale, elementID, field, canonicalEnglish);
			}
			return actual.localizeElementField(locale, elementID, field, canonicalEnglish);
		}
	};
});

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' })
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));
// A Markdown control that shows the text it was handed verbatim, so these tests read the
// exact string the boundary produced - markdown markers and all - rather than the HTML the
// markdown renderer would make of it.
vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text, className }: { text: string, className?: string }) => <span className={className}>{text}</span>
}));

beforeEach(() => {
	boundary.calls = [];
});

afterEach(cleanup);

const chinese = /[一-鿿]/;

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const getPanel = (container: HTMLElement, index: number) => Array.from(container.querySelectorAll('.ability-panel'))[index] as HTMLElement;

const getTierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent);

const getFieldPaths = (elementID: string) => Array.from(new Set(boundary.calls.filter(call => call.elementID === elementID).map(call => call.field))).sort();

describe('Ability static authored content localization', () => {
	it('shows the approved zh-TW reading of a static text section and restores the canonical English', () => {
		const ability = AbilityData.freeStrike;
		const serialized = JSON.stringify(ability);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityPanel ability={ability} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		expect(screen.getByText('生物可以使用此主要動作進行基礎打擊。', { exact: true })).toBeTruthy();
		expect(screen.queryByText('A creature can use this main action to make a free strike.', { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getByText('A creature can use this main action to make a free strike.', { exact: true })).toBeTruthy();
		expect(screen.queryByText('生物可以使用此主要動作進行基礎打擊。', { exact: true })).toBeNull();

		// The ability itself is untouched by either reading of it.
		expect(JSON.stringify(ability)).toBe(serialized);
		expect(ability.id).toBe('free-strike');
		expect(ability.sections[0]).toEqual({ type: 'text', text: 'A creature can use this main action to make a free strike.' });
	});

	it('shows the approved zh-TW reading of a static power roll tier and restores the canonical English', () => {
		const ability = AbilityData.escapeGrab;
		const serialized = JSON.stringify(ability);
		const roll = ability.sections[1];
		if (roll.type !== 'roll') {
			throw new Error('Escape Grab no longer carries a power roll section');
		}

		const { container } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityPanel ability={ability} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		// Only the first tier is read. The other two are rewritten by the parser - it
		// emboldens the condition name they mention - so what reaches the boundary is no
		// longer the English any entry was approved against, and they stay as calculated.
		const calculatedTier2 = 'You can escape the grab, but if you do, a creature who has you **grabbed** can make a melee free strike against you before you are no longer **grabbed**.';
		const calculatedTier3 = 'You are no longer **grabbed**.';

		expect(getTierTexts(container)).toEqual([ '無效果。', calculatedTier2, calculatedTier3 ]);

		switchLocale();

		expect(getTierTexts(container)).toEqual([ 'No effect.', calculatedTier2, calculatedTier3 ]);

		expect(JSON.stringify(ability)).toBe(serialized);
		expect(roll.roll.tier1).toBe('No effect.');
		expect(roll.roll.tier3).toBe('You are no longer grabbed.');
	});

	it('reads every authored field path through the same boundary, falling back to canonical English where nothing is approved', () => {
		// One ability carrying each authored field the boundary covers. None of them has an
		// approved zh-TW reading, so every one of them must show its canonical English in
		// both locales - the safe fallback, not a blank, an identity key or a partial reading.
		const ability = FactoryLogic.createAbility({
			id: 'authored-field-coverage',
			name: 'Authored Field Coverage',
			description: 'An authored ability description.',
			type: FactoryLogic.type.createTrigger('An authored trigger condition.'),
			sections: [
				FactoryLogic.createAbilitySectionText('An authored text section.'),
				FactoryLogic.createAbilitySectionField({ name: 'Authored Field Name', effect: 'An authored field effect.' }),
				FactoryLogic.createAbilitySectionRoll(FactoryLogic.createPowerRoll({
					characteristic: [ Characteristic.Might ],
					tier1: 'An authored tier one effect.',
					tier2: 'An authored tier two effect.',
					tier3: 'An authored tier three effect.'
				}))
			]
		});
		const serialized = JSON.stringify(ability);

		const { container } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityPanel ability={ability} mode={PanelMode.Full} />
				<AbilityPanel ability={ability} />
			</LocalizationProvider>
		);

		const expectCanonicalAuthoredContent = () => {
			const panel = within(getPanel(container, 0));

			expect(panel.getAllByText('An authored ability description.', { exact: true }).length).toBe(1);
			expect(panel.getByText('An authored trigger condition.', { exact: true })).toBeTruthy();
			expect(panel.getByText('An authored text section.', { exact: true })).toBeTruthy();
			expect(panel.getByText('Authored Field Name', { exact: true })).toBeTruthy();
			expect(panel.getByText('An authored field effect.', { exact: true })).toBeTruthy();
			expect(getTierTexts(container)).toEqual([
				'An authored tier one effect.',
				'An authored tier two effect.',
				'An authored tier three effect.'
			]);
			// The compact panel shows the same description through the same boundary.
			expect(within(getPanel(container, 1)).getByText('An authored ability description.', { exact: true })).toBeTruthy();
		};

		expectCanonicalAuthoredContent();

		// Every authored field is addressed by the ability's own ID and a canonical field
		// path; sections are identified by their position, not by an ID of their own.
		expect(getFieldPaths('authored-field-coverage')).toEqual([
			'description',
			'name',
			'sections.0.text',
			'sections.1.effect',
			'sections.1.name',
			'sections.2.roll.tier1',
			'sections.2.roll.tier2',
			'sections.2.roll.tier3',
			'target',
			'type.trigger'
		]);

		switchLocale();

		expectCanonicalAuthoredContent();
		expect(JSON.stringify(ability)).toBe(serialized);
	});
});

describe('Ability static authored content parser safety', () => {
	it('localizes calculated tier presentation without sending zh-TW through canonical calculation', () => {
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const hero = FactoryLogic.createHero();
		hero.class = FactoryLogic.createClass();
		hero.class.characteristics = FactoryLogic.createCharacteristics(2, 0, 0, 0, 1);
		hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
			id: 'forced-movement-push-bonus',
			field: FeatureField.ForcedMovementPush,
			value: 1
		}));

		const ability = FactoryLogic.createAbility({
			id: 'localized-calculated-tier',
			name: 'Localized Calculated Tier',
			sections: [
				FactoryLogic.createAbilitySectionRoll(FactoryLogic.createPowerRoll({
					characteristic: [ Characteristic.Might ],
					tier1: '2 + M holy damage; P < [weak], slowed (save ends); push 1',
					tier2: 'No effect.',
					tier3: 'No effect.'
				}))
			]
		});
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);

		const { container } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityPanel ability={ability} hero={hero} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		// Start with the raw authored reading, then exercise the actual lightning toggle.
		fireEvent.click(screen.getByTitle('自動計算傷害、效力等數值'));
		expect(getTierTexts(container)[0]).toBe('2 + `力量`神聖傷害；`氣場` < [弱]，緩速（豁免解除）；推動 1');

		fireEvent.click(screen.getByTitle('自動計算傷害、效力等數值'));
		expect(getTierTexts(container)[0]).toBe('4 神聖傷害；`氣場` < 0，緩速（豁免解除）；推動 2');

		fireEvent.click(screen.getByTitle('自動計算傷害、效力等數值'));
		expect(getTierTexts(container)[0]).toBe('2 + `力量`神聖傷害；`氣場` < [弱]，緩速（豁免解除）；推動 1');

		// English keeps the canonical raw and calculated readings.
		switchLocale();
		expect(getTierTexts(container)[0]).toBe('2 + M holy damage; P < [weak], slowed (save ends); push 1');
		fireEvent.click(screen.getByTitle('Auto-calculate damage, potency, etc'));
		expect(getTierTexts(container)[0]).toBe('4 holy damage; `P < 0` **slowed** (save ends); push 2');

		getTierEffectCreature.mock.calls.forEach(call => expect(call[0]).not.toMatch(chinese));
		expect(getTierEffectCreature.mock.calls.map(call => call[0])).toContain('2 + M holy damage; P < [weak], slowed (save ends); push 1');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);

		getTierEffectCreature.mockRestore();
	});

	it('keeps calculation on canonical English and never lets an approved reading reach the parser', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const hero = FactoryLogic.createHero();
		hero.class = FactoryLogic.createClass();
		hero.class.level = 3;

		// This ability authors, at its own field paths, the very English that is approved for
		// Free Strike's first section and for Escape Grab's first tier. An identity that
		// ignored the ability would leak those approved readings onto it.
		const ability = FactoryLogic.createAbility({
			id: 'parser-sensitive-ability',
			name: 'Parser Sensitive Ability',
			description: 'A creature can use this main action to make a free strike.',
			sections: [
				FactoryLogic.createAbilitySectionText('A creature can use this main action to make a free strike.'),
				FactoryLogic.createAbilitySectionText('The target is slowed and you push 2.'),
				FactoryLogic.createAbilitySectionRoll(FactoryLogic.createPowerRoll({
					characteristic: [ Characteristic.Might ],
					tier1: 'No effect.',
					tier2: 'The target takes damage equal to your level.',
					tier3: 'The target is grabbed.'
				}))
			]
		});
		const serialized = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);

		const { container } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityPanel ability={ability} hero={hero} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		const expectCalculatedEnglish = () => {
			const panel = within(getPanel(container, 0));

			expect(getPanel(container, 0).textContent).not.toMatch(chinese);
			expect(panel.getAllByText('A creature can use this main action to make a free strike.', { exact: true }).length).toBe(2);
			// The parser emboldened the condition name and resolved the level reference; the
			// boundary handed those calculated readings straight through.
			expect(panel.getByText('The target is **slowed** and you push 2.', { exact: true })).toBeTruthy();
			expect(getTierTexts(container)).toEqual([
				'No effect.',
				'The target takes damage equal to 3.',
				'The target is **grabbed**.'
			]);
		};

		expectCalculatedEnglish();

		switchLocale();

		expectCalculatedEnglish();

		// Nothing the parser was ever asked to calculate contained a Chinese character, in
		// either locale, and the calculation always started from the authored English.
		const parserInputs = [
			...getTextEffect.mock.calls.map(call => call[0]),
			...getTierEffectCreature.mock.calls.map(call => call[0])
		];
		expect(parserInputs.length).toBeGreaterThan(0);
		parserInputs.forEach(input => expect(input).not.toMatch(chinese));
		expect(getTierEffectCreature.mock.calls.filter(call => call[0] === 'No effect.').length).toBeGreaterThan(0);

		expect(JSON.stringify(ability)).toBe(serialized);
		expect(JSON.stringify(hero)).toBe(serializedHero);

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('leaves the approved reading out of the parser for the ability that does own it', () => {
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		const { container } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityPanel ability={AbilityData.escapeGrab} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		expect(getTierTexts(container)[0]).toBe('無效果。');

		switchLocale();

		expect(getTierTexts(container)[0]).toBe('No effect.');
		// The approved reading is shown, but the parser only ever saw the canonical English.
		getTierEffectCreature.mock.calls.forEach(call => expect(call[0]).not.toMatch(chinese));
		expect(getTierEffectCreature.mock.calls.map(call => call[0])).toContain('No effect.');

		getTierEffectCreature.mockRestore();
	});

	it('leaves auto-calculation working the same way in either locale', () => {
		const hero = FactoryLogic.createHero();
		hero.class = FactoryLogic.createClass();
		hero.class.level = 5;

		const ability = FactoryLogic.createAbility({
			id: 'auto-calc-ability',
			name: 'Auto Calc Ability',
			sections: [
				FactoryLogic.createAbilitySectionText('The target takes damage equal to your level.'),
				FactoryLogic.createAbilitySectionRoll(FactoryLogic.createPowerRoll({
					characteristic: [ Characteristic.Might ],
					tier1: 'No effect.',
					tier2: '2 + Might damage',
					tier3: '4 + Might damage'
				}))
			]
		});

		const { container } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityPanel ability={ability} hero={hero} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		const calculatedTiers = getTierTexts(container);
		expect(calculatedTiers[1]).not.toBe('2 + Might damage');
		expect(screen.getByText('The target takes damage equal to 5.', { exact: true })).toBeTruthy();

		// Turning auto-calculation off falls back to the authored English, in zh-TW as in English.
		fireEvent.click(screen.getByTitle('自動計算傷害、效力等數值'));

		expect(getTierTexts(container)).toEqual([ 'No effect.', '2 + Might damage', '4 + Might damage' ]);
		expect(screen.getByText('The target takes damage equal to your level.', { exact: true })).toBeTruthy();

		switchLocale();

		expect(getTierTexts(container)).toEqual([ 'No effect.', '2 + Might damage', '4 + Might damage' ]);

		fireEvent.click(screen.getByTitle('Auto-calculate damage, potency, etc'));

		expect(getTierTexts(container)).toEqual(calculatedTiers);
		expect(screen.getByText('The target takes damage equal to 5.', { exact: true })).toBeTruthy();
	});
});
