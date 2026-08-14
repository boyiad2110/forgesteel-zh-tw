// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1ElementalistLevel1AbilityRequiredCanonicalEnglish,
	getV1ElementalistLevel1Abilities,
	v1ElementalistLevel1AbilityIDs,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { FactoryLogic } from '@/logic/factory-logic';
import { AbilityLogic } from '@/logic/ability-logic';
import { PanelMode } from '@/enums/panel-mode';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { productionLocalizationEntries } from '@/localization/catalog-data';
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

const required = createV1ElementalistLevel1AbilityRequiredCanonicalEnglish();
const requiredIdentities = Object.keys(required).sort();
const elementalistCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	entry.kind === 'element-field'
		&& v1ElementalistLevel1AbilityIDs.includes(entry.elementID as typeof v1ElementalistLevel1AbilityIDs[number])
));

const getAbility = (id: typeof v1ElementalistLevel1AbilityIDs[number]) => {
	const ability = getV1ElementalistLevel1Abilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Elementalist ability '${id}' is missing`);
	}
	return ability;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(0, 0, 2, 0, 0);
	return hero;
};

afterEach(cleanup);

describe('V1 Elementalist Level 1 ability manifest', () => {
	it('enumerates exactly the twenty approved live Elementalist abilities and their 133 authored identities', () => {
		const abilities = getV1ElementalistLevel1Abilities();

		expect(abilities.map(ability => ability.id)).toEqual(v1ElementalistLevel1AbilityIDs);
		expect(new Set(abilities.map(ability => ability.id)).size).toBe(20);
		expect(requiredIdentities).toHaveLength(133);
		expect(required[elementFieldIdentity('elementalist-1-4', 'sections.0.roll.tier1')]).toBe('2 + R damage');
		expect(required[elementFieldIdentity('elementalist-1-8c', 'type.trigger')]).toContain('your Reason score');
		expect(required[elementFieldIdentity('elementalist-ability-12', 'sections.1.text')]).toContain('up to your Reason score');
	});

	it('has exact catalog identities, approved packet readings, and no catalog drift for this slice', () => {
		expect(elementalistCatalogEntries).toHaveLength(133);
		expect(elementalistCatalogEntries.map(getEntryIdentity).sort()).toEqual(requiredIdentities);
		expect(elementalistCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(elementalistCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:elementalist-ability-10/sections.1.name')?.zhTW).toBe('\u7e8c\u767c');
		expect(elementalistCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:elementalist-1-8c/type.trigger')?.zhTW).toContain('\u7406\u667a');
	});

	it('matches live canonical Elementalist English and retains the unresolved parent domain', () => {
		const result = analyzeV1LocalizationCompleteness({
			...v1LocalizationManifest,
			catalogEntries: productionLocalizationEntries
		});

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.complete).toBe(false);
	});

	it('calculates canonical English first, then projects only authorized Reason values into zh-TW', () => {
		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const hurl = getAbility('elementalist-1-4');
		const hurlRaw = required[elementFieldIdentity(hurl.id, 'sections.0.roll.tier1')];
		const hurlCalculated = AbilityLogic.getTierEffectCreature(hurlRaw, 1, hurl, undefined, hero);
		const hurlZhTW = localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: hurl.id, field: 'sections.0.roll.tier1', canonicalEnglish: hurlRaw, calculatedEnglish: hurlCalculated });

		expect(hurlCalculated).toBe('4 damage');
		expect(hurlZhTW).toBe('4 \u50b7\u5bb3');
		expect(localizePowerRollTierPresentation({ locale: 'en', abilityID: hurl.id, field: 'sections.0.roll.tier1', canonicalEnglish: hurlRaw, calculatedEnglish: hurlCalculated })).toBe(hurlCalculated);

		const practicalRaw = required[elementFieldIdentity('elementalist-1-6', 'sections.0.text')];
		const practicalCalculated = AbilityLogic.getTextEffect(practicalRaw, hero);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'elementalist-1-6', field: 'sections.0.text', canonicalEnglish: practicalRaw, calculatedEnglish: practicalCalculated })).toContain('\u53d7\u5230 2 \u9ede\u6240\u9078\u985e\u578b\u50b7\u5bb3');

		const wardTriggerRaw = required[elementFieldIdentity('elementalist-1-8c', 'type.trigger')];
		const wardTriggerCalculated = AbilityLogic.getTextEffect(wardTriggerRaw, hero);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'elementalist-1-8c', field: 'type.trigger', canonicalEnglish: wardTriggerRaw, calculatedEnglish: wardTriggerCalculated })).toContain('\u4f60 2 \u683c\u5167');

		const pushRaw = required[elementFieldIdentity('elementalist-1-8d', 'sections.0.text')];
		const pushCalculated = AbilityLogic.getTextEffect(pushRaw, hero);
		expect(pushCalculated).toContain('equal to 4');
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'elementalist-1-8d', field: 'sections.0.text', canonicalEnglish: pushRaw, calculatedEnglish: pushCalculated })).toContain('\u63a8\u52d5 4 \u683c');

		const pillarRaw = required[elementFieldIdentity('elementalist-ability-12', 'sections.1.text')];
		const pillarCalculated = AbilityLogic.getTextEffect(pillarRaw, hero);
		expect(pillarCalculated).toBe(pillarRaw);
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: 'elementalist-ability-12', field: 'sections.1.text', canonicalEnglish: pillarRaw, calculatedEnglish: pillarCalculated })).toContain('\u6700\u9ad8\u7b49\u65bc\u4f60\u7406\u667a\u7684\u683c\u6578');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(/[\u4e00-\u9fff]/));
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('keeps approved raw zh-TW in the no-Hero presentation path without mutating canonical data', () => {
		const ability = getAbility('elementalist-ability-3');
		const canonical = required[elementFieldIdentity(ability.id, 'sections.1.text')];
		const serializedAbility = JSON.stringify(ability);
		const display = localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: ability.id, field: 'sections.1.text', canonicalEnglish: canonical, calculatedEnglish: AbilityLogic.getTextEffect(canonical, undefined) });
		const { container } = render(
			createElement(LocalizationProvider, null, createElement(LocaleToggle), createElement(AbilityPanel, { ability, mode: PanelMode.Full }))
		);

		expect(display).toBe('\u4f60\u53ef\u4ee5\u50b3\u9001\u6700\u591a\u7b49\u65bc\u4f60\u7406\u667a\u7684\u683c\u6578\u3002');
		expect(container.textContent).toContain(display);
		expect(container.textContent).not.toContain('your Reason score');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
	});
});
