// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { FeatureType } from '@/enums/feature-type';
import { Kit } from '@/models/kit';
import { Ability } from '@/models/ability';
import { Hero } from '@/models/hero';
import { PanelMode } from '@/enums/panel-mode';
import { core } from '@/data/sourcebooks/official/core';
import { KitPanel } from '@/components/panels/elements/kit-panel/kit-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { ElementFieldEntry, UIStringEntry, elementFieldIdentity, getEntryIdentity, uiStringIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { localizePowerRollTierPresentation } from '@/components/panels/power-roll/power-roll-tier-presentation';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1CoreStandardKitRequiredCanonicalEnglish, createV1StormwightKitRequiredCanonicalEnglish, getV1StormwightKits, v1CoreStandardKitIDs, v1HeroCreationSourcebooks, v1LocalizationManifest, v1StormwightKitIDs } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput } from '@/localization/test-support/localization-differential-invariants';
import { installResizeObserverStub } from '@/localization/test-support/localization-presentation-test-harness';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

installResizeObserverStub();

const required = createV1StormwightKitRequiredCanonicalEnglish(v1HeroCreationSourcebooks);
const standardKitRequired = createV1CoreStandardKitRequiredCanonicalEnglish(v1HeroCreationSourcebooks);
const kits = getV1StormwightKits(v1HeroCreationSourcebooks);
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined));

const getKit = (id: string): Kit => {
	const kit = kits.find(candidate => candidate.id === id);
	if (!kit) {
		throw new Error(`Stormwight Kit '${id}' is missing`);
	}
	return kit;
};

const getAbility = (kitID: string): Ability => {
	const feature = getKit(kitID).features.find(candidate => candidate.type === FeatureType.Ability);
	if (feature?.type !== FeatureType.Ability) {
		throw new Error(`Stormwight Kit '${kitID}' has no signature Ability`);
	}
	return feature.data.ability;
};

/** The representative Hero the Kit slices share: Might 2, Agility 3, so potency is 1/2/3. */
const heroWithCharacteristics = (): Hero => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	hero.class.characteristics = FactoryLogic.createCharacteristics(2, 3, 1, 0, -1);
	return hero;
};

const renderKit = (kit: Kit, mode: PanelMode, hero?: Hero) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(KitPanel, { kit: kit, sourcebooks: [ core ], mode: mode, hero: hero })
	)
);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const tagTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.ant-tag')).map(tag => tag.textContent?.trim() || '');

const tierTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-row .effect')).map(effect => effect.textContent?.trim() || '');

const clickPage = (container: HTMLElement, label: string) => {
	const option = Array.from(container.querySelectorAll('.ant-segmented-item-label')).find(node => node.textContent?.trim() === label);
	if (!option) {
		throw new Error(`Kit panel page '${label}' is missing`);
	}
	fireEvent.click(option);
};

/** The FeaturePanel auto-calc path, exercised through the same presenter production uses. */
const featureReading = (elementID: string, hero?: Hero) => {
	const canonicalEnglish = required[elementFieldIdentity(elementID, 'description')];
	const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);
	return localizeCalculatedAuthoredTextPresentation({ locale: 'zh-TW', elementID: elementID, field: 'description', canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

const tierReading = (kitID: string, tier: number, hero?: Hero) => {
	const abilityID = getAbility(kitID).id;
	const field = `sections.0.roll.tier${tier}`;
	const canonicalEnglish = required[elementFieldIdentity(abilityID, field)];
	const calculatedEnglish = AbilityLogic.getTierEffectCreature(canonicalEnglish, tier, getAbility(kitID), undefined, hero);
	return localizePowerRollTierPresentation({ locale: 'zh-TW', abilityID: abilityID, field: field, canonicalEnglish: canonicalEnglish, calculatedEnglish: calculatedEnglish });
};

afterEach(cleanup);

describe('V1 Core Stormwight Level 1 Kit manifest and catalog', () => {
	it('enumerates exactly the bounded 74-identity four-Kit slice, in the approved 8 / 40 / 26 breakdown', () => {
		// Expected identities come from an independent walk of the live canonical Kit records,
		// not from the production builder: each Kit's own pair, each non-Ability Feature's pair,
		// and each signature Ability's authored fields read straight off the Ability model.
		const independentlyExpected = new Set<string>();
		let metadataFields = 0;
		let nonAbilityFields = 0;
		let abilityFields = 0;

		kits.forEach(kit => {
			const add = (id: string, field: string, value: string) => {
				if (value === '') {
					return;
				}
				const identity = elementFieldIdentity(id, field);
				if (independentlyExpected.has(identity)) {
					throw new Error(`duplicate identity '${identity}'`);
				}
				independentlyExpected.add(identity);
				return true;
			};

			const before = independentlyExpected.size;
			add(kit.id, 'name', kit.name);
			add(kit.id, 'description', kit.description);
			metadataFields += independentlyExpected.size - before;

			kit.features.forEach(feature => {
				const start = independentlyExpected.size;
				if (feature.type === FeatureType.Ability) {
					const ability = feature.data.ability;
					add(ability.id, 'name', ability.name);
					add(ability.id, 'target', ability.target);
					add(ability.id, 'description', ability.description);
					add(ability.id, 'type.trigger', ability.type.trigger);
					(ability.sections || []).forEach((section, index) => {
						if (section.type === 'text') {
							add(ability.id, `sections.${index}.text`, section.text);
						}
						if (section.type === 'field') {
							add(ability.id, `sections.${index}.name`, section.name);
							add(ability.id, `sections.${index}.effect`, section.effect);
						}
						if (section.type === 'roll') {
							add(ability.id, `sections.${index}.roll.tier1`, section.roll.tier1);
							add(ability.id, `sections.${index}.roll.tier2`, section.roll.tier2);
							add(ability.id, `sections.${index}.roll.tier3`, section.roll.tier3);
						}
					});
					abilityFields += independentlyExpected.size - start;
					return;
				}
				add(feature.id, 'name', feature.name);
				add(feature.id, 'description', feature.description);
				nonAbilityFields += independentlyExpected.size - start;
			});
		});

		expect(v1StormwightKitIDs).toEqual([ 'kit-boren', 'kit-corven', 'kit-raden', 'kit-vuken' ]);
		expect(kits.map(kit => kit.id)).toEqual([ ...v1StormwightKitIDs ]);
		// The approved breakdown: 4 Kit pairs, 20 non-Ability Feature pairs, 4 signature Abilities.
		expect(metadataFields).toBe(8);
		expect(nonAbilityFields).toBe(40);
		expect(abilityFields).toBe(26);
		expect(independentlyExpected.size).toBe(74);

		expect(Object.keys(required).sort()).toEqual([ ...independentlyExpected ].sort());
		expect(Object.keys(required)).toHaveLength(74);

		expect(catalogEntries).toHaveLength(74);
		expect(new Set(catalogEntries.map(getEntryIdentity)).size).toBe(74);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		// Every identity is required in the live manifest with the same canonical English.
		expect(Object.keys(required).every(identity => v1LocalizationManifest.requiredCanonicalEnglish[identity] === required[identity])).toBe(true);
	});

	it('keeps the four Stormwight Kits disjoint from the frozen 181-identity standard Kit slice', () => {
		expect(Object.keys(standardKitRequired)).toHaveLength(181);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(standardKitRequired, identity))).toBe(false);
		v1StormwightKitIDs.forEach(id => expect(v1CoreStandardKitIDs).not.toContain(id));
	});

	it('records the whitespace-sensitive Growing Ferocity canonical readings exactly as authored', () => {
		// All four Growing Ferocity descriptions open with a single newline before their first
		// Markdown bullet. This is the packet's r1 clerical restoration, and the catalog keeps it.
		[ 'kit-boren-feature-4', 'kit-corven-feature-4', 'kit-raden-feature-4', 'kit-vuken-feature-4' ].forEach(id => {
			const identity = elementFieldIdentity(id, 'description');
			const entry = catalogEntries.find(candidate => getEntryIdentity(candidate) === identity);
			if (!entry) {
				throw new Error(`catalog entry '${identity}' is missing`);
			}
			expect(required[identity].startsWith('\n* **Ferocity 2**')).toBe(true);
			expect(entry.canonicalEnglish).toBe(required[identity]);
			expect(entry.zhTW.startsWith('* **狠勁 2**：')).toBe(true);
			expect(entry.zhTW).toContain('\n* **狠勁 12（10 級）**：');
			// The Owner workbook round-trip introduced zero-width spaces; none survive.
			expect(entry.zhTW).not.toMatch(/[\u200B-\u200D\uFEFF]/);
		});
	});

	it('carries the Owner-authorized corrections rather than the superseded readings', () => {
		const zhTW = (id: string, field: string) => {
			const identity = elementFieldIdentity(id, field);
			const entry = catalogEntries.find(candidate => getEntryIdentity(candidate) === identity);
			if (!entry) {
				throw new Error(`catalog entry '${identity}' is missing`);
			}
			return entry.zhTW;
		};

		// SW-08: Hybrid Form is 混合形態, not 巨熊形態.
		expect(zhTW('kit-boren-feature-2b', 'description')).toContain('當你處於混合形態時');
		expect(zhTW('kit-boren-feature-2b', 'description')).not.toContain('當你處於巨熊形態時');
		// SW-24 and SW-43: Hide is a free maneuver, not a free triggered action.
		expect(zhTW('kit-corven-feature-2a', 'description')).toContain('你可以使用免費機動動作來進行躲藏機動動作');
		expect(zhTW('kit-raden-feature-2a', 'description')).toContain('你可以使用免費機動動作來進行躲藏機動動作');
		// SW-43 also restores the Aspect of the Wild-only restriction.
		expect(zhTW('kit-raden-feature-2a', 'description')).toContain('除了【荒野相態】外，你在此形態無法發動任何招式。');
		// SW-30 and its linked SW-49: Ferocity 6 and 10 both name the Knockback maneuver.
		[ 'kit-corven-feature-4', 'kit-raden-feature-4' ].forEach(id => {
			expect(zhTW(id, 'description')).toContain('* **狠勁 6**：你的`敏捷`考驗、掙脫機動動作和擊退機動動作會獲得 1 個優勢。');
			expect(zhTW(id, 'description')).toContain('* **狠勁 10（7 級）**：你的`敏捷`考驗、掙脫機動動作和擊退機動動作會獲得雙優勢。');
		});
	});

	it('records the Kit type tag as a UI reading rather than a 75th element-field identity', () => {
		const entry = productionLocalizationEntries.find((candidate): candidate is UIStringEntry => (candidate.kind === 'ui') && (candidate.key === 'kit-type.stormwight'));
		if (!entry) {
			throw new Error('kit-type.stormwight UI entry is missing');
		}

		expect(entry.canonicalEnglish).toBe('Stormwight');
		expect(entry.zhTW).toBe('颶魂');
		expect(entry.approval).toBe('approved');
		// It is presentation support, so it is deliberately not part of the 74-identity slice.
		expect(Object.keys(required)).not.toContain(uiStringIdentity('kit-type.stormwight'));
		expect(v1LocalizationManifest.requiredCanonicalEnglish[uiStringIdentity('kit-type.stormwight')]).toBeUndefined();
	});

	it('keeps completeness healthy while unrelated domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([ 'class-and-subclass-level-content', 'official-ability-authored-content' ]));
		expect(result.complete).toBe(false);
	});

	it('records exactly the approved five-row glossary delta and leaves the Stormwight row alone', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^Boren,/.test(row))).toEqual([ 'Boren,巨熊,game-term,approved' ]);
		expect(rows.filter(row => /^Corven,/.test(row))).toEqual([ 'Corven,渡鴉,game-term,approved' ]);
		expect(rows.filter(row => /^Raden,/.test(row))).toEqual([ 'Raden,齧鼠,game-term,approved' ]);
		expect(rows.filter(row => /^Vuken,/.test(row))).toEqual([ 'Vuken,野狼,game-term,approved' ]);
		expect(rows.filter(row => /^Aspect Benefits,/.test(row))).toEqual([ 'Aspect Benefits,相態益處,game-term,approved' ]);
		// The pre-existing Stormwight authority this batch relies on is unchanged and unduplicated.
		expect(rows.filter(row => /^Stormwight,/.test(row))).toEqual([ 'Stormwight,颶魂,game-term,approved' ]);

		// Form names, animal nouns and storm labels stay context-bound readings.
		[ 'Animal Form', 'Hybrid Form', 'Bear', 'Crow', 'Rat', 'Wolf', 'Blizzard', 'Anabatic Wind', 'Rat Flood', 'Lightning Storm', 'Growing Ferocity' ].forEach(term => {
			expect(rows.some(row => row.startsWith(`${term},`))).toBe(false);
		});
	});
});

describe('Stormwight Kit panel presentation', () => {
	it.each([
		{ id: 'kit-boren', name: '巨熊', description: '透過這件颶魂套裝，你將原初狠勁轉化為巨熊形態，變得龐大、堅韌且令人畏懼。', canonicalName: 'Boren' },
		{ id: 'kit-corven', name: '渡鴉', description: '透過這件颶魂套裝，你將原初狠勁轉化為渡鴉形態，變得隱密且敏捷。', canonicalName: 'Corven' },
		{ id: 'kit-raden', name: '齧鼠', description: '透過這件颶魂套裝，你將原初狠勁轉化為齧鼠形態，變得靈活且難以捉摸。', canonicalName: 'Raden' },
		{ id: 'kit-vuken', name: '野狼', description: '透過這件颶魂套裝，你將原初狠勁轉化為野狼形態，成為腳步輕快的掠食者。', canonicalName: 'Vuken' }
	])('renders $canonicalName metadata and the 颶魂 type tag, then restores canonical English', ({ id, name, description, canonicalName }) => {
		const kit = getKit(id);
		const serialized = JSON.stringify(kit);
		const { container } = renderKit(kit, PanelMode.Full);

		expect(container.textContent).toContain(name);
		expect(container.textContent).toContain(description);
		expect(tagTexts(container)).toContain('颶魂');
		expect(tagTexts(container)).not.toContain('Stormwight');

		switchLocale();

		expect(container.textContent).toContain(canonicalName);
		expect(tagTexts(container)).toContain('Stormwight');
		expect(tagTexts(container)).not.toContain('颶魂');

		// Locale switching is display only: the canonical Kit, and its type, are untouched.
		expect(JSON.stringify(kit)).toBe(serialized);
		expect(kit.type).toBe('Stormwight');
	});

	it('keeps the compact header tag localized too', () => {
		const { container } = renderKit(getKit('kit-vuken'), PanelMode.Compact);

		expect(container.textContent).toContain('野狼');
		expect(tagTexts(container)).toContain('颶魂');
	});

	it('leaves a Kit type this project has no approved reading for as authored text', () => {
		// Homebrew and imported content must not be silently dropped or invented, so only the
		// exact approved value is mapped.
		const homebrew: Kit = { ...getKit('kit-boren'), id: 'kit-homebrew', type: 'Tempestwight' };
		const { container } = renderKit(homebrew, PanelMode.Compact);

		expect(tagTexts(container)).toContain('Tempestwight');
	});

	it('presents every direct non-Ability Feature of a Kit in zh-TW on the Features page', () => {
		const { container } = renderKit(getKit('kit-boren'), PanelMode.Full);

		clickPage(container, '特性');

		expect(container.textContent).toContain('相態益處');
		expect(container.textContent).toContain('每當你推動 1 個生物時，你可以改為拉動該生物。');
		expect(container.textContent).toContain('動物形態：巨熊');
		expect(container.textContent).toContain('當你處於巨熊形態時，你的體型為 2');
		expect(container.textContent).toContain('混合形態：巨熊');
		expect(container.textContent).toContain('原初風暴：暴雪');
		expect(container.textContent).toContain('你的原初傷害類型為寒冷。');
		expect(container.textContent).toContain('遞增狠勁');
		expect(container.textContent).toContain('你最多可以同時擒制 2 個生物。');
		expect(container.textContent).not.toContain('Aspect Benefits');
		expect(container.textContent).not.toContain('Growing Ferocity');
	});

	it('presents a signature Ability and its Power Roll tiers through the production Kit panel', () => {
		const { container } = renderKit(getKit('kit-raden'), PanelMode.Full);

		clickPage(container, '特性');

		expect(container.textContent).toContain('衝刺撲擊');
		expect(container.textContent).toContain('敵人試圖躲開你的猛撲，但徒勞無功。');
		expect(container.textContent).toContain('1 個生物或物體');
		expect(tierTexts(container)).toEqual([
			'2 + 敏捷傷害',
			'5 + 敏捷傷害；推動 1',
			'7 + 敏捷傷害；推動 2'
		]);
		expect(container.textContent).toContain('你可以遁移最多等於你推動目標相同的格數。');

		switchLocale();
		clickPage(container, 'Features');

		expect(container.textContent).toContain('Driving Pounce');
		expect(tierTexts(container)).toEqual([
			'2 + A damage',
			'5 + A damage; push 1',
			'7 + A damage; push 2'
		]);
	});
});

describe('Stormwight Kit calculated presentation', () => {
	it('keeps every approved unresolved expression on the no-Hero Library path', () => {
		expect(featureReading('kit-boren-feature-1')).toContain('若該生物的`力量` < [中]，');
		expect(featureReading('kit-boren-feature-4')).toContain('其效力都會獲得等於你`力量`的加值。');
		expect(featureReading('kit-corven-feature-4')).toContain('你可以遁移的距離會獲得等於你`敏捷`的加值。');
		expect(featureReading('kit-raden-feature-4')).toContain('你可以遁移的距離會獲得等於你`敏捷`的加值。');
		expect(featureReading('kit-vuken-feature-4')).toContain('強制移動的距離會獲得等於你`敏捷`的加值。');

		expect(tierReading('kit-boren', 1)).toBe('2 + `力量`傷害；`力量` < [弱]，**擒制**');
		expect(tierReading('kit-raden', 2)).toBe('5 + `敏捷`傷害；推動 1');
		expect(tierReading('kit-vuken', 3)).toBe('7 + `力量`傷害；`敏捷` < [強]，**伏地**');
	});

	it('projects the five Feature descriptions from the canonical calculator on the Hero path', () => {
		const hero = heroWithCharacteristics();

		// Boren Aspect Benefits: the potency threshold resolves to 2, grabbed gains emphasis,
		// and both sentences of the Owner prose survive.
		const borenBenefits = featureReading('kit-boren-feature-1', hero);
		expect(borenBenefits).toBe('每當你推動 1 個生物時，你可以改為拉動該生物。每當你將 1 個生物拉至與你相鄰時，若該生物的`力量` < 2，你可以使用免費反應動作讓該生物被你**擒制**。');

		// Boren Growing Ferocity: only the Ferocity 12 potency bonus changes.
		const borenFerocity = featureReading('kit-boren-feature-4', hero);
		expect(borenFerocity).toContain('其效力都會獲得 2 點加值。');
		expect(borenFerocity).not.toContain('等於你`力量`的加值');
		expect(borenFerocity).toContain('* **狠勁 2**：你最多可以同時擒制 2 個生物。');
		expect(borenFerocity).toContain('* **狠勁 10（7 級）**：你的擒抱和擊退機動動作會獲得雙優勢。');

		// Corven and Raden share the grammar; each resolves its own Ferocity 2 shift bonus to 3.
		[ 'kit-corven-feature-4', 'kit-raden-feature-4' ].forEach(id => {
			const reading = featureReading(id, hero);
			expect(reading).toContain('* **狠勁 2**：每當你使用撤離移動動作時，你可以遁移的距離會獲得 3 點加值。');
			expect(reading).not.toContain('等於你`敏捷`的加值');
			// The Owner-corrected Knockback references in Ferocity 6 and 10 are preserved.
			expect(reading).toContain('* **狠勁 6**：你的`敏捷`考驗、掙脫機動動作和擊退機動動作會獲得 1 個優勢。');
			expect(reading).toContain('* **狠勁 10（7 級）**：你的`敏捷`考驗、掙脫機動動作和擊退機動動作會獲得雙優勢。');
		});

		// Vuken Growing Ferocity: the Ferocity 12 forced movement bonus resolves to 3.
		const vukenFerocity = featureReading('kit-vuken-feature-4', hero);
		expect(vukenFerocity).toContain('強制移動的距離會獲得 3 點加值。');
		expect(vukenFerocity).toContain('* **狠勁 2**：每當你使用擊退機動動作時，你可以額外指定 1 個生物為目標。');
	});

	it('binds the Corven and Raden projections to their own identities', () => {
		const hero = heroWithCharacteristics();
		const canonicalEnglish = required[elementFieldIdentity('kit-corven-feature-4', 'description')];
		const calculatedEnglish = AbilityLogic.getTextEffect(canonicalEnglish, hero);

		// Corven's canonical content presented under an identity the slice never approved must
		// not pick up Corven's projection; the two Kits authorize only themselves.
		const underForeignIdentity = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'kit-vuken-feature-4',
			field: 'description',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		});

		expect(underForeignIdentity).toBe(calculatedEnglish);
		expect(underForeignIdentity).not.toMatch(/[一-鿿]/);
	});

	it('projects all nine dynamic signature tiers through the existing Power Roll presenter', () => {
		const hero = heroWithCharacteristics();

		// Might damage + Might potency + grabbed.
		expect(tierReading('kit-boren', 1, hero)).toBe('4 傷害；`力量` < 1，**擒制**');
		expect(tierReading('kit-boren', 2, hero)).toBe('7 傷害；`力量` < 2，**擒制**');
		expect(tierReading('kit-boren', 3, hero)).toBe('9 傷害；`力量` < 3，**擒制**');

		// Agility damage, with the push tail preserved on tiers 2 and 3.
		expect(tierReading('kit-raden', 1, hero)).toBe('5 傷害');
		expect(tierReading('kit-raden', 2, hero)).toBe('8 傷害；推動 1');
		expect(tierReading('kit-raden', 3, hero)).toBe('10 傷害；推動 2');

		// Might damage + Agility potency + prone.
		expect(tierReading('kit-vuken', 1, hero)).toBe('4 傷害；`敏捷` < 1，**伏地**');
		expect(tierReading('kit-vuken', 2, hero)).toBe('7 傷害；`敏捷` < 2，**伏地**');
		expect(tierReading('kit-vuken', 3, hero)).toBe('9 傷害；`敏捷` < 3，**伏地**');
	});

	it('leaves Corven’s flat-damage signature tiers untouched on both paths', () => {
		const hero = heroWithCharacteristics();

		// These three carry no characteristic, so the calculator resolves nothing and the
		// approved reading is what both surfaces show.
		expect(tierReading('kit-corven', 1)).toBe('1 傷害');
		expect(tierReading('kit-corven', 2, hero)).toBe('4 傷害');
		expect(tierReading('kit-corven', 3, hero)).toBe('6 傷害');
	});

	it('falls back to the whole calculated English when a projected family is structurally rewritten', () => {
		const expectWholeCalculatedEnglish = (elementID: string, rewrite: (canonical: string) => string) => {
			const canonicalEnglish = required[elementFieldIdentity(elementID, 'description')];
			const calculatedEnglish = rewrite(canonicalEnglish);
			expect(calculatedEnglish).not.toBe(canonicalEnglish);

			const presented = localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: elementID,
				field: 'description',
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			});

			expect(presented).toBe(calculatedEnglish);
			expect(presented).not.toMatch(/[一-鿿]/);
		};

		expectWholeCalculatedEnglish('kit-boren-feature-1', canonical => canonical.replace('that creature has M < [average], you can use a free triggered action', 'that creature is weak enough, you can immediately'));
		expectWholeCalculatedEnglish('kit-boren-feature-4', canonical => canonical.replace('gains a bonus to its potency equal to your Might score.', 'gains 2 extra potency.'));
		expectWholeCalculatedEnglish('kit-corven-feature-4', canonical => canonical.replace('the distance you can shift gains a bonus equal to your Agility score.', 'you can shift 3 extra squares.'));
		expectWholeCalculatedEnglish('kit-raden-feature-4', canonical => canonical.replace('the distance you can shift gains a bonus equal to your Agility score.', 'you can shift 3 extra squares.'));
		expectWholeCalculatedEnglish('kit-vuken-feature-4', canonical => canonical.replace('the forced movement distance gains a bonus equal to your Agility score.', 'the forced movement distance gains 3 extra squares.'));
	});

	it('keeps canonical English as the only calculation input and never writes to canonical state', () => {
		const hero = heroWithCharacteristics();
		const serializedHero = JSON.stringify(hero);
		const serializedKits = JSON.stringify(kits);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');

		kits.forEach(kit => {
			const { container } = renderKit(kit, PanelMode.Full, hero);
			clickPage(container, '特性');
		});

		expect(getTextEffect).toHaveBeenCalled();
		expect(getTierEffectCreature).toHaveBeenCalled();
		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(hero)).toBe(serializedHero);
		expect(JSON.stringify(kits)).toBe(serializedKits);
		expect(kits.every(kit => kit.type === 'Stormwight')).toBe(true);

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});

	it('renders the calculated Feature and tier readings through the real Kit panel with a Hero', () => {
		const hero = heroWithCharacteristics();
		const { container } = renderKit(getKit('kit-vuken'), PanelMode.Full, hero);

		clickPage(container, '特性');

		expect(tierTexts(container)).toEqual([
			'4 傷害；敏捷 < 1，伏地',
			'7 傷害；敏捷 < 2，伏地',
			'9 傷害；敏捷 < 3，伏地'
		]);
		expect(container.textContent).toContain('強制移動的距離會獲得 3 點加值。');
		expect(container.textContent).not.toContain('equal to your Agility score');
	});
});
