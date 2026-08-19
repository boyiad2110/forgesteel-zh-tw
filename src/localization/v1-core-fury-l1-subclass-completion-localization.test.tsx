// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { FeatureType } from '@/enums/feature-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { Ability } from '@/models/ability';
import { Feature } from '@/models/feature';
import { core } from '@/data/sourcebooks/official/core';
import { fury } from '@/data/classes/fury/fury';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1FuryLevel1AbilityRequiredCanonicalEnglish, createV1FuryLevel1RemainingRequiredCanonicalEnglish, createV1FuryLevel1SubclassCompletionRequiredCanonicalEnglish, getV1FurySubclasses, v1FurySubclassIDs, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { createClassPresentationHarness, createHeroWithClass, expectRendered, installResizeObserverStub, levelOneFeatures, readFieldByLabelPrefix, switchLocale } from '@/localization/test-support/localization-presentation-test-harness';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

installResizeObserverStub();

const subclasses = getV1FurySubclasses();
const required = createV1FuryLevel1SubclassCompletionRequiredCanonicalEnglish();
const existingBaseAbilityRequired = createV1FuryLevel1AbilityRequiredCanonicalEnglish();
const existingBaseRemainingRequired = createV1FuryLevel1RemainingRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined));

const { renderFeature, renderClassPanel, renderSubclass, renderAbility } = createClassPresentationHarness(fury, [ core ]);

/** A Fury Hero whose Might is 2 and Agility 3, so every projected value below is 2, 3 or 4. */
const makeHero = () => createHeroWithClass(fury, 1, FactoryLogic.createCharacteristics(2, 3, 0, 0, 0));

const getSubclass = (id: string) => {
	const subclass = subclasses.find(candidate => candidate.id === id);
	if (!subclass) {
		throw new Error(`Fury subclass '${id}' is missing`);
	}
	return subclass;
};

const getFeature = (subclassID: string, featureID: string): Feature => {
	const feature = levelOneFeatures(getSubclass(subclassID)).find(candidate => candidate.id === featureID);
	if (!feature) {
		throw new Error(`Fury Feature '${featureID}' is missing`);
	}
	return feature;
};

/** Reaches an Aspect's Level 1 Ability through the same bounded descent the slice uses. */
const getAbility = (id: string): Ability => {
	const search = (features: Feature[]): Ability | undefined => {
		for (const feature of features) {
			if (feature.type === FeatureType.Ability) {
				if (feature.data.ability.id === id) {
					return feature.data.ability;
				}
				continue;
			}
			if (feature.type === FeatureType.Multiple) {
				const found = search(feature.data.features);
				if (found) {
					return found;
				}
			}
			if (feature.type === FeatureType.Choice) {
				const found = search(feature.data.options.map(option => option.feature));
				if (found) {
					return found;
				}
			}
		}
		return undefined;
	};

	for (const subclass of subclasses) {
		const ability = search(levelOneFeatures(subclass));
		if (ability) {
			return ability;
		}
	}
	throw new Error(`Fury subclass Ability '${id}' is missing`);
};

/** The three Owner-approved Primordial Aspect names and their own descriptions. */
const subclassMetadata = [
	{
		id: 'fury-sub-1',
		name: '狂戰',
		description: '你將狠勁注入身體之中，化身為塑造世界的活體原始之力。',
		canonicalName: 'Berserker',
		canonicalDescription: 'You channel your rage into expressions of physical might, acting as a living version of the forces that reshape the world.'
	},
	{
		id: 'fury-sub-2',
		name: '狡獵',
		description: '你將狠勁轉化為直覺與狡黠，挑戰文明的虛假秩序。',
		canonicalName: 'Reaver',
		canonicalDescription: 'You channel your rage into instinct and cunning, challenging the false order of civilization.'
	},
	{
		id: 'fury-sub-3',
		name: '颶魂',
		description: '你將狠勁注入動物形態與原初風暴之中。',
		canonicalName: 'Stormwight',
		canonicalDescription: 'You channel your rage into the form of animals and primordial storms.'
	}
];

afterEach(cleanup);

describe('V1 Core Fury Level 1 subclass completion catalog and presentation', () => {
	it('adds the exact bounded 49-identity manifest and catalog slice without overlapping either frozen base slice', () => {
		// Expected identities come from an independent extraction: the bounded non-Ability walk in
		// test-support plus each Aspect's own metadata and the Ability fields read straight off the
		// live canonical Ability models. Nothing here calls the production completion builder.
		const independentlyExpected = new Set<string>([ elementFieldIdentity(fury.id, 'subclassName') ]);
		subclasses.forEach(subclass => {
			independentlyExpected.add(elementFieldIdentity(subclass.id, 'name'));
			if (subclass.description !== '') {
				independentlyExpected.add(elementFieldIdentity(subclass.id, 'description'));
			}
			Object.keys(extractLiveBoundedNonAbilityFeatureFields(levelOneFeatures(subclass))).forEach(identity => independentlyExpected.add(identity));
		});
		[ 'fury-sub-1-1-4', 'fury-sub-2-1-4', 'fury-sub-3-1-4', 'fury-sub-3-1-5' ].forEach(abilityID => {
			const ability = getAbility(abilityID);
			const add = (field: string, value: string) => {
				if (value !== '') {
					independentlyExpected.add(elementFieldIdentity(ability.id, field));
				}
			};
			add('name', ability.name);
			add('target', ability.target);
			add('description', ability.description);
			add('type.trigger', ability.type.trigger);
			(ability.sections || []).forEach((section, index) => {
				if (section.type === 'text') {
					add(`sections.${index}.text`, section.text);
				}
				if (section.type === 'field') {
					add(`sections.${index}.name`, section.name);
					add(`sections.${index}.effect`, section.effect);
				}
			});
		});

		expect(v1FurySubclassIDs).toEqual([ 'fury-sub-1', 'fury-sub-2', 'fury-sub-3' ]);
		expect(independentlyExpected.size).toBe(49);
		expect(Object.keys(required).sort()).toEqual([ ...independentlyExpected ].sort());
		expect(Object.keys(required)).toHaveLength(49);

		expect(catalogEntries).toHaveLength(49);
		expect(new Set(catalogEntries.map(getEntryIdentity)).size).toBe(49);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(catalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		// Both frozen Fury base slices keep their own identities, and neither overlaps.
		expect(Object.keys(existingBaseAbilityRequired)).toHaveLength(80);
		expect(Object.keys(existingBaseRemainingRequired)).toHaveLength(15);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingBaseAbilityRequired, identity))).toBe(false);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingBaseRemainingRequired, identity))).toBe(false);

		// Every identity is required in the live manifest with the same canonical English.
		expect(Object.keys(required).every(identity => v1LocalizationManifest.requiredCanonicalEnglish[identity] === required[identity])).toBe(true);
	});

	it('leaves Level 2+ Aspect content and every Stormwight Kit outside the slice', () => {
		// The four Stormwight kits and their nested features are a separate adjacent batch. They
		// are Level 2 content, so the Level 1 bound excludes them without a class-specific rule.
		[ 'fury-sub-1-2-1', 'fury-sub-2-2-1', 'fury-sub-3-2-1', 'fury-sub-3-2-2', 'fury-sub-3-2-2a', 'fury-sub-3-2-2b' ].forEach(id => {
			expect(required[elementFieldIdentity(id, 'name')]).toBeUndefined();
			expect(required[elementFieldIdentity(id, 'description')]).toBeUndefined();
		});
		expect(Object.keys(required).some(identity => /boren|corven|raden|vuken/i.test(identity))).toBe(false);

		// Stormwight's own Level 1 Beast Shape kit choice contributes its name and nothing else.
		expect(required[elementFieldIdentity('fury-sub-3-1-2', 'name')]).toBe('Beast Shape');
		expect(required[elementFieldIdentity('fury-sub-3-1-2', 'description')]).toBeUndefined();
	});

	it('records the whitespace-sensitive canonical readings exactly as authored', () => {
		// Primordial Strength and Primordial Cunning each open with a single leading newline the
		// catalog must snapshot verbatim rather than trim. This is the r1 -> r2 clerical fix.
		const strength = required[elementFieldIdentity('fury-sub-1-1-3', 'description')];
		const cunning = required[elementFieldIdentity('fury-sub-2-1-3', 'description')];
		expect(strength.startsWith('\nWhenever you damage an object')).toBe(true);
		expect(cunning.startsWith('\nYou are never surprised.')).toBe(true);

		const entryFor = (identity: string) => {
			const entry = catalogEntries.find(candidate => getEntryIdentity(candidate) === identity);
			if (!entry) {
				throw new Error(`catalog entry '${identity}' is missing`);
			}
			return entry;
		};
		expect(entryFor(elementFieldIdentity('fury-sub-1-1-3', 'description')).canonicalEnglish).toBe(strength);
		expect(entryFor(elementFieldIdentity('fury-sub-2-1-3', 'description')).canonicalEnglish).toBe(cunning);
		// The approved zh-TW keeps its own blank-line paragraph and Markdown bullet structure.
		expect(entryFor(elementFieldIdentity('fury-sub-1-1-3', 'description')).zhTW).toContain('\n\n* **狠勁 2**：');
		expect(entryFor(elementFieldIdentity('fury-sub-2-1-3', 'description')).zhTW).toContain('\n\n* **狠勁 2**：');
		expect(entryFor(elementFieldIdentity('fury-sub-2-1-3', 'description')).zhTW).toContain('\n* **狠勁 6**：');
	});

	it('keeps completeness healthy while the parent class domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toEqual(expect.arrayContaining([ 'class-and-subclass-level-content', 'official-ability-authored-content' ]));
		expect(result.complete).toBe(false);
	});

	it('records exactly the approved four-term glossary delta and promotes no prose-only form reading', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');

		expect(rows.filter(row => /^Primordial Aspect,/.test(row))).toEqual([ 'Primordial Aspect,原初相態,game-term,approved' ]);
		expect(rows.filter(row => /^Berserker,/.test(row))).toEqual([ 'Berserker,狂戰,game-term,approved' ]);
		expect(rows.filter(row => /^Reaver,/.test(row))).toEqual([ 'Reaver,狡獵,game-term,approved' ]);
		expect(rows.filter(row => /^Stormwight,/.test(row))).toEqual([ 'Stormwight,颶魂,game-term,approved' ]);

		// The animal/hybrid/true form readings stay context-bound prose inside the approved
		// snapshots, not global mappings, so none of them is promoted here.
		[ 'animal form', 'hybrid form', 'true form' ].forEach(term => {
			expect(rows.some(row => row.toLowerCase().startsWith(`${term},`))).toBe(false);
		});
		expect(rows.some(row => /,(動物形態|混合形態|真身),/.test(row))).toBe(false);
	});

	it('renders the Primordial Aspect category and all three Aspect names, then restores canonical English', () => {
		const serialized = JSON.stringify(fury);
		const { container } = renderClassPanel();

		expect(readFieldByLabelPrefix(container, '原初相態')).toBe('狂戰, 狡獵, 颶魂');
		subclassMetadata.forEach(subclass => expectRendered(container, subclass.name));

		switchLocale();

		expect(readFieldByLabelPrefix(container, 'Primordial Aspect')).toBe('Berserker, Reaver, Stormwight');
		expect(JSON.stringify(fury)).toBe(serialized);
	});

	it.each(subclassMetadata)('renders $canonicalName metadata through SubclassPanel and restores canonical English', ({ id, name, description, canonicalName, canonicalDescription }) => {
		const subclass = getSubclass(id);
		const serialized = JSON.stringify(subclass);
		const { container } = renderSubclass(subclass);

		expectRendered(container, name);
		expectRendered(container, description);

		switchLocale();

		expectRendered(container, canonicalName);
		expectRendered(container, canonicalDescription);
		expect(JSON.stringify(subclass)).toBe(serialized);
	});

	it('renders each Aspect’s Level 1 non-Ability features through the shared bounded walk', () => {
		const berserkerSkill = renderFeature(getFeature('fury-sub-1', 'fury-sub-1-1-1'));
		expectRendered(berserkerSkill.container, '技能');
		expectRendered(berserkerSkill.container, '從任意列表中選擇 1 項技能。');
		berserkerSkill.unmount();

		const berserkerKit = renderFeature(getFeature('fury-sub-1', 'fury-sub-1-1-2'));
		expectRendered(berserkerKit.container, '套裝');
		berserkerKit.unmount();

		const beastShape = renderFeature(getFeature('fury-sub-3', 'fury-sub-3-1-2'));
		expectRendered(beastShape.container, '野獸形態');
		beastShape.unmount();

		const relentlessHunter = renderFeature(getFeature('fury-sub-3', 'fury-sub-3-1-3'));
		expectRendered(relentlessHunter.container, '無情獵人');
		expectRendered(relentlessHunter.container, '當你使用追蹤技能進行考驗時，你獲得 1 個優勢。');
	});

	it('renders the authored Ability fields each Aspect’s Level 1 abilities carry', () => {
		// A Trigger ability with a 'Self or one creature' target and a Spend name/effect pair.
		const linesOfForce = renderAbility(getAbility('fury-sub-1-1-4'));
		expectRendered(linesOfForce.container, '導力流轉');
		expectRendered(linesOfForce.container, '自身或 1 個生物');
		expectRendered(linesOfForce.container, '你重新引導動能的流動。');
		expectRendered(linesOfForce.container, '當目標即將被強制移動時。');
		expectRendered(linesOfForce.container, '花費');
		linesOfForce.unmount();

		// The Reaver Spend effect carries the Reviewer's punctuation-only F-29 correction.
		const unearthlyReflexes = renderAbility(getAbility('fury-sub-2-1-4'));
		expectRendered(unearthlyReflexes.container, '超群反應');
		expectRendered(unearthlyReflexes.container, '你如蜂鳥般難以捉摸。');
		expectRendered(unearthlyReflexes.container, '當你受到傷害時。');
		expectRendered(unearthlyReflexes.container, '若觸發的傷害具有任何效力效果，該效力會減少 1 點。');
		unearthlyReflexes.unmount();

		const furiousChange = renderAbility(getAbility('fury-sub-3-1-4'));
		expectRendered(furiousChange.container, '狂怒化形');
		expectRendered(furiousChange.container, '你在憤怒中化為野獸的形態。');
		expectRendered(furiousChange.container, '當你失去體力而未處於瀕死時。');
		expectRendered(furiousChange.container, '若你未處於瀕死，你可以花費 1 點復元力。');
		furiousChange.unmount();

		// Aspect of the Wild carries no calculated reading, so both surfaces show approved zh-TW.
		const aspectOfTheWild = renderAbility(getAbility('fury-sub-3-1-5'), makeHero());
		expectRendered(aspectOfTheWild.container, '荒野相態');
		expectRendered(aspectOfTheWild.container, '你引導狠勁化身為動物的形態。');
		expectRendered(aspectOfTheWild.container, '你可以變形為你颶魂套裝定義的動物形態、混合形態，或變回真身。');
		expectRendered(aspectOfTheWild.container, '你的聲望會視為比平常高 2 點。');
		expectRendered(aspectOfTheWild.container, '你可以使用免費機動動作再次變形');
		expect(aspectOfTheWild.container.textContent).not.toContain('You can shapeshift into the animal');
	});

	it('projects all three of Primordial Strength’s Might readings through the FeaturePanel path, and keeps the approved raw wording without a Hero', () => {
		const primordialStrength = getFeature('fury-sub-1', 'fury-sub-1-1-3');
		const rawFirstDamage = '你會額外造成等於你力量的傷害。';
		const rawSecondDamage = '該生物會額外受到等於你力量的傷害。';
		const rawBonus = '強制移動的距離會獲得等於你力量的加值。';

		const noHero = renderFeature(primordialStrength);
		expectRendered(noHero.container, '原初蠻力');
		expectRendered(noHero.container, rawFirstDamage);
		expectRendered(noHero.container, rawSecondDamage);
		expectRendered(noHero.container, rawBonus);
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toContain('力量');
		expect(noHero.container.textContent).not.toContain('Might score');
		noHero.unmount();

		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderFeature(primordialStrength, hero);

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Primordial Strength Feature', capture: () => JSON.stringify(primordialStrength) }),
				protectCanonicalState({ label: 'Fury Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				const text = withHero.container.textContent || '';
				// Exactly the two extra-damage readings and the one Knockback bonus reading.
				expect(text.split('你會額外造成 2 點傷害。').length - 1).toBe(1);
				expect(text.split('該生物會額外受到 2 點傷害。').length - 1).toBe(1);
				expect(text.split('強制移動的距離會獲得 2 點加值。').length - 1).toBe(1);
				expect(text).not.toContain('等於你力量');
				// Every remaining approved reading survives the projection untouched.
				expectRendered(withHero.container, '隨著你累積狠勁，你會獲得「狂戰遞增狠勁」表格中所列的各種益處。');
				expectRendered(withHero.container, '當你在 1 個回合中首次推動 1 個生物時，你獲得 1 點鬥志。');
				expectRendered(withHero.container, '你的力量考驗和擊退機動動作會獲得 1 個優勢。');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'the strike deals extra damage equal to 2.');
				expectRendered(withHero.container, 'the creature takes extra damage equal to 2.');
				expectRendered(withHero.container, 'the forced movement distance gains a bonus equal to 2.');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => {
				expectRendered(withHero.container, '你會額外造成 2 點傷害。');
				expectRendered(withHero.container, '強制移動的距離會獲得 2 點加值。');
			}
		});

		expect(getTextEffect).toHaveBeenCalled();
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('projects Primordial Cunning’s Agility Knockback bonus through the FeaturePanel path, and keeps the approved raw wording without a Hero', () => {
		const primordialCunning = getFeature('fury-sub-2', 'fury-sub-2-1-3');
		const raw = '強制移動的距離會獲得等於你敏捷的加值。';
		const heroText = '強制移動的距離會獲得 3 點加值。';

		const noHero = renderFeature(primordialCunning);
		expectRendered(noHero.container, '原初狡黠');
		expectRendered(noHero.container, raw);
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toContain('敏捷');
		expect(noHero.container.textContent).not.toContain('Agility score');
		noHero.unmount();

		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderFeature(primordialCunning, hero);

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Primordial Cunning Feature', capture: () => JSON.stringify(primordialCunning) }),
				protectCanonicalState({ label: 'Fury Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				expectRendered(withHero.container, heroText);
				expect(withHero.container.textContent).not.toContain('等於你敏捷的加值');
				// The surrounding table prose and Markdown are preserved.
				expectRendered(withHero.container, '你永遠不會措手不及。');
				expectRendered(withHero.container, '隨著你累積狠勁，你會獲得「狡獵遞增狠勁」表格中所列的各種益處。');
				expectRendered(withHero.container, '你的敏捷考驗和擊退機動動作會獲得 1 個優勢。');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'the forced movement distance gains a bonus equal to 3.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroText)
		});

		expect(getTextEffect).toHaveBeenCalled();
		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('projects Lines of Force’s twice-Might Spend bonus from the canonical calculator, never doubling on the zh-TW side', () => {
		const linesOfForce = getAbility('fury-sub-1-1-4');
		const rawSpend = '強制移動的距離改為獲得等於你力量 ×2 的加值。';
		const heroSpend = '強制移動的距離改為獲得 4 點加值。';

		const noHero = renderAbility(linesOfForce);
		expectRendered(noHero.container, rawSpend);
		expect(noHero.container.textContent).not.toContain('twice your Might score');
		noHero.unmount();

		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderAbility(linesOfForce, hero);

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Lines of Force Ability', capture: () => JSON.stringify(linesOfForce) }),
				protectCanonicalState({ label: 'Fury Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				expectRendered(withHero.container, heroSpend);
				expect(withHero.container.textContent).not.toContain('×2');
			},
			// The canonical calculator is what resolves twice-Might to 4; the projection only
			// carries that one already-verified English number into the approved zh-TW.
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'The forced movement distance gains a bonus equal to 4 instead.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroSpend)
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('projects Unearthly Reflexes’ Agility shift distance while preserving the rest of the approved sentence', () => {
		const unearthlyReflexes = getAbility('fury-sub-2-1-4');
		const raw = '你受到的觸發傷害減半，而且可以遁移最多等於你敏捷的格數。';
		const heroText = '你受到的觸發傷害減半，而且可以遁移最多 3 格。';

		const noHero = renderAbility(unearthlyReflexes);
		expectRendered(noHero.container, raw);
		expect(noHero.container.textContent).not.toContain('Agility score');
		noHero.unmount();

		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderAbility(unearthlyReflexes, hero);

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Unearthly Reflexes Ability', capture: () => JSON.stringify(unearthlyReflexes) }),
				protectCanonicalState({ label: 'Fury Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				expectRendered(withHero.container, heroText);
				expect(withHero.container.textContent).not.toContain('等於你敏捷的格數');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'You take half the damage from the triggering effect and can shift up to a number of squares equal to 3.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroText)
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	it('projects Furious Change’s temporary Stamina while preserving the animal and hybrid form clause', () => {
		const furiousChange = getAbility('fury-sub-3-1-4');
		const raw = '你獲得等於你力量的臨時體力，而且你可以變成動物形態或混合形態。';
		const heroText = '你獲得 2 點臨時體力，而且你可以變成動物形態或混合形態。';

		const noHero = renderAbility(furiousChange);
		expectRendered(noHero.container, raw);
		expect(noHero.container.textContent).not.toContain('temporary Stamina equal to');
		noHero.unmount();

		const hero = makeHero();
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderAbility(furiousChange, hero);

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Furious Change Ability', capture: () => JSON.stringify(furiousChange) }),
				protectCanonicalState({ label: 'Fury Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => {
				expectRendered(withHero.container, heroText);
				expect(withHero.container.textContent).not.toContain('等於你力量的臨時體力');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, 'You gain temporary Stamina equal to 2 and can enter your animal form or hybrid form.'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroText)
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		getTextEffect.mockRestore();
	});

	/**
	 * OPEN BLOCKER, reported to the Reviewer rather than worked around.
	 *
	 * The r2 packet requires `element:fury-sub-1-1-4/sections.0.text` to project
	 * `強制移動的距離會獲得 N 點加值。`, but the Owner-final F-13 zh-TW is a single sentence
	 * that carries no forced-movement bonus clause at all - the Reviewer's own three-sentence
	 * suggestion did, and the override dropped it along with two other canonical sentences.
	 *
	 * There is therefore nothing to project into, and authoring the missing Chinese here would
	 * be inventing Owner text. The reading stays on the shared fail-closed path instead. This
	 * test pins that actual behaviour - whole calculated English, never mixed language - so the
	 * gap is visible and cannot regress silently while the decision is outstanding.
	 */
	it('fails closed to whole calculated English for the Lines of Force effect the approved zh-TW cannot express', () => {
		const canonicalEnglish = required[elementFieldIdentity('fury-sub-1-1-4', 'sections.0.text')];
		const calculatedEnglish = canonicalEnglish.replace('equal to your Might score.', 'equal to 2.');
		expect(calculatedEnglish).not.toBe(canonicalEnglish);

		const presented = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'fury-sub-1-1-4',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: calculatedEnglish
		});

		expect(presented).toBe(calculatedEnglish);
		expect(presented).not.toMatch(/[一-鿿]/);
	});

	it('falls back to the whole calculated English when any implemented grammar family is structurally rewritten', () => {
		const expectWholeCalculatedEnglish = (elementID: string, field: string, rewrite: (canonical: string) => string) => {
			const canonicalEnglish = required[elementFieldIdentity(elementID, field)];
			const calculatedEnglish = rewrite(canonicalEnglish);
			expect(calculatedEnglish).not.toBe(canonicalEnglish);

			const presented = localizeCalculatedAuthoredTextPresentation({
				locale: 'zh-TW',
				elementID: elementID,
				field: field,
				canonicalEnglish: canonicalEnglish,
				calculatedEnglish: calculatedEnglish
			});

			expect(presented).toBe(calculatedEnglish);
			expect(presented).not.toMatch(/[一-鿿]/);
		};

		// Berserker's three-substitution Feature family: a rewrite of any one clause fails the
		// whole projection rather than emitting a partly projected mixed-language reading.
		expectWholeCalculatedEnglish('fury-sub-1-1-3', 'description', canonical => canonical.replace('the strike deals extra damage equal to your Might score.', 'the strike deals 2 extra damage.'));
		expectWholeCalculatedEnglish('fury-sub-1-1-3', 'description', canonical => canonical.replace('the forced movement distance gains a bonus equal to your Might score.', 'the forced movement distance gains 2 extra squares.'));

		// Reaver's Agility Feature family.
		expectWholeCalculatedEnglish('fury-sub-2-1-3', 'description', canonical => canonical.replace('the forced movement distance gains a bonus equal to your Agility score.', 'the forced movement distance gains 3 extra squares.'));

		// Berserker's twice-Might Spend family.
		expectWholeCalculatedEnglish('fury-sub-1-1-4', 'sections.1.effect', canonical => canonical.replace('gains a bonus equal to twice your Might score instead.', 'gains 4 extra squares instead.'));

		// Reaver's shift-distance family.
		expectWholeCalculatedEnglish('fury-sub-2-1-4', 'sections.0.text', canonical => canonical.replace('can shift up to a number of squares equal to your Agility score.', 'can shift up to 3 squares.'));

		// Stormwight's temporary Stamina family.
		expectWholeCalculatedEnglish('fury-sub-3-1-4', 'sections.0.text', canonical => canonical.replace('You gain temporary Stamina equal to your Might score', 'You gain 2 temporary Stamina'));
	});

	it('keeps canonical English as the only calculation input across the whole completion slice', () => {
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');
		const getTierEffectCreature = vi.spyOn(AbilityLogic, 'getTierEffectCreature');
		const hero = makeHero();
		const serializedHero = JSON.stringify(hero);
		const serializedClass = JSON.stringify(fury);

		subclasses.forEach(subclass => renderSubclass(subclass).unmount());
		renderClassPanel(hero).unmount();

		[ ...getTextEffect.mock.calls, ...getTierEffectCreature.mock.calls ].forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(hero)).toBe(serializedHero);
		expect(JSON.stringify(fury)).toBe(serializedClass);

		getTextEffect.mockRestore();
		getTierEffectCreature.mockRestore();
	});
});
