// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { ClassPanel } from '@/components/panels/elements/class-panel/class-panel';
import { ClassData } from '@/data/class-data';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { Options } from '@/models/options';
import { PanelMode } from '@/enums/panel-mode';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const localizationBoundary = vi.hoisted(() => ({ calls: [] as string[] }));

vi.mock('@/localization/resolver', async importActual => {
	const actual = await importActual<typeof import('@/localization/resolver')>();
	const resolver = actual.createLocalizationResolver([
		{ kind: 'element-field', elementID: 'censor-ability-3', field: 'sections.0.roll.tier1', canonicalEnglish: '2 + M holy damage; P < [weak], slowed (save ends)', zhTW: '2 + `力量`神聖傷害；`氣場` < [弱]，緩速（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-3', field: 'sections.0.roll.tier2', canonicalEnglish: '5 + M holy damage; P < [average], slowed (save ends)', zhTW: '5 + `力量`神聖傷害；`氣場` < [中]，緩速（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-3', field: 'sections.0.roll.tier3', canonicalEnglish: '7 + M holy damage; P < [strong], slowed (save ends)', zhTW: '7 + `力量`神聖傷害；`氣場` < [強]，緩速（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-9', field: 'sections.0.roll.tier1', canonicalEnglish: '6 + M holy damage; grabbed', zhTW: '6 + `力量`神聖傷害；擒制', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-9', field: 'sections.0.roll.tier2', canonicalEnglish: '9 + M holy damage; grabbed', zhTW: '9 + `力量`神聖傷害；擒制', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-9', field: 'sections.0.roll.tier3', canonicalEnglish: '13 + M holy damage; grabbed', zhTW: '13 + `力量`神聖傷害；擒制', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-9', field: 'sections.1.text', canonicalEnglish: 'If the target makes a strike against a creature while grabbed this way, you can spend 3 wrath to deal holy damage to them equal to your Presence score, then change the target of the strike to another target within the strike’s distance.', zhTW: '若被此招式擒制的目標對 1 個生物發動打擊，你可以花費 3 點怒火對他造成等於你氣場的神聖傷害，並將該次打擊的目標改為其射程內的另 1 個目標。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-10', field: 'sections.0.roll.tier1', canonicalEnglish: '3 + M holy damage; if the target has P < [weak], each enemy within 2 squares of them is frightened of you (save ends)', zhTW: '3 + `力量`神聖傷害；若目標的`氣場` < [弱]，目標 2 格內的每個敵人都對你陷入畏縮（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-10', field: 'sections.0.roll.tier2', canonicalEnglish: '5 + M holy damage; if the target has P < [average], each enemy within 2 squares of them is frightened of you (save ends)', zhTW: '5 + `力量`神聖傷害；若目標的`氣場` < [中]，目標 2 格內的每個敵人都對你陷入畏縮（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-10', field: 'sections.0.roll.tier3', canonicalEnglish: '8 + M holy damage; if the target has P < [strong], each enemy within 2 squares of them is frightened of you (save ends)', zhTW: '8 + `力量`神聖傷害；若目標的`氣場` < [強]，目標 2 格內的每個敵人都對你陷入畏縮（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-10', field: 'sections.1.text', canonicalEnglish: 'Each enemy frightened by this ability is pushed 2 squares away from the target and takes psychic damage equal to your Presence score.', zhTW: '因此招式陷入畏縮的每個敵人都會朝遠離目標的方向推動 2 格，並受到等於你氣場的心靈傷害。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-12', field: 'sections.0.roll.tier1', canonicalEnglish: '5 + M holy damage; M < [weak], the target has fire weakness 3 (save ends)', zhTW: '5 + `力量`神聖傷害；`力量` < [弱]，目標獲得火焰弱點 3（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-12', field: 'sections.0.roll.tier2', canonicalEnglish: '9 + M holy damage; M < [average], the target has fire weakness 5 (save ends)', zhTW: '9 + `力量`神聖傷害；`力量` < [中]，目標獲得火焰弱點 5（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'censor-ability-12', field: 'sections.0.roll.tier3', canonicalEnglish: '12 + M holy damage; M < [strong], the target has fire weakness 7 (save ends)', zhTW: '12 + `力量`神聖傷害；`力量` < [強]，目標獲得火焰弱點 7（豁免解除）', approval: 'approved' }
	]);

	return {
		...actual,
		localizeElementField: (locale: 'en' | 'zh-TW', elementID: string, field: string, canonicalEnglish: string) => {
			localizationBoundary.calls.push(canonicalEnglish);
			return resolver.localizeElementField(locale, elementID, field, canonicalEnglish);
		}
	};
});

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ ...FactoryLogic.createOptions(), locale: 'zh-TW' } as Options),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const chinese = /[\u4e00-\u9fff]/;
const abilityIDs = new Set([ 'censor-ability-3', 'censor-ability-9', 'censor-ability-10', 'censor-ability-12' ]);
const libraryCensor = {
	...ClassData.censor,
	abilities: ClassData.censor.abilities.filter(ability => abilityIDs.has(ability.id))
};

const getAbilityPanel = (container: HTMLElement, abilityName: string) => {
	const panel = Array.from(container.querySelectorAll('.ability-panel')).find(candidate => candidate.textContent?.includes(abilityName));
	expect(panel).toBeTruthy();
	return panel as HTMLElement;
};

const getTierText = (panel: HTMLElement, tier: number) => panel.querySelectorAll('.power-roll-row .effect')[tier - 1]?.textContent || '';

const expandAbilityGroups = () => {
	fireEvent.click(screen.getByRole('radio', { name: '招式' }));
	fireEvent.click(screen.getByText('招牌招式'));
	fireEvent.click(screen.getByText('5 費招式'));
};

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

beforeEach(() => {
	localizationBoundary.calls = [];
});

describe('ClassPanel no-Hero calculated localization', () => {
	it('keeps approved zh-TW dynamic readings and renders calculated condition emphasis in the Library path', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const serializedClass = JSON.stringify(libraryCensor);
		const { container } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<ClassPanel heroClass={libraryCensor} sourcebooks={[]} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		expandAbilityGroups();

		const halt = getAbilityPanel(container, 'Halt, Miscreant!');
		expect(getTierText(halt, 1)).toContain('2 + 力量神聖傷害；氣場 < [弱]，緩速（豁免解除）');
		expect(halt.querySelectorAll('strong')).toHaveLength(3);
		expect(halt.querySelector('strong')?.textContent).toBe('緩速');

		const arrest = getAbilityPanel(container, 'Arrest');
		expect(getTierText(arrest, 1)).toContain('6 + 力量神聖傷害；擒制');
		expect(arrest.textContent).toContain('對他造成等於你氣場的神聖傷害');
		expect(arrest.querySelectorAll('strong')).toHaveLength(4);
		expect(arrest.querySelector('strong')?.textContent).toBe('擒制');

		const behold = getAbilityPanel(container, 'Behold the Face of Justice!');
		expect(getTierText(behold, 1)).toContain('3 + 力量神聖傷害；若目標的氣場 < [弱]，目標 2 格內的每個敵人都對你陷入畏縮（豁免解除）');
		expect(behold.textContent).toContain('受到等於你氣場的心靈傷害');
		expect(behold.querySelectorAll('strong')).toHaveLength(4);
		expect(behold.querySelector('strong')?.textContent).toBe('畏縮');

		const purifyingFire = getAbilityPanel(container, 'Purifying Fire');
		expect(getTierText(purifyingFire, 1)).toContain('5 + 力量神聖傷害；力量 < [弱]，目標獲得火焰弱點 3（豁免解除）');

		fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
		expect(getTierText(halt, 1)).toContain('2 + M holy damage; P < [weak] slowed (save ends)');
		expect(halt.querySelectorAll('strong')).toHaveLength(3);
		expect(getTierText(purifyingFire, 1)).toContain('5 + M holy damage; M < [weak] the target has fire weakness 3 (save ends)');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(chinese));
		expect(localizationBoundary.calls).toContain('2 + M holy damage; P < [weak], slowed (save ends)');
		expect(JSON.stringify(libraryCensor)).toBe(serializedClass);
	});
});
