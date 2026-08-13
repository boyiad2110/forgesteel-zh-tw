// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1ConduitLevel1AbilityRequiredCanonicalEnglish,
	getV1ConduitLevel1Abilities,
	v1ConduitLevel1AbilityIDs,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { ClassPanel } from '@/components/panels/elements/class-panel/class-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { ClassData } from '@/data/class-data';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { FactoryLogic } from '@/logic/factory-logic';
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

const required = createV1ConduitLevel1AbilityRequiredCanonicalEnglish();
const requiredIdentities = Object.keys(required).sort();
const conduitCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	entry.kind === 'element-field'
		&& v1ConduitLevel1AbilityIDs.includes(entry.elementID as typeof v1ConduitLevel1AbilityIDs[number])
));

const getAbility = (id: typeof v1ConduitLevel1AbilityIDs[number]) => {
	const ability = getV1ConduitLevel1Abilities().find(candidate => candidate.id === id);
	if (!ability) {
		throw new Error(`Conduit ability '${id}' is missing`);
	}
	return ability;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(0, 0, 0, 2, 0);
	return hero;
};

const renderAbility = (id: typeof v1ConduitLevel1AbilityIDs[number], hero = makeHero()) => ({
	hero,
	...render(
		createElement(
			LocalizationProvider,
			null,
			createElement(LocaleToggle),
			createElement(AbilityPanel, { ability: getAbility(id), hero, mode: PanelMode.Full })
		)
	)
});

const toggleCalculation = () => fireEvent.click(screen.getByTitle(/^(自動計算傷害、效力等數值|Auto-calculate damage, potency, etc)$/));
const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent || '');
const containsParagraph = (text: string) => screen.getByText((_content, element) => element?.tagName === 'P' && element.textContent?.includes(text));

const getLibraryAbility = (container: HTMLElement, id: string) => {
	const panel = container.querySelector(`#ability-${id}`);
	expect(panel).toBeTruthy();
	return panel as HTMLElement;
};

const expandLibraryAbilityGroups = () => {
	fireEvent.click(screen.getByRole('radio', { name: '招式' }));
	fireEvent.click(screen.getByText('招牌招式'));
	fireEvent.click(screen.getByText('3 費招式'));
	fireEvent.click(screen.getByText('5 費招式'));
};

afterEach(cleanup);

describe('V1 Conduit Level 1 ability manifest', () => {
	it('enumerates exactly the twenty approved live Conduit abilities and their 127 authored identities', () => {
		const abilities = getV1ConduitLevel1Abilities();

		expect(abilities.map(ability => ability.id)).toEqual(v1ConduitLevel1AbilityIDs);
		expect(new Set(abilities.map(ability => ability.id)).size).toBe(20);
		expect(requiredIdentities).toHaveLength(127);
		expect(required[elementFieldIdentity('conduit-1-7a', 'type.trigger')]).toBe('The target makes an ability roll for a damage-dealing ability.');
		expect(required[elementFieldIdentity('conduit-ability-7', 'sections.1.text')]).toBe('You or one ally within distance gains temporary Stamina equal to your Intuition score.');
		expect(required[elementFieldIdentity('conduit-ability-10', 'sections.0.text')]).toContain('takes holy damage equal to your Intuition score.');
	});

	it('has exact catalog identities, approved packet readings, and no catalog drift for this slice', () => {
		expect(conduitCatalogEntries).toHaveLength(127);
		expect(conduitCatalogEntries.map(getEntryIdentity).sort()).toEqual(requiredIdentities);
		expect(conduitCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(required[elementFieldIdentity('conduit-1-5', 'sections.1.effect')].startsWith('\n')).toBe(true);
		expect(conduitCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:conduit-ability-7/sections.1.text')?.zhTW).toBe('你或射程內的 1 個盟友獲得等於你直覺的臨時體力。');
		expect(conduitCatalogEntries.find(entry => getEntryIdentity(entry) === 'element:conduit-ability-10/sections.0.text')?.zhTW).toContain('受到等於你直覺的神聖傷害。');
	});

	it('matches live canonical Conduit English, has no missing or unapproved entries, and retains the unresolved parent domain', () => {
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

	it('projects calculated Conduit Intuition values canonical-English-first without passing zh-TW into AbilityLogic', () => {
		const hero = makeHero();
		const prayer = getAbility('conduit-ability-7');
		const font = getAbility('conduit-ability-10');
		const prayerRaw = required[elementFieldIdentity(prayer.id, 'sections.1.text')];
		const fontRaw = required[elementFieldIdentity(font.id, 'sections.0.text')];
		const prayerCalculated = AbilityLogic.getTextEffect(prayerRaw, hero);
		const fontCalculated = AbilityLogic.getTextEffect(fontRaw, hero);

		expect(prayerCalculated).toContain('temporary Stamina equal to 2');
		expect(fontCalculated).toContain('holy damage equal to 2');
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: prayer.id, field: 'sections.1.text', canonicalEnglish: prayerRaw, calculatedEnglish: prayerCalculated })).toContain('獲得 2 點臨時體力');
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: font.id, field: 'sections.0.text', canonicalEnglish: fontRaw, calculatedEnglish: fontCalculated })).toContain('受到 2 點神聖傷害');
		expect(localizeCalculatedAuthoredTextPresentation({ locale: 'en', elementID: font.id, field: 'sections.0.text', canonicalEnglish: fontRaw, calculatedEnglish: fontCalculated })).toBe(fontCalculated);
		expect(JSON.stringify(font)).toContain(fontRaw);
	});

	it('renders approved production Hero calculated and raw zh-TW, then canonical English, without changing canonical state', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const prayer = renderAbility('conduit-ability-7');
		const prayerAbility = getAbility('conduit-ability-7');
		const serializedAbility = JSON.stringify(prayerAbility);
		const serializedHero = JSON.stringify(prayer.hero);

		expect(tierTexts(prayer.container)[0]).toContain('5 神聖傷害');
		containsParagraph('獲得 2 點臨時體力');
		toggleCalculation();
		expect(tierTexts(prayer.container)[0]).toContain('3 + 直覺神聖傷害');
		containsParagraph('獲得等於你直覺的臨時體力');
		prayer.unmount();

		const font = renderAbility('conduit-ability-10');
		containsParagraph('受到 2 點神聖傷害');
		fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
		expect(font.container.textContent).toContain('takes holy damage equal to 2');

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(/[\u4e00-\u9fff]/));
		expect(JSON.stringify(prayerAbility)).toBe(serializedAbility);
		expect(JSON.stringify(prayer.hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders approved production Library/no-Hero zh-TW raw readings and canonical English', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const serializedClass = JSON.stringify(ClassData.conduit);
		const { container } = render(
			createElement(
				LocalizationProvider,
				null,
				createElement(LocaleToggle),
				createElement(ClassPanel, { heroClass: ClassData.conduit, sourcebooks: [], mode: PanelMode.Full })
			)
		);

		expandLibraryAbilityGroups();
		const prayer = getLibraryAbility(container, 'conduit-ability-7');
		expect(tierTexts(prayer)[0]).toContain('3 + 直覺神聖傷害');
		expect(prayer.textContent).toContain('獲得等於你直覺的臨時體力');
		const font = getLibraryAbility(container, 'conduit-ability-10');
		expect(font.textContent).toContain('受到等於你直覺的神聖傷害');
		expect(font.textContent).not.toMatch(/holy damage equal to your Intuition score/);

		fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
		expect(tierTexts(getLibraryAbility(container, 'conduit-ability-7'))[0]).toContain('3 + I holy damage');
		expect(getLibraryAbility(container, 'conduit-ability-10').textContent).toContain('takes holy damage equal to your Intuition score');
		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => expect(input).not.toMatch(/[\u4e00-\u9fff]/));
		expect(JSON.stringify(ClassData.conduit)).toBe(serializedClass);
		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});
});
