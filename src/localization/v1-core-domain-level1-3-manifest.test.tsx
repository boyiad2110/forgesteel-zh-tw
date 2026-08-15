// @vitest-environment jsdom
/* eslint-disable sort-imports */

import {
	createV1CoreDomainLevel1To3RequiredCanonicalEnglish,
	getV1CoreDomains,
	v1CoreDomainIDs,
	v1CoreDomainLevels,
	v1HeroCreationSourcebooks,
	v1LocalizationManifest
} from '@/localization/v1-localization-manifest';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { ConfigDomain, InfoDomain } from '@/components/features/feature-data/domain';
import { ConfigDomainFeature } from '@/components/features/feature-data/domain-feature';
import { DomainPanel } from '@/components/panels/elements/domain-panel/domain-panel';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { ElementFieldEntry, LocalizationEntry, MessageEntry, UIStringEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { Characteristic } from '@/enums/characteristic';
import { Domain } from '@/models/domain';
import { Feature, FeatureDomainData, FeatureDomainFeatureData } from '@/models/feature';
import { FeatureType } from '@/enums/feature-type';
import { Hero } from '@/models/hero';
import { core } from '@/data/sourcebooks/official/core';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { PanelMode } from '@/enums/panel-mode';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode, createElement } from 'react';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const required = createV1CoreDomainLevel1To3RequiredCanonicalEnglish(v1HeroCreationSourcebooks);
const domains = getV1CoreDomains(v1HeroCreationSourcebooks);

const getDomain = (id: string) => {
	const domain = domains.find(candidate => candidate.id === id);
	if (!domain) {
		throw new Error(`Core Domain '${id}' is missing`);
	}
	return domain;
};

/** The authored (non-container) Feature nodes of one Domain level, in traversal order. */
const authoredNodes = (features: Feature[], collected: Feature[] = []): Feature[] => {
	features.forEach(feature => {
		switch (feature.type) {
			case FeatureType.Multiple:
				authoredNodes(feature.data.features, collected);
				break;
			case FeatureType.SkillChoice:
				break;
			default:
				collected.push(feature);
		}
	});
	return collected;
};

const levelNodes = (level: number) => domains.flatMap(domain => authoredNodes(domain.featuresByLevel.filter(lvl => lvl.level === level).flatMap(lvl => lvl.features)));

const identitiesFor = (elementIDs: string[]) => Object.keys(required).filter(identity => elementIDs.some(id => identity.startsWith(`element:${id}/`)));

const domainMetadataIdentities = v1CoreDomainIDs.flatMap(id => [ elementFieldIdentity(id, 'name'), elementFieldIdentity(id, 'description') ]);
const resourceGainIdentities = v1CoreDomainIDs.map(id => elementFieldIdentity(id, 'resourceGains.0.trigger'));
const prayerIdentities = identitiesFor(domains.flatMap(domain => domain.defaultFeatures.map(feature => feature.id)));
const level1Identities = identitiesFor(levelNodes(1).map(node => node.id));
const level2Identities = identitiesFor(levelNodes(2).map(node => node.id));

const domainCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

/**
 * The exact Domain UI and message keys this slice was approved for. It is a closed list rather
 * than a key-prefix match, so a later batch adding another Domain UI key is not a failure of
 * this slice's contract.
 */
const approvedDomainUIKeys = [
	'domain.term',
	'domain-panel.page.overview',
	'domain-panel.page.features',
	'domain-panel.page.additional',
	'domain-panel.conduit-only-note',
	'domain-panel.resource-gains',
	'domain-panel.unnamed',
	'domain-panel.level',
	'feature-domain.choose-one',
	'feature-domain.choose-many',
	'feature-domain.choose-count',
	'feature-domain.select-one',
	'feature-domain.select-many',
	'feature-domain-feature.choose-domain-first',
	'feature-domain-feature.choose-count',
	'feature-domain-feature.select-one',
	'feature-domain-feature.select-many'
] as const;

const domainUIEntries = productionLocalizationEntries.filter((entry: LocalizationEntry): entry is MessageEntry | UIStringEntry => (
	((entry.kind === 'ui') || (entry.kind === 'message'))
	&& approvedDomainUIKeys.includes(entry.key as typeof approvedDomainUIKeys[number])
));

const heroWithCharacteristics = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.level = 2;
	hero.class.characteristics = FactoryLogic.createCharacteristics(1, 2, 0, 3, -1);
	return hero;
};

/** A Hero whose class grants the given Domain, which is what ConfigDomainFeature reads. */
const heroWithDomain = (domain: Domain) => {
	const hero = heroWithCharacteristics();
	const feature = FactoryLogic.feature.createDomainChoice({ id: 'test-domain-choice', count: 1 });
	feature.data.selected = [ domain ];
	hero.class?.featuresByLevel.filter(lvl => lvl.level === 1).forEach(lvl => lvl.features.push(feature));
	return hero;
};

const findAbility = (id: string) => {
	const node = domains
		.flatMap(domain => domain.featuresByLevel.filter(lvl => v1CoreDomainLevels.includes(lvl.level)).flatMap(lvl => authoredNodes(lvl.features)))
		.find(candidate => (candidate.id === id) && (candidate.type === FeatureType.Ability));
	if (!node || (node.type !== FeatureType.Ability)) {
		throw new Error(`Domain ability '${id}' is missing`);
	}
	return node.data.ability;
};

const tierReading = (abilityID: string, field: string, tier: number, hero?: Hero) => {
	const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, findAbility(abilityID), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const textReading = (elementID: string, field: string, hero?: Hero) => {
	const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: elementID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const renderDomain = (domain: Domain, mode: PanelMode, hero?: Hero) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(DomainPanel, { domain: domain, sourcebooks: [ core ], hero: hero, mode: mode })
	)
);

const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Domain panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

const fieldReading = (container: HTMLElement, label: string) => {
	const field = Array.from(container.querySelectorAll('.field')).find(node => node.querySelector('.field-label')?.textContent?.trim() === label);
	return field?.querySelector('.field-value')?.textContent?.trim();
};

afterEach(cleanup);

describe('V1 Core Domain Level 1-3 manifest', () => {
	it('enumerates exactly the approved 12-Domain, 147-identity slice and its catalog entries', () => {
		expect(domains.map(domain => domain.id)).toEqual([ ...v1CoreDomainIDs ]);
		expect(v1CoreDomainIDs).toHaveLength(12);
		expect(v1CoreDomainLevels).toEqual([ 1, 2, 3 ]);
		expect(Object.keys(required)).toHaveLength(147);
		expect(domainCatalogEntries).toHaveLength(147);

		const catalogIdentities = domainCatalogEntries.map(getEntryIdentity);
		expect(new Set(catalogIdentities).size).toBe(147);
		expect(catalogIdentities.slice().sort()).toEqual(Object.keys(required).sort());
		expect(domainCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(domainCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
	});

	it('splits those 147 identities into the approved content breakdown', () => {
		expect(domainMetadataIdentities).toHaveLength(24);
		expect(level1Identities).toHaveLength(30);
		expect(level2Identities).toHaveLength(57);
		expect(resourceGainIdentities).toHaveLength(12);
		expect(prayerIdentities).toHaveLength(24);

		const all = [ ...domainMetadataIdentities, ...level1Identities, ...level2Identities, ...resourceGainIdentities, ...prayerIdentities ];
		expect(new Set(all).size).toBe(147);
		expect(all.every(identity => required[identity] !== undefined)).toBe(true);

		// Level 3 authors no content in any of the twelve Domains, which is why 147 is the total.
		expect(domains.every(domain => domain.featuresByLevel.filter(lvl => lvl.level === 3).every(lvl => lvl.features.length === 0))).toBe(true);
	});

	it('contributes all 147 of its identities to the manifest denominator', () => {
		const manifestIdentities = Object.keys(v1LocalizationManifest.requiredCanonicalEnglish);
		const domainIdentities = Object.keys(required);

		expect(domainIdentities).toHaveLength(147);
		expect(domainIdentities.every(identity => manifestIdentities.includes(identity))).toBe(true);
		expect(domainIdentities.every(identity => v1LocalizationManifest.requiredCanonicalEnglish[identity] === required[identity])).toBe(true);
	});

	it('leaves Domain Levels 4-10 outside this slice', () => {
		const identities = Object.keys(required);
		const laterLevelNodes = domains.flatMap(domain => authoredNodes(domain.featuresByLevel.filter(lvl => lvl.level > 3).flatMap(lvl => lvl.features)));

		expect(laterLevelNodes.length).toBeGreaterThan(0);
		laterLevelNodes.forEach(node => {
			expect(identities.some(identity => identity.startsWith(`element:${node.id}/`))).toBe(false);
		});
	});

	it('carries the approved 17 Domain UI and message identities', () => {
		expect(approvedDomainUIKeys).toHaveLength(17);
		expect(domainUIEntries).toHaveLength(17);
		expect(domainUIEntries.map(entry => entry.key).slice().sort()).toEqual([ ...approvedDomainUIKeys ].sort());
		expect(domainUIEntries.every(entry => entry.approval === 'approved')).toBe(true);
	});

	it('records exactly the approved glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^(Domain|Creation|Death|Fate|Knowledge|Life|Love|Nature|Protection|Storm|Sun|Trickery|War),/.test(row))).toEqual([
			'Domain,領域,game-term,approved',
			'Creation,創造,game-term,approved',
			'Death,死亡,game-term,approved',
			'Fate,命運,game-term,approved',
			'Knowledge,知識,game-term,approved',
			'Life,生命,game-term,approved',
			'Love,慈愛,game-term,approved',
			'Nature,自然,game-term,approved',
			'Protection,守護,game-term,approved',
			'Storm,風暴,game-term,approved',
			'Sun,太陽,game-term,approved',
			'Trickery,詭術,game-term,approved',
			'War,戰爭,game-term,approved'
		]);
	});

	it('keeps the catalog valid and the parent authored-content domain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		// Finishing the Domain Level 1-3 Abilities does not finish the domain they belong to.
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('official-ability-authored-content');
		expect(result.complete).toBe(false);
	});
});

describe('Domain panel presentation', () => {
	it('renders a full Domain in zh-TW, including the page labels and level headings', () => {
		const { container } = renderDomain(getDomain('domain-sun'), PanelMode.Full);

		expect(container.textContent).toContain('太陽');
		expect(container.textContent).toContain('「太陽」領域。');
		expect(Array.from(container.querySelectorAll('.ant-segmented-item-label')).map(node => node.textContent)).toEqual([ '概述', '特性', '額外內容' ]);

		clickPage(container, '特性');

		// The level heading is a composed message, and a Level 2 Ability Feature summary reads
		// from the Ability's own approved name.
		expect(fieldReading(container, '2 級')).toBe('晨光燒灼');
		expect(container.textContent).toContain('1 級');
		expect(container.textContent).not.toContain('Level 2');
	});

	it('renders the Additional page: the Conduit note, Resource Gains and the default prayer', () => {
		const { container } = renderDomain(getDomain('domain-creation'), PanelMode.Full, heroWithCharacteristics());

		clickPage(container, '額外內容');

		expect(container.textContent).toContain('此頁面的特性是供神導士範型使用。');
		expect(container.textContent).toContain('資源獲取');
		expect(container.textContent).toContain('每場遭遇中，當你 10 格內的 1 個生物首次發動區域招式時。');
		expect(container.textContent).toContain('創造領域禱詞效果');
		// The prayer Feature has no Ability calculator path, so it keeps its approved raw zh-TW
		// even with a Hero present: the Intuition expression is not resolved in Chinese.
		expect(container.textContent).toContain('你引導創造之力，在 10 格內創造 1 道石造障壁，尺寸為 5 + 你的直覺。');
		expect(container.textContent).not.toContain('Resource Gains');
		expect(container.textContent).not.toContain('The features on this page');
	});

	it('renders the compact mode in zh-TW and falls back to canonical English in the English locale', () => {
		const { container } = renderDomain(getDomain('domain-trickery'), PanelMode.Compact);

		expect(container.textContent).toContain('詭術');
		expect(container.textContent).not.toContain('Trickery');

		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

		expect(container.textContent).toContain('Trickery');
		expect(container.textContent).toContain('The Trickery domain.');
		expect(container.textContent).not.toMatch(/[一-鿿]/);
	});

	it('shows the approved unnamed reading rather than an empty header', () => {
		const unnamed: Domain = { ...getDomain('domain-war'), name: '' };
		const { container } = renderDomain(unnamed, PanelMode.Compact);

		expect(container.textContent).toContain('未命名領域');
	});

	it('does not mutate the Domain it was given when switching locale', () => {
		const domain = getDomain('domain-storm');
		const serialized = JSON.stringify(domain);

		renderDomain(domain, PanelMode.Full);
		fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

		expect(JSON.stringify(domain)).toBe(serialized);
		expect(domain.id).toBe('domain-storm');
		expect(domain.name).toBe('Storm');
		expect(domain.resourceGains[0].resource).toBe('Piety');
	});
});

describe('Domain selection presentation', () => {
	const domainData = (overrides: Partial<FeatureDomainData> = {}): FeatureDomainData => ({
		characteristic: Characteristic.Intuition,
		levels: [ 1, 2, 3 ],
		count: 1,
		selected: [],
		...overrides
	});

	const renderConfig = (data: FeatureDomainData) => {
		const feature = { id: 'test-domain-feature', name: 'Domain', description: '', type: FeatureType.Domain as const, data: data };

		return render(
			createElement(
				LocalizationProvider,
				null,
				createElement(ConfigDomain, { data: data, feature: feature, hero: heroWithCharacteristics(), sourcebooks: [ core ], setData: vi.fn() })
			)
		);
	};

	const renderInfo = (data: FeatureDomainData) => {
		const feature = { id: 'test-domain-feature', name: 'Domain', description: '', type: FeatureType.Domain as const, data: data };

		return render(
			createElement(
				LocalizationProvider,
				null,
				createElement(InfoDomain, { data: data, feature: feature, sourcebooks: [ core ] })
			)
		);
	};

	it('localizes the single and multiple choose-a-domain messages', () => {
		expect(renderInfo(domainData()).container.textContent).toContain('選擇 1 個領域。');
		cleanup();
		expect(renderInfo(domainData({ count: 3 })).container.textContent).toContain('選擇 3 個領域。');
	});

	it('localizes the multi-selection count message with its placeholder filled', () => {
		const { container } = renderConfig(domainData({ count: 2 }));

		expect(container.textContent).toContain('選擇 2 個：');
		expect(container.textContent).not.toContain('Choose 2:');
	});

	it('localizes the selected Domain summary and delegates to a zh-TW DomainPanel', () => {
		const { container } = renderConfig(domainData({ selected: [ getDomain('domain-knowledge') ] }));

		expect(container.textContent).toContain('知識');
		expect(container.textContent).toContain('「知識」領域。');
		expect(container.textContent).not.toContain('The Knowledge domain.');
	});

	it('keeps the canonical Domain ID as the option value while localizing its reading', () => {
		const data = domainData({ selected: [ getDomain('domain-love') ] });
		const serialized = JSON.stringify(data);

		renderConfig(data);

		expect(data.selected[0].id).toBe('domain-love');
		expect(JSON.stringify(data)).toBe(serialized);
	});
});

describe('Domain feature selection presentation', () => {
	const featureData = (overrides: Partial<FeatureDomainFeatureData> = {}): FeatureDomainFeatureData => ({
		level: 2,
		count: 1,
		selected: [],
		...overrides
	});

	const renderConfig = (data: FeatureDomainFeatureData, hero: Hero) => {
		const feature = { id: 'test-domain-feature-choice', name: 'Domain Feature', description: '', type: FeatureType.DomainFeature as const, data: data };

		return render(
			createElement(
				LocalizationProvider,
				null,
				createElement(ConfigDomainFeature, { data: data, feature: feature, hero: hero, sourcebooks: [ core ], setData: vi.fn() })
			)
		);
	};

	it('localizes the choose-a-domain-first alert when no Domain is selected yet', () => {
		const { container } = renderConfig(featureData(), heroWithCharacteristics());

		expect(container.textContent).toContain('選擇 1 個領域以啟用此特性。');
		expect(container.textContent).not.toContain('Choose a domain to enable this feature.');
	});

	it('localizes the option count message once the Hero has a Domain', () => {
		const { container } = renderConfig(featureData({ count: 2 }), heroWithDomain(getDomain('domain-nature')));

		expect(container.textContent).toContain('選擇 2 個：');
		expect(container.textContent).not.toContain('Choose 2:');
	});

	it('renders a selected Domain Feature through a zh-TW FeaturePanel', () => {
		const nature = getDomain('domain-nature');
		const level2 = nature.featuresByLevel.find(lvl => lvl.level === 2)?.features || [];
		const { container } = renderConfig(featureData({ selected: level2 }), heroWithDomain(nature));

		expect(container.textContent).toContain('自然審判');
		expect(container.textContent).toContain('神祕的尖刺藤蔓應你召喚，纏縛你的敵人。');
		expect(container.textContent).not.toContain('Nature Judges Thee');
	});
});

describe('Domain Ability presentation', () => {
	it('presents packet-approved raw content on the no-Hero path', () => {
		// Characteristic damage + potency + a long authored tail.
		expect(tierReading('domain-knowledge-2', 'sections.0.roll.tier1', 1)).toBe('4 + `直覺`神聖傷害；`氣場` < [弱]，在受到傷害前，目標對你選擇的 1 個目標發動 1 次基礎打擊');
		expect(tierReading('domain-knowledge-2', 'sections.0.roll.tier3', 3)).toBe('11 + `直覺`神聖傷害；`氣場` < [強]，在受到傷害前，目標遁移最多等於其速度的距離至你選擇的位置，使用 1 個由你選擇的招式，且該招式的所有目標由你選擇');
		// Fixed damage + potency + a condition the calculator emphasizes.
		expect(tierReading('domain-nature-2', 'sections.0.roll.tier1', 1)).toBe('2 傷害；`敏捷` < [弱]，**束縛**（豁免解除）');
		// Vertical slide, and fixed numeric fire damage: both left as authored.
		expect(tierReading('domain-storm-2', 'sections.0.roll.tier1', 1)).toBe('2 閃電傷害；垂直滑動 1');
		expect(tierReading('domain-sun-2', 'sections.0.roll.tier2', 2)).toBe('6 火焰傷害');
		// Authored prose keeps its unresolved characteristic expression without a Hero.
		expect(textReading('domain-creation-1-1', 'sections.0.text')).toContain('你可以同時維持的自創物體數量等於你的`直覺`。');
		expect(textReading('domain-death-2', 'sections.0.text')).toBe('直到你的下個回合開始前，每當 1 個目標殺死 1 個敵人時，目標會恢復等於 5 + 你`直覺`的體力。');
		expect(textReading('domain-sun-2', 'sections.1.text')).toBe('區域內每個盟友在其下個回合結束前發動的下次打擊，會額外造成等於你`直覺`的火焰傷害。');
	});

	it('calculates canonical English first, then projects the resolved values', () => {
		const hero = heroWithCharacteristics();
		const ability = findAbility('domain-knowledge-2');
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		expect(tierReading('domain-knowledge-2', 'sections.0.roll.tier1', 1, hero)).toBe('7 神聖傷害；`氣場` < 1，在受到傷害前，目標對你選擇的 1 個目標發動 1 次基礎打擊');
		expect(tierReading('domain-knowledge-2', 'sections.0.roll.tier2', 2, hero)).toBe('10 神聖傷害；`氣場` < 2，在受到傷害前，目標使用 1 個由你選擇的招式，且該招式的所有目標由你選擇');
		expect(tierReading('domain-knowledge-2', 'sections.0.roll.tier3', 3, hero)).toBe('14 神聖傷害；`氣場` < 3，在受到傷害前，目標遁移最多等於其速度的距離至你選擇的位置，使用 1 個由你選擇的招式，且該招式的所有目標由你選擇');
		expect(tierReading('domain-nature-2', 'sections.0.roll.tier2', 2, hero)).toBe('3 傷害；`敏捷` < 2，**束縛**（豁免解除）');
		// The three authored readings whose Intuition expression the calculator resolves.
		expect(textReading('domain-creation-1-1', 'sections.0.text', hero)).toContain('你可以同時維持的自創物體數量為 3。');
		expect(textReading('domain-death-2', 'sections.0.text', hero)).toBe('直到你的下個回合開始前，每當 1 個目標殺死 1 個敵人時，目標會恢復 8 點體力。');
		expect(textReading('domain-sun-2', 'sections.1.text', hero)).toBe('區域內每個盟友在其下個回合結束前發動的下次打擊，會額外造成 3 點火焰傷害。');

		// The calculator only ever sees canonical English, and neither input was written to.
		expect(getTierEffectCreature.mock.calls.every(([ input ]) => !/[一-鿿]/.test(input))).toBe(true);
		expect(getTextEffect.mock.calls.every(([ input ]) => !/[一-鿿]/.test(input))).toBe(true);
		expect(getTierEffectCreature.mock.calls.map(([ input ]) => input)).toContain('4 + I holy damage; P < [weak], before taking damage, the target makes a free strike against a target you choose');
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);

		getTierEffectCreature.mockRestore();
		getTextEffect.mockRestore();
	});

	it('leaves a reading the calculator does not touch as approved zh-TW on the Hero path too', () => {
		const hero = heroWithCharacteristics();

		// 'up to their speed' is target-relative, so the calculator leaves the tail authored and
		// the approved zh-TW keeps its 等於其速度 wording rather than falling back to English.
		expect(tierReading('domain-knowledge-2', 'sections.0.roll.tier3', 3, hero)).toContain('目標遁移最多等於其速度的距離');
		expect(tierReading('domain-storm-2', 'sections.0.roll.tier3', 3, hero)).toBe('7 閃電傷害；垂直滑動 3');
		expect(textReading('domain-nature-1-1', 'sections.0.text', hero)).toContain('你會受到 1d10 點心靈傷害');
	});

	it('fails closed to whole calculated English when a projection cannot be proven', () => {
		const hero = heroWithCharacteristics();
		const canonicalEnglish = required[elementFieldIdentity('domain-death-2', 'sections.0.text')];
		const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);

		// A structural rewrite the approved zh-TW cannot be matched against is never restated in
		// Chinese: the whole reading falls back to calculated English instead.
		expect(localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'domain-death-2',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: `${calculatedEnglish} They also stand up.`
		})).toBe(`${calculatedEnglish} They also stand up.`);
		expect(calculatedEnglish).not.toMatch(/[一-鿿]/);
	});
});
