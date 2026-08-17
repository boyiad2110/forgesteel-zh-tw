// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { AppLocale } from '@/localization/locale';
import { Characteristic } from '@/enums/characteristic';
import { FeatureField } from '@/enums/feature-field';
import { FactoryLogic } from '@/logic/factory-logic';
import { LocalizationProvider } from '@/contexts/localization-context';
import { PanelMode } from '@/enums/panel-mode';
import { AbilityLogic } from '@/logic/ability-logic';
import { ElementFieldEntry } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { localizeCalculatedAuthoredTextPresentation } from './calculated-authored-text-presentation';

const boundary = vi.hoisted(() => ({ calls: [] as string[] }));

vi.mock('@/localization/resolver', async importActual => {
	const actual = await importActual<typeof import('@/localization/resolver')>();
	// Persistent Magic is taken from the production catalog rather than restated here, so the
	// identity-bound projection is exercised against the approved packet bytes themselves.
	const { productionLocalizationEntries } = await import('@/localization/catalog-data');
	const resolver = actual.createLocalizationResolver([
		...productionLocalizationEntries.filter(entry => (entry.kind === 'element-field') && (entry.elementID === 'elementalist-1-5') && (entry.field === 'description')),
		{ kind: 'element-field', elementID: 'projection-rolls', field: 'sections.0.roll.tier1', canonicalEnglish: 'P < [weak], slowed (save ends)', zhTW: '`氣場` < [弱]，緩速（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'projection-rolls', field: 'sections.0.roll.tier2', canonicalEnglish: 'P < [average], dazed (save ends)', zhTW: '`氣場` < [中]，暈眩（豁免解除）', approval: 'approved' },
		{ kind: 'element-field', elementID: 'projection-text', field: 'sections.0.text', canonicalEnglish: 'You deal holy damage equal to twice your Presence score to them.', zhTW: '你對他造成等於你氣場 ×2 的神聖傷害。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'projection-text', field: 'sections.1.text', canonicalEnglish: 'You spend a Recovery and the target regains Stamina equal to your Recovery value.', zhTW: '你花費 1 次復元，且目標恢復等於你復元值的體力。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'projection-text', field: 'sections.2.text', canonicalEnglish: 'You can shift up to your speed in a straight line toward the target after pushing them.', zhTW: '推動目標後，你可以朝目標直線遁移最多等於你速度的距離。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'projection-text', field: 'sections.3.text', canonicalEnglish: 'The target is slowed.', zhTW: '目標緩速。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'projection-text', field: 'sections.4.text', canonicalEnglish: 'You can spend a Recovery to allow yourself or one ally within 10 squares to regain Stamina equal to your recovery value.', zhTW: '你可以花費 1 次復元，讓自己或 10 格內 1 名盟友恢復等於你復元值的體力。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'conduit-ability-7', field: 'sections.1.text', canonicalEnglish: 'You or one ally within distance gains temporary Stamina equal to your Intuition score.', zhTW: '你或射程內的 1 個盟友獲得等於你直覺的臨時體力。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'conduit-ability-10', field: 'sections.0.text', canonicalEnglish: 'An enemy takes holy damage equal to your Intuition score.', zhTW: '敵人受到等於你直覺的神聖傷害。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'ambiguous', field: 'sections.0.text', canonicalEnglish: 'The target takes damage equal to your level.', zhTW: '目標受到等於你等級的傷害。', approval: 'approved' },
		{ kind: 'element-field', elementID: 'ambiguous', field: 'sections.0.text', canonicalEnglish: 'The target takes damage equal to your level.', zhTW: '目標受到等於你等級的損害。', approval: 'approved' }
	]);
	return {
		...actual,
		localizeElementField: (locale: AppLocale, elementID: string, field: string, canonicalEnglish: string) => {
			boundary.calls.push(canonicalEnglish);
			return resolver.localizeElementField(locale, elementID, field, canonicalEnglish);
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

afterEach(cleanup);

const chinese = /[\u4e00-\u9fff]/;

const makeHero = (presence: number, speedBonus = 0) => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(0, 0, 0, 0, presence);
	if (speedBonus) {
		hero.class.featuresByLevel[0].features.push(FactoryLogic.feature.createBonus({
			id: `speed-${speedBonus}`,
			field: FeatureField.Speed,
			value: speedBonus
		}));
	}
	return hero;
};

const toggleCalculation = () => fireEvent.click(screen.getByTitle('自動計算傷害、效力等數值'));

beforeEach(() => {
	boundary.calls = [];
});

describe('calculated authored content presentation', () => {
	it('renders calculated Power Roll condition emphasis as zh-TW strong DOM content', () => {
		const ability = FactoryLogic.createAbility({
			id: 'projection-rolls',
			name: 'Projection Rolls',
			sections: [
				FactoryLogic.createAbilitySectionRoll(FactoryLogic.createPowerRoll({
					characteristic: [ Characteristic.Presence ],
					tier1: 'P < [weak], slowed (save ends)',
					tier2: 'P < [average], dazed (save ends)',
					tier3: 'No effect.'
				}))
			]
		});

		render(<LocalizationProvider><AbilityPanel ability={ability} hero={makeHero(2)} mode={PanelMode.Full} /></LocalizationProvider>);

		expect(screen.getByText('緩速', { selector: 'strong' }).tagName).toBe('STRONG');
		expect(screen.getByText('暈眩', { selector: 'strong' }).tagName).toBe('STRONG');
		toggleCalculation();
		expect(screen.getByText((_content, element) => element?.tagName === 'P' && element.textContent === '氣場 < [弱]，緩速（豁免解除）')).toBeTruthy();
	});

	it('projects authorized non-roll values, restores the approved raw reading, and never parses zh-TW', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const ability = FactoryLogic.createAbility({
			id: 'projection-text',
			name: 'Projection Text',
			sections: [
				FactoryLogic.createAbilitySectionText('You deal holy damage equal to twice your Presence score to them.'),
				FactoryLogic.createAbilitySectionText('You spend a Recovery and the target regains Stamina equal to your Recovery value.'),
				FactoryLogic.createAbilitySectionText('You can shift up to your speed in a straight line toward the target after pushing them.'),
				FactoryLogic.createAbilitySectionText('The target is slowed.'),
				FactoryLogic.createAbilitySectionText('You can spend a Recovery to allow yourself or one ally within 10 squares to regain Stamina equal to your recovery value.')
			]
		});
		const firstHero = makeHero(2);
		const secondHero = makeHero(4, 2);
		const serializedAbility = JSON.stringify(ability);
		const serializedFirstHero = JSON.stringify(firstHero);
		const { rerender } = render(<LocalizationProvider><AbilityPanel ability={ability} hero={firstHero} mode={PanelMode.Full} /></LocalizationProvider>);

		expect(screen.getByText('你對他造成 4 點神聖傷害。', { exact: true })).toBeTruthy();
		const recovery = AbilityLogic.getTextEffect('You spend a Recovery and the target regains Stamina equal to your Recovery value.', firstHero).match(/equal to (\d+)/)?.[1];
		expect(screen.getByText(`你花費 1 次復元，且目標恢復 ${recovery} 點體力。`, { exact: true })).toBeTruthy();
		expect(screen.getByText(`你可以花費 1 次復元，讓自己或 10 格內 1 名盟友恢復 ${recovery} 點體力。`, { exact: true })).toBeTruthy();
		expect(screen.getByText('推動目標後，你可以朝目標直線遁移最多 5 格。', { exact: true })).toBeTruthy();
		expect(screen.getByText('緩速', { selector: 'strong' }).tagName).toBe('STRONG');

		toggleCalculation();
		expect(screen.getByText('你對他造成等於你氣場 ×2 的神聖傷害。', { exact: true })).toBeTruthy();
		expect(screen.getByText((_content, element) => element?.tagName === 'P' && element.textContent === '目標緩速。')).toBeTruthy();
		expect(screen.getByText('你花費 1 次復元，且目標恢復等於你復元值的體力。', { exact: true })).toBeTruthy();
		expect(screen.getByText('推動目標後，你可以朝目標直線遁移最多等於你速度的距離。', { exact: true })).toBeTruthy();

		rerender(<LocalizationProvider><AbilityPanel ability={ability} hero={secondHero} mode={PanelMode.Full} /></LocalizationProvider>);
		toggleCalculation();
		expect(screen.getByText('你對他造成 8 點神聖傷害。', { exact: true })).toBeTruthy();
		expect(screen.getByText('推動目標後，你可以朝目標直線遁移最多 7 格。', { exact: true })).toBeTruthy();

		getTextEffect.mock.calls.forEach(([ input ]) => expect(input).not.toMatch(chinese));
		expect(boundary.calls).toContain('You deal holy damage equal to twice your Presence score to them.');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(firstHero)).toBe(serializedFirstHero);
		getTextEffect.mockRestore();
	});

	it('uses the complete calculated-English fallback for missing, stale, and unsupported rewrites', () => {
		const canonicalEnglish = 'The target takes damage equal to your level.';
		const calculatedEnglish = 'The target takes damage equal to 3.';

		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'missing', field: 'sections.0.text', canonicalEnglish, calculatedEnglish })).toBe(calculatedEnglish);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'projection-text', field: 'sections.0.text', canonicalEnglish, calculatedEnglish })).toBe(calculatedEnglish);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'ambiguous', field: 'sections.0.text', canonicalEnglish, calculatedEnglish })).toBe(calculatedEnglish);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'conduit-ability-7', field: 'sections.1.text', canonicalEnglish: 'You or one ally within distance gains temporary Stamina equal to your Intuition score.', calculatedEnglish: 'You or one ally within distance gains temporary Stamina equal to 2.' })).toBe('你或射程內的 1 個盟友獲得 2 點臨時體力。');
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'conduit-ability-10', field: 'sections.0.text', canonicalEnglish: 'An enemy takes holy damage equal to your Intuition score.', calculatedEnglish: 'An enemy takes holy damage equal to 2.' })).toBe('敵人受到 2 點神聖傷害。');
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'en', elementID: 'projection-text', field: 'sections.0.text', canonicalEnglish, calculatedEnglish })).toBe(calculatedEnglish);
	});

	it('projects only the calculated Persistent Magic threshold and falls back on an unsupported rewrite', () => {
		const approved = productionLocalizationEntries.find((entry): entry is ElementFieldEntry => (
			(entry.kind === 'element-field') && (entry.elementID === 'elementalist-1-5') && (entry.field === 'description')
		));
		if (!approved) {
			throw new Error('the approved Persistent Magic description is missing from the production catalog');
		}

		const canonicalEnglish = approved.canonicalEnglish;
		const calculatedEnglish = canonicalEnglish.replace('equal to or greater than 5 times your Reason score', 'equal to or greater than 10');
		expect(calculatedEnglish).not.toBe(canonicalEnglish);

		const projected = localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'elementalist-1-5', field: 'description', canonicalEnglish, calculatedEnglish });
		expect(projected).toContain('若你在 1 個回合內受到的傷害 ≧ 10，你會停止維持所有續發型招式。');
		expect(projected).toContain('1 個生物不能同時受到多個相同續發效果的影響。');
		expect(projected).not.toContain('×5');
		expect(projected).not.toMatch(/equal to or greater than/);

		// The worked example's authored '2' is not a calculated value; rewriting it is a
		// structural change this identity does not authorize, so the whole reading falls back.
		const unsupported = calculatedEnglish.replace('a Reason score of 2', 'a Reason score of 5');
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'elementalist-1-5', field: 'description', canonicalEnglish, calculatedEnglish: unsupported })).toBe(unsupported);
	});
});
