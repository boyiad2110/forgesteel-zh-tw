// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1NullLevel1AbilityRequiredCanonicalEnglish,
	getV1NullLevel1Abilities,
	v1LocalizationManifest,
	v1NullLevel1AbilityIDs
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { ElementFieldEntry, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { FactoryLogic } from '@/logic/factory-logic';
import { AbilityLogic } from '@/logic/ability-logic';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { PanelMode } from '@/enums/panel-mode';
import { cleanup, render } from '@testing-library/react';
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

const required = createV1NullLevel1AbilityRequiredCanonicalEnglish();
const nullEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => entry.kind === 'element-field' && entry.elementID.startsWith('null-'));

const getAbility = (id: typeof v1NullLevel1AbilityIDs[number]) => {
	const ability = getV1NullLevel1Abilities().find(candidate => candidate.id === id);
	if (!ability) throw new Error(`Null ability '${id}' is missing`);
	return ability;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(0, 2, 0, 3, 0);
	return hero;
};

const renderAbility = (id: typeof v1NullLevel1AbilityIDs[number], hero?: ReturnType<typeof makeHero>) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(AbilityPanel, { ability: getAbility(id), hero, mode: PanelMode.Full })
	)
);

afterEach(cleanup);

describe('V1 Null Level 1 ability manifest', () => {
	it('enumerates exactly the approved live Null slice and its 115 catalog identities', () => {
		expect(getV1NullLevel1Abilities().map(ability => ability.id)).toEqual(v1NullLevel1AbilityIDs);
		expect(v1NullLevel1AbilityIDs).toHaveLength(18);
		expect(Object.keys(required)).toHaveLength(115);
		expect(nullEntries).toHaveLength(115);
		expect(nullEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(nullEntries.every(entry => entry.approval === 'approved' && entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
	});

	it('retains the unresolved parent domain and approved raw no-Hero reading', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });
		expect(result.missing).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		const raw = required['element:null-ability-1/sections.1.text'];
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'null-ability-1', field: 'sections.1.text', canonicalEnglish: raw, calculatedEnglish: AbilityLogic.getTextEffect(raw, undefined) })).toBe('\u4f60\u53ef\u4ee5\u5c07 1 \u500b\u76f8\u9130\u7684\u6575\u4eba\u6ed1\u52d5\u6700\u591a\u7b49\u65bc\u4f60`\u76f4\u89ba`\u7684\u683c\u6578\u3002');
	});

	it('calculates canonical English first and projects resolved Null values into zh-TW', () => {
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const checks = [
			[ 'null-ability-1', 'sections.1.text', '\u6ed1\u52d5\u6700\u591a 3 \u683c' ],
			[ 'null-ability-2', 'sections.1.text', '\u9020\u6210 2 \u9ede\u50b7\u5bb3' ],
			[ 'null-ability-13', 'sections.1.text', '\u53d7\u5230 3 \u9ede\u50b7\u5bb3' ]
		] as const;
		checks.forEach(([ id, field, expected ]) => {
			const canonical = required[`element:${id}/${field}`];
			const calculated = AbilityLogic.getTextEffect(canonical, hero);
			const display = localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field, canonicalEnglish: canonical, calculatedEnglish: calculated });
			expect(display).toContain(expected);
			expect(display).not.toContain('\u7b49\u65bc 3 \u683c');
		});
		[
			[ 'null-ability-3', 'sections.1.text', '\u9041\u79fb\u6700\u591a 2 \u683c' ],
			[ 'null-ability-9', 'sections.1.text', '\u9041\u79fb\u6700\u591a 2 \u683c' ],
			[ 'null-ability-10', 'sections.0.text', '\u53d7\u5230 6 \u9ede\u5fc3\u9748\u50b7\u5bb3' ],
			[ 'null-ability-11', 'sections.1.text', '\u9041\u79fb\u6700\u591a 5 \u683c' ]
		].forEach(([ id, field, expected ]) => {
			const canonical = required[`element:${id}/${field}`];
			const calculated = AbilityLogic.getTextEffect(canonical, hero);
			const display = localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: id, field, canonicalEnglish: canonical, calculatedEnglish: calculated });
			expect(display).toContain(expected);
		});
		expect(getTextEffect.mock.calls.every(([ input ]) => !/[\u4e00-\u9fff]/.test(input))).toBe(true);
		getTextEffect.mockRestore();
	});

	it('renders approved Hero-calculated, no-Hero, and Power Roll readings through AbilityPanel', () => {
		const ability = getAbility('null-ability-1');
		const serializedAbility = JSON.stringify(ability);
		const heroReading = renderAbility('null-ability-1', makeHero());

		expect(heroReading.container.textContent).toContain('\u4f60\u53ef\u4ee5\u5c07 1 \u500b\u76f8\u9130\u7684\u6575\u4eba\u6ed1\u52d5\u6700\u591a 3 \u683c\u3002');
		expect(Array.from(heroReading.container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent?.trim())).toEqual(expect.arrayContaining([ '3 \u50b7\u5bb3', '4 \u50b7\u5bb3', '5 \u50b7\u5bb3' ]));
		heroReading.unmount();

		const libraryReading = renderAbility('null-ability-1');
		expect(libraryReading.container.textContent).toContain('\u4f60\u53ef\u4ee5\u5c07 1 \u500b\u76f8\u9130\u7684\u6575\u4eba\u6ed1\u52d5\u6700\u591a\u7b49\u65bc\u4f60\u76f4\u89ba\u7684\u683c\u6578\u3002');
		expect(Array.from(libraryReading.container.querySelectorAll('code')).map(node => node.textContent)).toContain('\u76f4\u89ba');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
	});
});
