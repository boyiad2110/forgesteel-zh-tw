// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AbilityLogic } from '@/logic/ability-logic';
import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { ClassPanel } from '@/components/panels/elements/class-panel/class-panel';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { SubclassPanel } from '@/components/panels/elements/subclass-panel/subclass-panel';
import { FeatureType } from '@/enums/feature-type';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { PanelMode } from '@/enums/panel-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { Ability } from '@/models/ability';
import { Hero } from '@/models/hero';
import { Feature } from '@/models/feature';
import { SubClass } from '@/models/subclass';
import { core } from '@/data/sourcebooks/official/core';
import { shadow } from '@/data/classes/shadow/shadow';
import { ElementFieldEntry, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1ShadowLevel1AbilityRequiredCanonicalEnglish, createV1ShadowLevel1CompletionRequiredCanonicalEnglish, getV1ShadowColleges, v1LocalizationManifest, v1ShadowCollegeIDs } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { elementFieldIdentity } from '@/localization/catalog';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

const levelOneFeatures = (owner: { featuresByLevel: { level: number, features: Feature[] }[] }) => owner.featuresByLevel.find(level => level.level === 1)?.features || [];
const shadowLevelOne = levelOneFeatures(shadow);
const colleges = getV1ShadowColleges();
const required = createV1ShadowLevel1CompletionRequiredCanonicalEnglish();
const existingAbilityRequired = createV1ShadowLevel1AbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => entry.kind === 'element-field' && (required[getEntryIdentity(entry)] !== undefined));

const getFeature = (features: Feature[], id: string) => {
	const feature = features.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Shadow Feature '${id}' is missing`);
	}
	return feature;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...shadow, level: 1, characteristics: FactoryLogic.createCharacteristics(0, 2, 0, 0, 0) };
	return hero;
};

const renderFeature = (feature: Feature, hero?: Hero) => render(createElement(LocalizationProvider, null,
	createElement(LocaleToggle), createElement(FeaturePanel, { feature, hero, mode: PanelMode.Full, sourcebooks: [ core ] })
));
const renderClassPanel = () => render(createElement(LocalizationProvider, null,
	createElement(LocaleToggle), createElement(ClassPanel, { heroClass: shadow, sourcebooks: [ core ], mode: PanelMode.Full })
));
const renderSubclass = (subclass: SubClass) => render(createElement(LocalizationProvider, null,
	createElement(LocaleToggle), createElement(SubclassPanel, { subclass, sourcebooks: [ core ], mode: PanelMode.Full })
));
const renderAbility = (ability: Ability, hero?: Hero) => render(createElement(LocalizationProvider, null,
	createElement(LocaleToggle), createElement(AbilityPanel, { ability, hero, mode: PanelMode.Full })
));
const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));
const fieldReading = (container: HTMLElement, label: string) => {
	const field = Array.from(container.querySelectorAll('.field')).find(node => node.querySelector('.field-label')?.textContent?.trim().startsWith(label));
	return field?.querySelector('.field-value')?.textContent?.trim();
};
const normalizedText = (container: HTMLElement) => container.textContent?.replace(/\s+/g, ' ').trim() || '';
const expectRendered = (container: HTMLElement, expected: string) => expect(normalizedText(container)).toContain(expected.replace(/\s+/g, ' ').trim());

const getCollegeAbility = (id: string): Ability => {
	for (const college of colleges) {
		const feature = levelOneFeatures(college).find(candidate => candidate.type === FeatureType.Ability && candidate.data.ability.id === id);
		if (feature?.type === FeatureType.Ability) {
			return feature.data.ability;
		}
	}
	throw new Error(`Shadow College Ability '${id}' is missing`);
};

const collegeMetadata = [
	{
		id: 'shadow-sub-1',
		name: '黑燼學院',
		description: '黑燼學院是影舞藝術的創始者，其畢業生在機動性方面無人能及，能夠運用法術在戰場上瞬間移動、操縱陰影，以及創造黑暗。',
		canonicalName: 'College of Black Ash',
		canonicalDescription: 'The College of Black Ash founded the art of being a shadow. Its graduates use Black Ash sorcery to teleport around the battlefield in clouds of soot, and to manipulate and create darkness. Graduates of the college are unmatched in mobility.'
	},
	{
		id: 'shadow-sub-2',
		name: '蝕鍊學院',
		description: '蝕鍊學院教導學生製作酸液、炸彈和毒藥的配方，用於執行殘忍的任務。該學院培養出的畢業生都是卓越的刺客。',
		canonicalName: 'College of Caustic Alchemy',
		canonicalDescription: 'The College of Caustic Alchemy teaches its students recipes for the acids, bombs, and poisons used in their grim work. Graduates of the college are exceptional assassins.'
	},
	{
		id: 'shadow-sub-3',
		name: '丑面學院',
		description: '丑面學院的畢業生精通幻術魔法，擅長運用這類法術滲透敵方據點，並在戰鬥中有條理地製造混亂。',
		canonicalName: 'College of the Harlequin Mask',
		canonicalDescription: 'Graduates of the College of the Harlequin Mask learn illusion magic, which they use to infiltrate enemy strongholds and create orchestrated chaos in combat.'
	}
] as const;

type CollegeAbilityReading = {
	id: string;
	name: string;
	description: string;
	trigger?: string;
	section: string;
	spend?: string;
	canonicalName: string;
};

const collegeAbilityReadings: CollegeAbilityReading[] = [
	{
		id: 'shadow-sub-1-1-2',
		name: '黑燼瞬移',
		description: '你在一陣黑燼漩渦中瞬間踏至另一處。',
		section: '你傳送最多 5 格。若你在終點具有遮蔽或掩護，即使你被觀察到也能使用躲藏機動動作。若你使用此機動動作成功躲藏，你會獲得 1 點鬥志。',
		spend: '每花費 1 點洞察，你可以額外傳送 1 格。',
		canonicalName: 'Black Ash Teleport'
	},
	{
		id: 'shadow-sub-1-1-3',
		name: '趁亂閃現',
		description: '你化作一縷黑煙消失無蹤，避開危險。',
		trigger: '當你受到傷害時。',
		section: '你受到的傷害減半，然後在觸發效果結算後，你可以傳送最多 4 格。',
		spend: '每花費 1 點洞察，你可以額外傳送 1 格。',
		canonicalName: 'In All This Confusion'
	},
	{
		id: 'shadow-sub-2-1-2',
		name: '塗毒',
		description: '少量毒素足以致命。',
		section: '你獲得 2 點鬥志。此外，在本遭遇結束前，每當你花費鬥志時，你可以選擇讓額外傷害造成劇毒傷害。',
		spend: '每花費 1 點洞察，你額外獲得 1 點鬥志。',
		canonicalName: 'Coat The Blade'
	},
	{
		id: 'shadow-sub-2-1-4',
		name: '防禦翻滾',
		description: '當敵人攻擊時，你順勢翻滾來減輕傷害。',
		trigger: '當其他生物對你造成傷害時。',
		section: '你受到的傷害減半，然後在觸發效果結算後，你可以遁移最多 2 格。若你在此遁移結束時具有遮蔽或掩護，即使你被觀察到也能使用躲藏機動動作。',
		spend: '與該傷害相關的任何效果效力會對你減少 1 點。',
		canonicalName: 'Defensive Roll'
	},
	{
		id: 'shadow-sub-3-1-2',
		name: '我毫無威脅',
		description: '幻化成無害的外表能讓你在施展詭計時占據優勢。',
		section: '你將自己包覆在一道幻象中，讓你在敵人眼中顯得毫無威脅。你可以化身為與你體型相同的無害動物（例如綿羊或水豚），或是讓自己看起來較不英勇且手無寸鐵。只要幻象尚未解除，你的打擊會獲得 1 個優勢，而且當你執行撤離移動動作時，你的遁移距離會獲得 +1 加值。\n\n若你傷害其他生物、與其他生物進行物理互動、再次發動此招式，或主動解除此幻象（無需動作），幻象就會解除。若你因為傷害生物而解除幻象，你會獲得 1 點鬥志。',
		spend: '選擇 1 個體型最多比你大 1 級且位於 10 格內的生物。此招式的幻象會讓你的外觀變得跟該生物相同。此幻象會完全包覆你的全身，包括衣物與護甲，並讓你的聲音聽起來就像該生物一樣。當你嘗試說服該生物的盟友相信你就是本人時，你獲得 1 個優勢。',
		canonicalName: 'I’m No Threat'
	},
	{
		id: 'shadow-sub-3-1-3',
		name: '巧妙伎倆',
		description: '你在戰鬥中製造短暫的混亂，讓敵人陷入危險之中。',
		trigger: '當敵人指定你為打擊目標時。',
		section: '選擇 1 個位於觸發打擊射程內的敵人（也可以選擇攻擊者）。他會變成這次打擊的目標。',
		canonicalName: 'Clever Trick'
	}
];

afterEach(cleanup);

describe('V1 Core Shadow Level 1 completion catalog and presentation', () => {
	it('adds the exact bounded 66-identity manifest and catalog slice without overlapping the approved base Ability slice', () => {
		const independentlyWalkedBase = extractLiveBoundedNonAbilityFeatureFields(shadowLevelOne);
		const insight = getFeature(shadowLevelOne, 'shadow-resource');
		if (insight.type !== FeatureType.HeroicResource) {
			throw new Error('Insight is not a Heroic Resource');
		}
		expect(v1ShadowCollegeIDs).toEqual([ 'shadow-sub-1', 'shadow-sub-2', 'shadow-sub-3' ]);
		expect(Object.keys(required)).toHaveLength(66);
		expect(Object.keys(catalogEntries)).toHaveLength(66);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved' && entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);
		expect(required[elementFieldIdentity('shadow-resource', 'details')]).toBe(insight.data.details);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingAbilityRequired, identity))).toBe(false);
		expect(Object.keys(independentlyWalkedBase).every(identity => required[identity] === independentlyWalkedBase[identity])).toBe(true);
		expect(Object.keys(required).some(identity => /shadow-(?:2|3|4|5|6|7|8|9|10)-/.test(identity))).toBe(false);
	});

	it('keeps completeness healthy while the parent class domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('renders the Shadow College category and all three Colleges through the class presentation, then restores canonical English', () => {
		const serialized = JSON.stringify(shadow);
		const { container } = renderClassPanel();

		expect(fieldReading(container, '影舞學院')).toBe('黑燼學院, 蝕鍊學院, 丑面學院');
		collegeMetadata.forEach(college => expectRendered(container, college.name));

		switchLocale();

		expect(fieldReading(container, 'Shadow Colleges')).toBe('College of Black Ash, College of Caustic Alchemy, College of the Harlequin Mask');
		expect(JSON.stringify(shadow)).toBe(serialized);
	});

	it.each(collegeMetadata)('renders $canonicalName metadata through SubclassPanel and restores canonical English', ({ id, name, description, canonicalName, canonicalDescription }) => {
		const college = colleges.find(candidate => candidate.id === id);
		if (!college) {
			throw new Error(`Shadow College '${id}' is missing`);
		}
		const serialized = JSON.stringify(college);
		const { container } = renderSubclass(college);

		expectRendered(container, name);
		expectRendered(container, description);

		switchLocale();

		expectRendered(container, canonicalName);
		expectRendered(container, canonicalDescription);
		expect(JSON.stringify(college)).toBe(serialized);
	});

	it('renders a representative College SkillChoice through FeaturePanel with its shared selected Skill presentation', () => {
		const skillChoice = getFeature(levelOneFeatures(colleges[0]), 'shadow-sub-1-1-1');
		const { container } = renderFeature(skillChoice);

		expect(fieldReading(container, '技能')).toBe('魔法');
		expectRendered(container, '從任意列表中選擇 1 項技能。');
		expectRendered(container, '技能');
		expect(normalizedText(container)).not.toContain('Magic');
	});

	it('renders Insight name, gain triggers, and details on no-Hero and Hero paths without mutating canonical state', () => {
		const insight = getFeature(shadowLevelOne, 'shadow-resource');
		if (insight.type !== FeatureType.HeroicResource) {
			throw new Error('Insight is not a Heroic Resource');
		}
		const assertZhTWInsight = (container: HTMLElement) => {
			expectRendered(container, '洞察');
			expectRendered(container, '每當你的回合開始時');
			expectRendered(container, '每輪中，當你首次花費鬥志來造成傷害時');
			expectRendered(container, '當你發動需要進行檢定的英雄招式時，若你的檢定帶有優勢，該招式的洞察費用會減少 1 點。');
			expectRendered(container, '若該招式具有多個目標，即使只對其中 1 個目標帶有優勢，費用仍然會減少 1 點。');
		};
		const noHero = renderFeature(insight);
		assertZhTWInsight(noHero.container);
		expect(Array.from(noHero.container.querySelectorAll('.pill')).map(node => node.textContent)).toEqual([ '+1d3', '+1' ]);
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeature(insight, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Insight Feature', capture: () => JSON.stringify(insight) }), protectCanonicalState({ label: 'Shadow Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				assertZhTWInsight(withHero.container);
				expect(Array.from(withHero.container.querySelectorAll('.pill')).map(node => node.textContent)).toEqual([ '+1d3', '+1' ]);
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'Insight');
				expectRendered(withHero.container, 'Start of your turn');
				expectRendered(withHero.container, 'The first time each combat round that you deal damage incorporating 1 or more surges');
				expectRendered(withHero.container, 'If the ability has multiple targets, the cost is reduced even if the ability has an edge or double edge against only one target.');
				expect(Array.from(withHero.container.querySelectorAll('.pill')).map(node => node.textContent)).toEqual([ '+1d3', '+1' ]);
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => assertZhTWInsight(withHero.container)
		});
		expect(insight.data.gains.map(gain => ({ tag: gain.tag, value: gain.value }))).toEqual([
			{ tag: 'start', value: '1d3' },
			{ tag: 'deal-damage', value: '1' }
		]);
	});

	it.each(collegeAbilityReadings)('renders $canonicalName through AbilityPanel with every approved Level 1 authored shape', ({ id, name, description, trigger, section, spend, canonicalName }) => {
		const ability = getCollegeAbility(id);
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability);

		expectRendered(container, name);
		expectRendered(container, description);
		expectRendered(container, section);
		if (trigger) {
			expectRendered(container, trigger);
		}
		if (spend) {
			expect(fieldReading(container, '花費')).toBe(spend);
		}

		switchLocale();

		expectRendered(container, canonicalName);
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('keeps Smoke Bomb raw without a Hero and projects only canonical calculated Agility with a Hero', () => {
		const smokeBomb = getFeature(levelOneFeatures(colleges[1]), 'shadow-sub-2-1-3');
		const noHero = renderFeature(smokeBomb);
		expect(noHero.container.textContent).toContain('遁移等於敏捷的格數。');
		noHero.unmount();

		const hero = makeHero();
		const calculated = vi.spyOn(AbilityLogic, 'getTextEffect');
		const withHero = renderFeature(smokeBomb, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Smoke Bomb Feature', capture: () => JSON.stringify(smokeBomb) }), protectCanonicalState({ label: 'Shadow Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => expect(withHero.container.textContent).toContain('遁移 2 格。'),
			switchToEnglish: switchLocale,
			assertEnglish: () => expect(withHero.container.textContent).toContain('shift a number of squares equal to 2'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expect(withHero.container.textContent).toContain('遁移 2 格。')
		});
		calculated.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		calculated.mockRestore();
	});
});
