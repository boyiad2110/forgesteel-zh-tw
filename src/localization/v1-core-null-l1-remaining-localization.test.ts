// @vitest-environment jsdom
/* eslint-disable sort-imports */
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FeaturePanel } from '@/components/panels/elements/feature-panel/feature-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { FeatureType } from '@/enums/feature-type';
import { PanelMode } from '@/enums/panel-mode';
import { nullClass } from '@/data/classes/null/null';
import { ElementFieldEntry, elementFieldIdentity, getEntryIdentity } from '@/localization/catalog';
import { productionLocalizationEntries } from '@/localization/catalog-data';
import { analyzeV1LocalizationCompleteness } from '@/localization/v1-localization-completeness';
import { createV1NullLevel1RemainingRequiredCanonicalEnglish, v1LocalizationManifest } from '@/localization/v1-localization-manifest';
import { protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { extractLiveBoundedNonAbilityFeatureFields } from '@/localization/test-support/bounded-non-ability-feature-fields';
import { FactoryLogic } from '@/logic/factory-logic';
import { Feature } from '@/models/feature';
import { Hero } from '@/models/hero';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' }),
	useHeroes: () => []
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

const nullLevelOneFeatures = nullClass.featuresByLevel.find(level => level.level === 1)?.features || [];
const liveFields = extractLiveBoundedNonAbilityFeatureFields(nullLevelOneFeatures);
const required = createV1NullLevel1RemainingRequiredCanonicalEnglish();
const nullCatalogEntries = productionLocalizationEntries.filter((entry): entry is ElementFieldEntry => (
	(entry.kind === 'element-field') && (required[getEntryIdentity(entry)] !== undefined)
));

const getFeature = (id: string) => {
	const feature = nullLevelOneFeatures.find(candidate => candidate.id === id);
	if (!feature) {
		throw new Error(`Null Feature '${id}' is missing`);
	}
	return feature;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = { ...nullClass, level: 1, characteristics: FactoryLogic.createCharacteristics(0, 2, 2, 0, 0) };
	return hero;
};

const renderFeature = (feature: Feature, hero?: Hero) => render(
	createElement(
		LocalizationProvider,
		null,
		createElement(LocaleToggle),
		createElement(FeaturePanel, { feature, hero, mode: PanelMode.Full })
	)
);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// Nested Choice options and Multiple children are mounted behind collapsed Expanders, so the
// nested player-facing content is revealed the same way a player reveals it.
const expandNestedContent = (container: HTMLElement) => {
	for (let pass = 0; pass < 3; pass++) {
		container.querySelectorAll('.ant-collapse-header').forEach(header => {
			if (header.getAttribute('aria-expanded') !== 'true') {
				fireEvent.click(header);
			}
		});
	}
};

const countOccurrences = (haystack: string, needle: string) => haystack.split(needle).length - 1;

const expectDisciplineZhTW = (container: HTMLElement) => {
	expect(container.textContent).toContain('紀律');
	expect(container.textContent).toContain('每當你的回合開始時');
	expect(container.textContent).toContain('每輪中，當位於你【無念場】內的 1 個敵人首次使用主要動作時');
	expect(container.textContent).toContain('每輪中，當 GM 首次發動 1 個需要花費惡意的招式時');
};

const expectDisciplineEnglish = (container: HTMLElement) => {
	expect(container.textContent).toContain('Discipline');
	expect(container.textContent).toContain('Start of your turn');
	expect(container.textContent).toContain('The first time each combat round that an enemy in the area of your Null Field ability uses a main action');
	expect(container.textContent).toContain('The first time each combat round that the Director uses an ability that costs Malice');
};

afterEach(cleanup);

describe('V1 Core Null L1 remaining catalog and presentation', () => {
	// The live slice is extracted by an independent test-side walk of Null's own canonical
	// Level 1 roots, so this compares the manifest against canonical data rather than against
	// the manifest's own traversal.
	it('matches the independent live Null Level 1 non-Ability slice exactly', () => {
		expect(Object.keys(liveFields)).toHaveLength(36);
		expect(Object.keys(required)).toHaveLength(36);
		expect(Object.keys(required).sort()).toEqual(Object.keys(liveFields).sort());
		expect(required).toEqual(liveFields);
	});

	it('adds exactly the approved non-Ability manifest and catalog slice', () => {
		expect(Object.keys(required)).toHaveLength(36);
		expect(nullCatalogEntries).toHaveLength(36);
		expect(nullCatalogEntries.map(getEntryIdentity).sort()).toEqual(Object.keys(required).sort());
		expect(nullCatalogEntries.every(entry => entry.approval === 'approved')).toBe(true);
		expect(nullCatalogEntries.every(entry => entry.canonicalEnglish === required[getEntryIdentity(entry)])).toBe(true);

		// The Null Level 1 Ability nodes and their authored fields stay in the existing ability slice.
		[ 'null-1-4', 'null-1-5' ].forEach(abilityID => {
			expect(Object.keys(required)).not.toContain(elementFieldIdentity(abilityID, 'name'));
			expect(Object.keys(required)).not.toContain(elementFieldIdentity(abilityID, 'description'));
		});

		// The generated ClassAbility choice labels are player-facing, so they belong here.
		expect(required[elementFieldIdentity('null-1-9', 'name')]).toBe('Signature Ability');
		expect(required[elementFieldIdentity('null-1-10', 'name')]).toBe('3pt Ability');
		expect(required[elementFieldIdentity('null-1-11', 'name')]).toBe('5pt Ability');

		const zhTWOf = (identity: string) => nullCatalogEntries.find(entry => getEntryIdentity(entry) === identity)?.zhTW;
		expect(zhTWOf('element:null-resource/name')).toBe('紀律');
		expect(zhTWOf('element:null-resource/gains.1.trigger')).toBe('每輪中，當位於你【無念場】內的 1 個敵人首次使用主要動作時');
		expect(zhTWOf('element:null-1-2/description')).toBe('從交涉類技能或學識類技能中選擇 2 項技能。');
		expect(zhTWOf('element:null-1-7/name')).toBe('靈能鍛體');
		// Owner explicitly retained the '你可以使用' reading in all three Psionic Martial Arts rows.
		expect(zhTWOf('element:null-1-8a/description')).toBe('每當你使用擊退或擒抱機動動作時，你可以使用`直覺`取代`力量`來進行檢定，以及判斷是否可以指定體型比你大的生物。此外，每當你使用擊退機動動作時，你可以選擇讓目標滑動，而非推動。');
		expect(zhTWOf('element:null-1-8b/description')).toBe('你可以使用`直覺`取代`力量`來進行檢定，以及判斷是否可以指定體型比你大的生物。');
		expect(zhTWOf('element:null-1-8c/description')).toBe('你可以使用`直覺`取代`力量`來進行檢定，而且可以選擇讓目標滑動，而非推動。');
	});

	it('keeps the catalog complete and the class-level domain unresolved', () => {
		const result = analyzeV1LocalizationCompleteness({ ...v1LocalizationManifest, catalogEntries: productionLocalizationEntries });

		expect(result.missing).toEqual([]);
		expect(result.unapproved).toEqual([]);
		expect(result.catalogIssues).toEqual([]);
		expect(result.unresolvedDomains.map(domain => domain.id)).toContain('class-and-subclass-level-content');
		expect(result.complete).toBe(false);
	});

	it('renders Discipline and all three gain triggers through no-Hero and Hero paths without changing canonical state', () => {
		const discipline = getFeature('null-resource');
		if (discipline.type !== FeatureType.HeroicResource) {
			throw new Error('Discipline is not a Heroic Resource');
		}

		const noHero = renderFeature(discipline);
		expectDisciplineZhTW(noHero.container);
		noHero.unmount();

		const hero = makeHero();
		const withHero = renderFeature(discipline, hero);
		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Discipline Feature', capture: () => JSON.stringify(discipline) }),
				protectCanonicalState({ label: 'Null Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: () => expectDisciplineZhTW(withHero.container),
			switchToEnglish: switchLocale,
			assertEnglish: () => expectDisciplineEnglish(withHero.container),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: () => expectDisciplineZhTW(withHero.container)
		});
		expect(discipline.data.gains).toEqual([
			{ tag: 'start', trigger: 'Start of your turn', value: '2' },
			{ tag: 'action', trigger: 'The first time each combat round that an enemy in the area of your Null Field ability uses a main action', value: '1' },
			{ tag: 'malice', trigger: 'The first time each combat round that the Director uses an ability that costs Malice', value: '1' }
		]);
	});

	it('resolves the Null Speed parent and both of its bonus children', () => {
		const nullSpeed = getFeature('null-1-6');
		const hero = makeHero();
		const withHero = renderFeature(nullSpeed, hero);
		expandNestedContent(withHero.container);

		// The parent and both children share one canonical label, so all three renders are counted.
		const expectNullSpeedZhTW = () => {
			expect(countOccurrences(withHero.container.textContent || '', '無念速度')).toBeGreaterThanOrEqual(3);
			expect(withHero.container.textContent).toContain('靈能力量流淌於你體內，讓你能夠達到極高的速度。');
			expect(withHero.container.textContent).not.toContain('Null Speed');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Null Speed Feature', capture: () => JSON.stringify(nullSpeed) }),
				protectCanonicalState({ label: 'Null Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: expectNullSpeedZhTW,
			switchToEnglish: () => {
				switchLocale();
				expect(countOccurrences(withHero.container.textContent || '', 'Null Speed')).toBeGreaterThanOrEqual(3);
				expect(withHero.container.textContent).toContain('The flow of psionic power through you allows you to achieve high velocity.');
				expect(withHero.container.textContent).not.toContain('無念速度');
			},
			assertEnglish: () => expect(withHero.container.textContent).toContain('Null Speed'),
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectNullSpeedZhTW
		});
	});

	it('resolves the Psionic Augmentation choice and its Density, Force and Speed options', () => {
		const augmentation = getFeature('null-1-7');
		const hero = makeHero();
		const withHero = renderFeature(augmentation, hero);
		expandNestedContent(withHero.container);

		const expectAugmentationZhTW = () => {
			expect(withHero.container.textContent).toContain('靈能鍛體');
			expect(withHero.container.textContent).toContain('你的訓練將身體鍛造成完美的靈能兵器，用心靈的力量塑造出強化的肉體。選擇以下 1 種鍛體。作為休整活動，你可以進行靈能冥想來更換你的鍛體。');
			expect(withHero.container.textContent).toContain('密度鍛體');
			expect(withHero.container.textContent).toContain('穩度、體力');
			expect(withHero.container.textContent).toContain('力量鍛體');
			expect(withHero.container.textContent).toContain('速度鍛體');
			expect(withHero.container.textContent).toContain('速度、撤離');
			expect(withHero.container.textContent).not.toContain('Augmentation');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Psionic Augmentation Feature', capture: () => JSON.stringify(augmentation) }),
				protectCanonicalState({ label: 'Null Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: expectAugmentationZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(withHero.container.textContent).toContain('Psionic Augmentation');
				expect(withHero.container.textContent).toContain('Choose one of the following augmentations.');
				expect(withHero.container.textContent).toContain('Density Augmentation');
				expect(withHero.container.textContent).toContain('Stability, Stamina');
				expect(withHero.container.textContent).toContain('Force Augmentation');
				expect(withHero.container.textContent).toContain('Speed Augmentation');
				expect(withHero.container.textContent).toContain('Speed, Disengage');
				expect(withHero.container.textContent).not.toContain('鍛體');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectAugmentationZhTW
		});
	});

	it('resolves the Psionic Martial Arts parent, children and retained Owner prose', () => {
		const martialArts = getFeature('null-1-8');
		const hero = makeHero();
		const withHero = renderFeature(martialArts, hero);
		expandNestedContent(withHero.container);

		// Markdown renders the approved backtick-emphasised characteristics as code, so the
		// rendered text carries the Owner wording without its backticks.
		const expectMartialArtsZhTW = () => {
			expect(withHero.container.textContent).toContain('靈能武術、靈能武術、靈能武術');
			expect(withHero.container.textContent).toContain('每當你使用擊退或擒抱機動動作時，你可以使用直覺取代力量來進行檢定，以及判斷是否可以指定體型比你大的生物。此外，每當你使用擊退機動動作時，你可以選擇讓目標滑動，而非推動。');
			expect(withHero.container.textContent).toContain('你可以使用直覺取代力量來進行檢定，以及判斷是否可以指定體型比你大的生物。');
			expect(withHero.container.textContent).toContain('你可以使用直覺取代力量來進行檢定，而且可以選擇讓目標滑動，而非推動。');
			expect(withHero.container.textContent).not.toContain('Psionic Martial Arts');
		};

		verifyLocaleDifferentialInvariants({
			protectedStates: [
				protectCanonicalState({ label: 'Psionic Martial Arts Feature', capture: () => JSON.stringify(martialArts) }),
				protectCanonicalState({ label: 'Null Hero', capture: () => JSON.stringify(hero) })
			],
			assertZhTW: expectMartialArtsZhTW,
			switchToEnglish: switchLocale,
			assertEnglish: () => {
				expect(withHero.container.textContent).toContain('Psionic Martial Arts, Psionic Martial Arts, Psionic Martial Arts');
				expect(withHero.container.textContent).toContain('Whenever you use the Knockback or Grab maneuver, you use Intuition instead of Might for the power roll and for determining if you can target creatures larger than you. Additionally, whenever you use the Knockback maneuver, you can choose to slide the target instead of pushing them.');
				expect(withHero.container.textContent).toContain('You use Intuition instead of Might for the power roll and for determining if you can target creatures larger than you.');
				expect(withHero.container.textContent).toContain('You use Intuition instead of Might for the power roll and you can choose to slide the target instead of pushing them.');
				expect(withHero.container.textContent).not.toContain('靈能武術');
			},
			switchToZhTW: switchLocale,
			assertZhTWAfterRoundTrip: expectMartialArtsZhTW
		});
	});
});
