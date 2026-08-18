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
import { talent } from '@/data/classes/talent/talent';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { localizeCalculatedAuthoredTextPresentation } from '@/components/panels/elements/ability-panel/calculated-authored-text-presentation';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1TalentLevel1AbilityRequiredCanonicalEnglish, createV1TalentLevel1CompletionRequiredCanonicalEnglish, getV1TalentTraditions, v1LocalizationManifest, v1TalentTraditionIDs } from '@/localization/v1-localization-manifest';
import { assertCanonicalEnglishCalculationInput, protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import glossaryCsv from '../../docs/translation/TRANSLATION-GLOSSARY.csv?raw';

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
const talentLevelOne = levelOneFeatures(talent);
const traditions = getV1TalentTraditions();
const required = createV1TalentLevel1CompletionRequiredCanonicalEnglish();
const existingAbilityRequired = createV1TalentLevel1AbilityRequiredCanonicalEnglish();
const catalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => entry.kind === 'element-field' && (required[getEntryIdentity(entry)] !== undefined));

const getFeature = (features: Feature[], id: string) => {
	const feature = features.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Talent Feature '${id}' is missing`);
	}
	return feature;
};

/** Reaches a Choice option's own Feature, which is how the Augmentation and Ward options are authored. */
const getChoiceOption = (choiceID: string, optionID: string) => {
	const choice = getFeature(talentLevelOne, choiceID);
	if (choice.type !== FeatureType.Choice) {
		throw new Error(`Talent Feature '${choiceID}' is not a Choice`);
	}
	const option = choice.data.options.map(candidate => candidate.feature).find(candidate => candidate.id === optionID);
	if (!option) {
		throw new Error(`Talent Feature '${optionID}' is missing`);
	}
	return option;
};

const getTraditionAbility = (id: string): Ability => {
	for (const tradition of traditions) {
		const feature = levelOneFeatures(tradition).find(candidate => candidate.type === FeatureType.Ability && candidate.data.ability.id === id);
		if (feature?.type === FeatureType.Ability) {
			return feature.data.ability;
		}
	}
	throw new Error(`Talent Tradition Ability '${id}' is missing`);
};

const getClarity = () => {
	const clarity = getFeature(talentLevelOne, 'talent-resource');
	if (clarity.type !== FeatureType.HeroicResource) {
		throw new Error('Clarity is not a Heroic Resource');
	}
	return clarity;
};

const makeReasonHero = (reason: number) => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...talent, level: 1, characteristics: FactoryLogic.createCharacteristics(0, 0, reason, 0, 0) };
	return hero;
};

const renderFeature = (feature: Feature, hero?: Hero) => render(createElement(LocalizationProvider, null,
	createElement(LocaleToggle), createElement(FeaturePanel, { feature, hero, mode: PanelMode.Full, sourcebooks: [ core ] })
));
const renderClassPanel = () => render(createElement(LocalizationProvider, null,
	createElement(LocaleToggle), createElement(ClassPanel, { heroClass: talent, sourcebooks: [ core ], mode: PanelMode.Full })
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

const traditionMetadata = [
	{
		id: 'talent-sub-1',
		name: '御劫',
		description: '「御劫」招式能讓你觀察未來和過去的事件，並操控時間來幫助盟友和阻礙敵人。',
		canonicalName: 'Chronopathy',
		canonicalDescription: 'Chronopathy abilities allow you to view future and past events, and to manipulate time to aid allies and hinder foes.'
	},
	{
		id: 'talent-sub-2',
		name: '念動',
		description: '「念動」招式能讓你以物理方式操控生物和物體。',
		canonicalName: 'Telekinesis',
		canonicalDescription: 'Telekinesis abilities allow you to physically manipulate creatures and objects.'
	},
	{
		id: 'talent-sub-3',
		name: '傳心',
		description: '「傳心」招式能讓你與其他生物溝通，或讀取並影響他們的思想。',
		canonicalName: 'Telepathy',
		canonicalDescription: 'Telepathy abilities allow you to communicate with, read, and influence the minds of other creatures.'
	}
] as const;

afterEach(cleanup);

describe('V1 Core Talent Level 1 completion catalog and presentation', () => {
	it('adds the exact bounded 84-identity manifest and catalog slice without overlapping the approved base Ability slice', () => {
		const independentlyWalkedBase = extractLiveBoundedNonAbilityFeatureFields(talentLevelOne);

		expect(v1TalentTraditionIDs).toEqual([ 'talent-sub-1', 'talent-sub-2', 'talent-sub-3' ]);
		expect(Object.keys(required)).toHaveLength(84);
		expect(catalogEntries).toHaveLength(84);
		expect(catalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(catalogEntries.every(entry => entry.approval === 'approved' && entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		expect(Object.keys(existingAbilityRequired)).toHaveLength(131);
		expect(Object.keys(required).some(identity => Object.prototype.hasOwnProperty.call(existingAbilityRequired, identity))).toBe(false);

		// The independent bounded walk of the base Level 1 tree aligns with the manifest directly:
		// every identity it finds is required with the same canonical English, with no per-feature
		// exception carved out on either side.
		expect(Object.keys(independentlyWalkedBase).every(identity => required[identity] === independentlyWalkedBase[identity])).toBe(true);

		// Ability content authored inside the base Level 1 tree belongs to the frozen Ability
		// slice, so the bounded walk neither counts it here nor descends into it.
		expect(required[elementFieldIdentity('talent-1-2', 'name')]).toBeUndefined();
		expect(required[elementFieldIdentity('talent-1-6b', 'name')]).toBeUndefined();
		expect(existingAbilityRequired[elementFieldIdentity('talent-1-6b', 'name')]).toBeDefined();
	});

	it('requires Clarity’s details in addition to the fields the shared bounded walk supplies', () => {
		const clarity = getClarity();
		const walked = extractLiveBoundedNonAbilityFeatureFields(talentLevelOne);

		// The shared walk covers a Heroic Resource's name and gain triggers but not its details.
		expect(walked[elementFieldIdentity('talent-resource', 'name')]).toBe('Clarity');
		expect(walked[elementFieldIdentity('talent-resource', 'details')]).toBeUndefined();

		// The manifest supplies details explicitly, exactly as authored - the leading newline
		// included, since that is part of the canonical text the catalog snapshots.
		expect(required[elementFieldIdentity('talent-resource', 'details')]).toBe(clarity.data.details);
		expect(required[elementFieldIdentity('talent-resource', 'details')].startsWith('\nYou can spend clarity')).toBe(true);
	});

	it('covers exactly the three Traditions at Level 1 and nothing from their later levels', () => {
		traditions.forEach(tradition => {
			const independentlyWalkedTradition = extractLiveBoundedNonAbilityFeatureFields(levelOneFeatures(tradition));
			expect(Object.keys(independentlyWalkedTradition).every(identity => required[identity] === independentlyWalkedTradition[identity])).toBe(true);

			expect(required[elementFieldIdentity(tradition.id, 'name')]).toBe(tradition.name);
			expect(required[elementFieldIdentity(tradition.id, 'description')]).toBe(tradition.description);

			tradition.featuresByLevel.filter(level => level.level > 1).forEach(level => {
				level.features.forEach(feature => {
					expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
				});
			});
		});

		// Talent Level 2+ base content is outside this slice too.
		talent.featuresByLevel.filter(level => level.level > 1).forEach(level => {
			level.features.forEach(feature => {
				expect(Object.keys(required).some(identity => identity.startsWith(`element:${feature.id}/`))).toBe(false);
			});
		});
	});

	it('keeps completeness healthy while the parent class domains remain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });
		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('records exactly the approved Tradition glossary delta', () => {
		const rows = glossaryCsv.split(/\r?\n/).filter(row => row.trim() !== '');
		expect(rows.filter(row => row.startsWith('Tradition,'))).toEqual([ 'Tradition,流派,game-term,approved' ]);
		expect(rows.filter(row => row.startsWith('Chronopathy,'))).toEqual([ 'Chronopathy,御劫,game-term,approved' ]);
		expect(rows.filter(row => row.startsWith('Telekinesis,'))).toEqual([ 'Telekinesis,念動,game-term,approved' ]);
		expect(rows.filter(row => row.startsWith('Telepathy,'))).toEqual([ 'Telepathy,傳心,game-term,approved' ]);
		// Context-specific wording never became a standalone glossary mapping.
		expect(rows.some(row => row.startsWith('Augmentation,'))).toBe(false);
	});

	it('renders the Tradition category and all three Traditions through the class presentation, then restores canonical English', () => {
		const serialized = JSON.stringify(talent);
		const { container } = renderClassPanel();

		expect(fieldReading(container, '流派')).toBe('御劫, 念動, 傳心');
		traditionMetadata.forEach(tradition => expectRendered(container, tradition.name));

		switchLocale();

		expect(fieldReading(container, 'Tradition')).toBe('Chronopathy, Telekinesis, Telepathy');
		expect(JSON.stringify(talent)).toBe(serialized);
	});

	it.each(traditionMetadata)('renders $canonicalName metadata through SubclassPanel and restores canonical English', ({ id, name, description, canonicalName, canonicalDescription }) => {
		const tradition = traditions.find(candidate => candidate.id === id);
		if (!tradition) {
			throw new Error(`Talent Tradition '${id}' is missing`);
		}
		const serialized = JSON.stringify(tradition);
		const { container } = renderSubclass(tradition);

		expectRendered(container, name);
		expectRendered(container, description);

		switchLocale();

		expectRendered(container, canonicalName);
		expectRendered(container, canonicalDescription);
		expect(JSON.stringify(tradition)).toBe(serialized);
	});

	it('renders Clarity name, gain triggers and details on no-Hero and Hero paths without mutating canonical state', () => {
		const clarity = getClarity();
		const assertZhTWClarity = (container: HTMLElement) => {
			expectRendered(container, '明晰');
			expectRendered(container, '每當你的回合開始時');
			expectRendered(container, '每輪中，當 1 個生物首次被強制移動時');
			expectRendered(container, '只要你的明晰低於 0，你就會陷入焦慮。');
			expectRendered(container, '若你在戰鬥外發動具有焦慮效果的招式，你可以主動承受 1d6 點傷害並獲得該焦慮效果（若已擁有該效果則不能這麼做）。');
		};

		const noHero = renderFeature(clarity);
		assertZhTWClarity(noHero.container);
		expect(noHero.container.textContent).not.toContain('Start of your turn');
		noHero.unmount();

		const hero = makeReasonHero(3);
		const withHero = renderFeature(clarity, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Clarity Feature', capture: () => JSON.stringify(clarity) }), protectCanonicalState({ label: 'Talent Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => assertZhTWClarity(withHero.container),
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'Clarity');
				expectRendered(withHero.container, 'Start of your turn');
				expectRendered(withHero.container, 'The first time each combat round that a creature is force moved');
				expectRendered(withHero.container, 'Whenever you have clarity below 0, you are strained.');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => assertZhTWClarity(withHero.container)
		});

		expect(clarity.data.gains.map(gain => ({ tag: gain.tag, value: gain.value }))).toEqual([
			{ tag: 'start', value: '1d3' },
			{ tag: 'move', value: '1' }
		]);
	});

	it('renders the base Level 1 non-Ability features, including the factory-composed Multiple groupings', () => {
		const telepathicSpeech = renderFeature(getFeature(talentLevelOne, 'talent-1-4'));
		expectRendered(telepathicSpeech.container, '心靈傳訊');
		expectRendered(telepathicSpeech.container, '你可以與位於【心靈尖刺】招式射程內的任何生物進行心靈交流，前提是你們有共享的語言且認識彼此。當你用這種方式與他人交流時，對方也能以心靈回應。');
		telepathicSpeech.unmount();

		const augmentation = renderFeature(getFeature(talentLevelOne, 'talent-1-5'));
		expectRendered(augmentation.container, '靈能鍛體');
		expectRendered(augmentation.container, '透過冥想，你在心靈中建立能量通道，強化你的身心。選擇以下 1 種鍛體。作為休整活動，你可以進行靈能冥想來同時更換你的鍛體與護咒。');
		augmentation.unmount();

		const battle = renderFeature(getChoiceOption('talent-1-5', 'talent-1-5a'));
		expectRendered(battle.container, '戰鬥鍛體');
		expectRendered(battle.container, '即使你沒有套裝，你也能有效地穿戴輕甲和持用輕型武器。');
		expectRendered(battle.container, '若你擁有套裝，你不能選擇此鍛體。');
		battle.unmount();

		// Both Multiple groupings render a description the Feature factory composed from their
		// children's names; those generated readings must show approved zh-TW, not English.
		const density = renderFeature(getChoiceOption('talent-1-5', 'talent-1-5b'));
		expectRendered(density.container, '密度鍛體');
		expectRendered(density.container, '體力、穩度');
		expect(density.container.textContent).not.toContain('Stamina, Stability');
		density.unmount();

		const speed = renderFeature(getChoiceOption('talent-1-5', 'talent-1-5e'));
		expectRendered(speed.container, '速度鍛體');
		expectRendered(speed.container, '速度、撤離');
		expect(speed.container.textContent).not.toContain('Speed, Disengage');

		switchLocale();

		expectRendered(speed.container, 'Speed, Disengage');
		speed.unmount();

		const ward = renderFeature(getFeature(talentLevelOne, 'talent-1-6'));
		expectRendered(ward.container, '異能者護咒');
		expectRendered(ward.container, '透過冥想，你創造一道護咒來保護自己。選擇以下 1 種護咒。作為休整活動，你可以進行靈能冥想來同時更換你的鍛體與護咒。');
		ward.unmount();

		const vanishing = renderFeature(getChoiceOption('talent-1-6', 'talent-1-6d'));
		expectRendered(vanishing.container, '隱遁護咒');
		expectRendered(vanishing.container, '你的護咒能讓你從威脅中消失無蹤。每當你受到傷害時，你會變成隱形，直到你下個回合結束。');
		vanishing.unmount();

		const signature = renderFeature(getFeature(talentLevelOne, 'talent-1-7'));
		expectRendered(signature.container, '招牌招式');
		signature.unmount();

		const cost3 = renderFeature(getFeature(talentLevelOne, 'talent-1-8'));
		expectRendered(cost3.container, '3 費招式');
		cost3.unmount();

		const cost5 = renderFeature(getFeature(talentLevelOne, 'talent-1-9'));
		expectRendered(cost5.container, '5 費招式');
		cost5.unmount();
	});

	it('renders the skill and language choices with their approved restricted-list descriptions', () => {
		const anySkill = renderFeature(getFeature(talentLevelOne, 'talent-skill-a'));
		expectRendered(anySkill.container, '技能');
		expectRendered(anySkill.container, '從任意列表中選擇 2 項技能。');
		anySkill.unmount();

		const restricted = renderFeature(getFeature(talentLevelOne, 'talent-skill-c'));
		expectRendered(restricted.container, '交涉類／學識類技能');
		expectRendered(restricted.container, '從交涉類技能、學識類技能中選擇 2 項技能。');
		restricted.unmount();

		const language = renderFeature(getFeature(talentLevelOne, 'talent-1-3'));
		expectRendered(language.container, '語言');
		expectRendered(language.container, '選擇 1 種語言。');
		language.unmount();
	});

	it.each([
		{
			id: 'talent-sub-1-1-2',
			name: '回溯',
			description: '你倒回一秒鐘，看看事情是否會有不同的發展。',
			target: '自身或 1 個生物',
			trigger: '當目標進行招式檢定時。',
			section: '你可以在看到觸發的檢定結果後再發動此招式。目標必須重新進行檢定，並採用新的結果。',
			canonicalName: 'Again'
		},
		{
			id: 'talent-sub-3-1-1',
			name: '反饋迴路',
			description: '在敵人與盟友之間建立短暫的心靈連結，讓敵人自食其果。',
			target: '1 個生物',
			trigger: '當目標對 1 個盟友造成傷害時。',
			section: '目標受到等於觸發傷害一半的心靈傷害。',
			canonicalName: 'Feedback Loop'
		}
	])('renders $canonicalName through AbilityPanel with every approved authored shape', ({ id, name, description, target, trigger, section, canonicalName }) => {
		const ability = getTraditionAbility(id);
		const serialized = JSON.stringify(ability);
		const { container } = renderAbility(ability);

		expectRendered(container, name);
		expectRendered(container, description);
		expect(fieldReading(container, '目標')).toBe(target);
		expectRendered(container, trigger);
		expectRendered(container, section);

		switchLocale();

		expectRendered(container, canonicalName);
		expect(JSON.stringify(ability)).toBe(serialized);
	});

	it('renders the remaining Tradition Level 1 ability content in approved zh-TW', () => {
		const remote = renderAbility(getTraditionAbility('talent-sub-3-1-2'));
		expectRendered(remote.container, '遠端支援');
		expectRendered(remote.container, '一名盟友獲得你智慧的加持。');
		expectRendered(remote.container, '直到你的下個回合開始前，1 個盟友針對目標進行的下次招式檢定會獲得 1 個優勢。');
		expect(fieldReading(remote.container, '花費')).toBe('你可以額外指定 1 個生物或物體作為目標。');
		remote.unmount();

		const minor = renderAbility(getTraditionAbility('talent-sub-2-1-1'));
		expectRendered(minor.container, '微量念動');
		expectRendered(minor.container, '當你僅憑意念強制移動目標時，肉眼可見的靈能波紋從你的大腦散發而出。');
		expect(fieldReading(minor.container, '目標')).toBe('自身或 1 個體型 1 的生物或物體');
		expectRendered(minor.container, '每花費 2 點明晰，你可以指定的生物或物體體型上限增加 1 級。');
		expectRendered(minor.container, '你可以垂直滑動目標。');
		minor.unmount();

		const accelerate = renderAbility(getTraditionAbility('talent-sub-1-1-1'));
		expectRendered(accelerate.container, '加速');
		expectRendered(accelerate.container, '在盟友眼中，彷彿整個世界都變慢了。');
		expect(fieldReading(accelerate.container, '花費')).toBe('目標可以使用 1 個機動動作。');
		accelerate.unmount();

		const repel = renderAbility(getTraditionAbility('talent-sub-2-1-2'));
		expectRendered(repel.container, '驅斥');
		expectRendered(repel.container, '該退下的不是他，是你！');
		expectRendered(repel.container, '當目標受到傷害或被強制移動時。');
		repel.unmount();
	});

	it.each([
		{
			label: 'Entropy Ward',
			elementID: 'talent-1-6a',
			zhTWName: '熵蝕護咒',
			rawZhTW: '他的速度會減少等於你理智的數值，而且無法執行反應動作，直到他下個回合結束。',
			heroZhTW: '他的速度會減少 3，而且無法執行反應動作，直到他下個回合結束。',
			heroEnglish: 'their speed is reduced by an amount equal to 3'
		},
		{
			label: 'Steel Ward',
			elementID: 'talent-1-6c',
			zhTWName: '鋼鐵護咒',
			rawZhTW: '你會獲得等於你理智的傷害免疫，直到你下個回合結束。',
			heroZhTW: '你會獲得 3 點傷害免疫，直到你下個回合結束。',
			heroEnglish: 'you gain damage immunity equal to 3'
		}
	])('projects $label’s Reason-derived value through FeaturePanel with a Hero and keeps the approved raw wording without one', ({ elementID, zhTWName, rawZhTW, heroZhTW, heroEnglish }) => {
		const wardOption = getChoiceOption('talent-1-6', elementID);

		const noHero = renderFeature(wardOption);
		expectRendered(noHero.container, zhTWName);
		expectRendered(noHero.container, rawZhTW);
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toEqual([ '理智' ]);
		expect(noHero.container.textContent).not.toContain('Reason score');
		noHero.unmount();

		const hero = makeReasonHero(3);
		const serializedFeature = JSON.stringify(wardOption);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderFeature(wardOption, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: `${elementID} Feature`, capture: () => JSON.stringify(wardOption) }), protectCanonicalState({ label: 'Talent Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				expectRendered(withHero.container, heroZhTW);
				expect(withHero.container.textContent).not.toContain('理智');
				expect(withHero.container.textContent).not.toContain('Reason score');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, heroEnglish),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW)
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(wardOption)).toBe(serializedFeature);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it.each([
		{
			id: 'talent-sub-1-1-1',
			label: 'Accelerate',
			rawZhTW: '目標可以遁移最多等於你理智的格數。',
			heroZhTW: '目標可以遁移最多 3 格。',
			heroEnglish: 'The target shifts up to a number of squares equal to 3.'
		},
		{
			id: 'talent-sub-2-1-1',
			label: 'Minor Telekinesis',
			rawZhTW: '你將目標滑動最多等於你理智的格數。',
			heroZhTW: '你將目標滑動最多 3 格。',
			heroEnglish: 'You slide the target up to a number of squares equal to 3.'
		}
	])('projects $label’s Reason-derived distance through AbilityPanel with a Hero and keeps the approved raw wording without one', ({ id, rawZhTW, heroZhTW, heroEnglish }) => {
		const ability = getTraditionAbility(id);

		const noHero = renderAbility(ability);
		expectRendered(noHero.container, rawZhTW);
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toEqual([ '理智' ]);
		expect(noHero.container.textContent).not.toContain('Reason score');
		noHero.unmount();

		const hero = makeReasonHero(3);
		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderAbility(ability, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: `${id} Ability`, capture: () => JSON.stringify(ability) }), protectCanonicalState({ label: 'Talent Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				expectRendered(withHero.container, heroZhTW);
				expect(withHero.container.textContent).not.toContain('理智');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => expectRendered(withHero.container, heroEnglish),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW)
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('projects both of Repel’s Reason-derived values together, and keeps the approved raw wording without a Hero', () => {
		const repel = getTraditionAbility('talent-sub-2-1-2');
		const rawZhTW = '目標受到的觸發傷害減半，或將觸發的強制移動距離減少等於你理智的格數。若目標同時受到傷害和強制移動，你必須選擇要套用哪個效果。若強制移動的距離因此降至 0 格，目標可以將強制移動的來源推動等於你理智的格數。';
		const heroZhTW = '目標受到的觸發傷害減半，或將觸發的強制移動距離減少 3 格。若目標同時受到傷害和強制移動，你必須選擇要套用哪個效果。若強制移動的距離因此降至 0 格，目標可以將強制移動的來源推動 3 格。';

		const noHero = renderAbility(repel);
		expectRendered(noHero.container, rawZhTW);
		expect(Array.from(noHero.container.querySelectorAll('code')).map(node => node.textContent)).toEqual([ '理智', '理智' ]);
		expect(noHero.container.textContent).not.toContain('Reason score');
		noHero.unmount();

		const hero = makeReasonHero(3);
		const serializedAbility = JSON.stringify(repel);
		const serializedHero = JSON.stringify(hero);
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const withHero = renderAbility(repel, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [ protectCanonicalState({ label: 'Repel Ability', capture: () => JSON.stringify(repel) }), protectCanonicalState({ label: 'Talent Hero', capture: () => JSON.stringify(hero) }) ],
			assertZhTW: () => {
				expectRendered(withHero.container, heroZhTW);
				expect(withHero.container.textContent).not.toContain('理智');
			},
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expectRendered(withHero.container, 'is reduced by a number of squares equal to 3.');
				expectRendered(withHero.container, 'push the source of the forced movement a number of squares equal to 3.');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectRendered(withHero.container, heroZhTW)
		});

		getTextEffect.mock.calls.forEach(([ input ]) => assertCanonicalEnglishCalculationInput(input));
		expect(JSON.stringify(repel)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		getTextEffect.mockRestore();
	});

	it('falls back to the whole calculated English when only one of Repel’s two values can be proven', () => {
		const canonicalEnglish = 'The target takes half the triggering damage, or the distance of the triggering forced movement is reduced by a number of squares equal to your Reason score. If the target took damage and was force moved, you choose the effect. If the forced movement is reduced to 0 squares, the target can push the source of the forced movement a number of squares equal to your Reason score.';
		// Only the first Reason-derived value resolved; the second kept its unresolved grammar.
		const partiallyCalculatedEnglish = 'The target takes half the triggering damage, or the distance of the triggering forced movement is reduced by a number of squares equal to 3. If the target took damage and was force moved, you choose the effect. If the forced movement is reduced to 0 squares, the target can push the source of the forced movement a number of squares equal to your Reason score.';

		const presented = localizeCalculatedAuthoredTextPresentation({
			locale: 'zh-TW',
			elementID: 'talent-sub-2-1-2',
			field: 'sections.0.text',
			canonicalEnglish: canonicalEnglish,
			calculatedEnglish: partiallyCalculatedEnglish
		});

		// A whole English reading, never a mixed partial Chinese/English sentence.
		expect(presented).toBe(partiallyCalculatedEnglish);
		expect(presented).not.toMatch(/[一-鿿]/);
	});
});
