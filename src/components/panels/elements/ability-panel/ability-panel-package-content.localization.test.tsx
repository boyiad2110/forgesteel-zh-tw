// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { AbilityData } from '@/data/ability-data';
import { AppLocale } from '@/localization/locale';
import { Ability } from '@/models/ability';
import { HeroClass } from '@/models/class';
import { Hero } from '@/models/hero';
import { PanelMode } from '@/enums/panel-mode';
import { AbilityLogic } from '@/logic/ability-logic';
import { FactoryLogic } from '@/logic/factory-logic';
import { beastheart } from '@/data/classes/beastheart/beastheart';
import { censor } from '@/data/classes/censor/censor';
import { nullClass } from '@/data/classes/null/null';
import { tactician } from '@/data/classes/tactician/tactician';
import { core } from '@/data/sourcebooks/official/core';
import { beastheartSourcebook } from '@/data/sourcebooks/official/beastheart';
import { summonerSourcebook } from '@/data/sourcebooks/official/summoner';
import { protectCanonicalState, verifyLocaleDifferentialInvariants } from '@/localization/test-support/localization-differential-invariants';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The AbilityPanel package section renders the PackageContent Features a Hero's own choices
 * inject into a host ability. That authored text belongs to the Feature, not to the host, so
 * these tests watch which identity each field is localized under and assert the rendered public
 * output of the real package section rather than a presenter call in isolation.
 */
const boundary = vi.hoisted(() => ({ calls: [] as { elementID: string, field: string, canonicalEnglish: string }[] }));

vi.mock('@/localization/resolver', async importActual => {
	const actual = await importActual<typeof import('@/localization/resolver')>();
	// Stands in for approved catalog entries this batch must not add: one static reading, and one
	// whose canonical grammar the calculator rewrites in a way no authorized projection covers.
	const syntheticResolver = actual.createLocalizationResolver([
		{
			kind: 'element-field',
			elementID: 'synthetic-static-benefit',
			field: 'name',
			canonicalEnglish: 'Synthetic Static Benefit',
			zhTW: '合成靜態益處',
			approval: 'approved'
		},
		{
			kind: 'element-field',
			elementID: 'synthetic-static-benefit',
			field: 'description',
			canonicalEnglish: 'You gain 1 surge.',
			zhTW: '你獲得 1 點鬥志。',
			approval: 'approved'
		},
		{
			kind: 'element-field',
			elementID: 'synthetic-unsupported-benefit',
			field: 'name',
			canonicalEnglish: 'Synthetic Unsupported Benefit',
			zhTW: '合成未支援益處',
			approval: 'approved'
		},
		{
			kind: 'element-field',
			elementID: 'synthetic-unsupported-benefit',
			field: 'description',
			canonicalEnglish: 'The target takes damage equal to your level.',
			zhTW: '目標受到等於你等級的傷害。',
			approval: 'approved'
		}
	]);
	const syntheticIDs = [ 'synthetic-static-benefit', 'synthetic-unsupported-benefit' ];
	return {
		...actual,
		localizeElementField: (locale: AppLocale, elementID: string, field: string, canonicalEnglish: string) => {
			boundary.calls.push({ elementID: elementID, field: field, canonicalEnglish: canonicalEnglish });
			if (syntheticIDs.includes(elementID)) {
				return syntheticResolver.localizeElementField(locale, elementID, field, canonicalEnglish);
			}
			return actual.localizeElementField(locale, elementID, field, canonicalEnglish);
		}
	};
});

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' })
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
// Shows the text it was handed verbatim, so these tests read the exact string the presentation
// boundary produced - Markdown emphasis markers included.
vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text, className }: { text: string, className?: string }) => <span className={className}>{text}</span>
}));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: (prefix: string, id: string) => `${prefix}-${id}` } }));

beforeEach(() => {
	boundary.calls = [];
});

afterEach(cleanup);

const chinese = /[一-鿿]/;

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

interface RenderedField {
	label: string;
	value: string;
}

/**
 * Every labelled benefit the panel rendered, in the order it rendered them. The ability info
 * panel's own labelled fields - distance, target - are excluded so these assertions read the
 * package section rather than the header metadata around it.
 */
const readFields = (container: HTMLElement): RenderedField[] => Array.from(container.querySelectorAll('.field'))
	.filter(field => !field.closest('.ability-info-panel'))
	.map(field => ({
		label: field.querySelector('.field-label')?.textContent?.trim() || '',
		value: field.querySelector('.field-value')?.textContent?.trim() || ''
	}));

const readField = (container: HTMLElement, label: string): RenderedField | undefined => readFields(container).find(field => field.label === label);

const renderPanel = (ability: Ability, hero?: Hero) => render(
	<LocalizationProvider>
		<LocaleToggle />
		<AbilityPanel ability={ability} hero={hero} mode={PanelMode.Full} />
	</LocalizationProvider>
);

/** The host ability, read out of the live class data rather than restated here. */
const findAbility = (root: unknown, abilityID: string): Ability => {
	const seen = new Set<unknown>();
	const walk = (node: unknown): Ability | undefined => {
		if (!node || (typeof node !== 'object') || seen.has(node)) {
			return undefined;
		}
		seen.add(node);
		if (Array.isArray(node)) {
			return node.map(walk).find(found => found !== undefined);
		}
		const candidate = node as Record<string, unknown>;
		if ((candidate.id === abilityID) && Array.isArray(candidate.sections)) {
			return candidate as unknown as Ability;
		}
		return Object.values(candidate).map(walk).find(found => found !== undefined);
	};
	const ability = walk(root);
	if (!ability) {
		throw new Error(`Host ability '${abilityID}' is no longer present in the live data`);
	}
	return ability;
};

/**
 * Every tag an `AbilitySectionPackage` actually injects into across the official player-facing
 * data. This is enumerated from that data, not from the list this batch reasoned about, so a tag
 * that later starts reaching this surface shows up here rather than being assumed absent.
 */
const officialPackageSectionTags = () => {
	const tags = new Set<string>();
	const seen = new Set<unknown>();
	const walk = (node: unknown) => {
		if (!node || ((typeof node !== 'object') && (typeof node !== 'function')) || seen.has(node)) {
			return;
		}
		seen.add(node);
		if (Array.isArray(node)) {
			node.forEach(walk);
			return;
		}
		const candidate = node as Record<string, unknown>;
		if (Array.isArray(candidate.sections)) {
			(candidate.sections as Record<string, unknown>[]).forEach(section => {
				if (section && (section.type === 'package') && (typeof section.tag === 'string')) {
					tags.add(section.tag);
				}
			});
		}
		Object.values(candidate).forEach(walk);
	};
	[ core, beastheartSourcebook, summonerSourcebook, AbilityData ].forEach(walk);
	return tags;
};

const heroWithSubclass = (heroClass: HeroClass, subclassID: string, level: number, characteristics: HeroClass['characteristics']): Hero => {
	const hero = FactoryLogic.createHero();
	hero.class = {
		...heroClass,
		level: level,
		characteristics: characteristics,
		subclasses: heroClass.subclasses.map(sc => ({ ...sc, selected: sc.id === subclassID }))
	};
	return hero;
};

/**
 * Runs the public zh-TW → English → zh-TW sequence, checking the injected benefit's reading at
 * every phase while the Hero and the host ability stay byte-for-byte unchanged.
 */
const expectLocaleRoundTrip = (options: {
	container: HTMLElement,
	label: string,
	zhTW: RenderedField,
	english: RenderedField,
	protect: unknown[]
}) => {
	const protectedStates = options.protect.map((subject, index) => protectCanonicalState({
		label: `protected subject ${index}`,
		capture: () => JSON.stringify(subject)
	}));

	const expectReading = (expected: RenderedField) => {
		const field = readField(options.container, expected.label);
		expect(field).toEqual(expected);
	};

	verifyLocaleDifferentialInvariants({
		protectedStates: protectedStates,
		assertZhTW: () => expectReading(options.zhTW),
		switchToEnglish: switchLocale,
		assertEnglish: () => expectReading(options.english),
		switchToZhTW: switchLocale,
		assertZhTWAfterRoundTrip: () => expectReading(options.zhTW)
	});
};

describe('AbilityPanel PackageContent localization identity', () => {
	it('localizes an injected benefit under the Feature identity, never the host ability identity', () => {
		const ability = findAbility(censor, 'censor-1-4');
		const hero = heroWithSubclass(censor, 'censor-sub-2', 1, FactoryLogic.createCharacteristics(2, 0, 0, 0, 2));

		renderPanel(ability, hero);

		const benefitCalls = boundary.calls.filter(call => call.elementID === 'censor-sub-2-1-2');
		expect(Array.from(new Set(benefitCalls.map(call => call.field))).sort()).toEqual([ 'description', 'name' ]);
		expect(benefitCalls.map(call => call.canonicalEnglish)).toContain('Judgment Order Benefit');
		// The host ability's identity is never asked for the injected Feature's authored text.
		expect(boundary.calls.filter(call => (call.elementID === 'censor-1-4') && (call.canonicalEnglish === 'Judgment Order Benefit'))).toEqual([]);
		expect(boundary.calls.filter(call => (call.elementID === 'censor-1-4') && call.canonicalEnglish.startsWith('The first time on a turn'))).toEqual([]);
	});
});

describe('AbilityPanel dynamic PackageContent presentation', () => {
	it('reads a Censor Judgment Order Benefit in zh-TW with the Hero-calculated value', () => {
		const ability = findAbility(censor, 'censor-1-4');
		const hero = heroWithSubclass(censor, 'censor-sub-2', 1, FactoryLogic.createCharacteristics(2, 0, 0, 0, 2));
		const getTextEffect = vi.spyOn(AbilityLogic, 'getTextEffect');

		const { container } = renderPanel(ability, hero);

		expectLocaleRoundTrip({
			container: container,
			label: '審判：教團益處',
			zhTW: {
				label: '審判：教團益處',
				value: '當你在 1 個回合中首次發動【審判】招式審判 1 個生物時，你可以對被審判的生物造成 4 點神聖傷害。'
			},
			english: {
				label: 'Judgment Order Benefit',
				value: 'The first time on a turn that you use your Judgment ability to judge a creature, you can deal holy damage equal to 4 to the judged creature.'
			},
			protect: [ hero, ability ]
		});

		// The calculation only ever saw canonical English, in either locale.
		expect(getTextEffect.mock.calls.length).toBeGreaterThan(0);
		getTextEffect.mock.calls.forEach(call => expect(call[0]).not.toMatch(chinese));
		expect(getTextEffect.mock.calls.map(call => call[0])).toContain('The first time on a turn that you use your Judgment ability to judge a creature, you can deal holy damage equal to twice your Presence score to the judged creature.');

		getTextEffect.mockRestore();
	});

	it('falls back to the approved raw zh-TW reading when auto-calculation is turned off', () => {
		const ability = findAbility(censor, 'censor-1-4');
		const hero = heroWithSubclass(censor, 'censor-sub-1', 1, FactoryLogic.createCharacteristics(2, 0, 0, 0, 2));

		const { container } = renderPanel(ability, hero);

		expect(readField(container, '審判：教團益處')?.value).toBe('當你在 1 個回合中首次發動【審判】招式審判 1 個生物時，你可以傳送最多 4 格。此移動必須讓你更接近被審判的生物。你與終點之間不需要有效果線。');

		fireEvent.click(screen.getByTitle('自動計算傷害、效力等數值'));

		expect(readField(container, '審判：教團益處')?.value).toBe('當你在 1 個回合中首次發動【審判】招式審判 1 個生物時，你可以傳送最多等於你`氣場` ×2 的格數。此移動必須讓你更接近被審判的生物。你與終點之間不需要有效果線。');

		switchLocale();

		expect(readField(container, 'Judgment Order Benefit')?.value).toBe('The first time on a turn that you use your Judgment ability to judge a creature, you can teleport up to a number of squares equal to twice your Presence score. This movement must take you closer to the judged creature. You do not need line of effect to your destination.');
	});

	it('reads the third Censor Order benefit in zh-TW with its calculated vertical pull distance', () => {
		const ability = findAbility(censor, 'censor-1-4');
		const hero = heroWithSubclass(censor, 'censor-sub-3', 1, FactoryLogic.createCharacteristics(2, 0, 0, 0, 3));

		const { container } = renderPanel(ability, hero);

		expect(readField(container, '審判：教團益處')?.value).toBe('當你在 1 個回合中首次發動【審判】招式審判 1 個生物時，你可以將被審判的生物垂直拉動最多 6 格。');
	});

	it('reads the Guardian Wild Nature Benefit with the calculator-added condition emphasis', () => {
		const ability = findAbility(beastheart, 'beastheart-1-3b');
		const hero = heroWithSubclass(beastheart, 'beastheart-sub-1', 1, FactoryLogic.createCharacteristics(2, 1, 0, 2, 1));

		const { container } = renderPanel(ability, hero);

		expectLocaleRoundTrip({
			container: container,
			label: '狂野天性益處',
			zhTW: {
				label: '狂野天性益處',
				value: '每個敵方目標都會被你的契獸**嘲諷**，直到你的下個回合開始。'
			},
			english: {
				label: 'Wild Nature Benefit',
				value: 'Each enemy target is **taunted** by your companion until the start of your next turn.'
			},
			protect: [ hero, ability ]
		});
	});

	it('reads the Prowler Wild Nature Benefit with the calculator-added condition emphasis', () => {
		const ability = findAbility(beastheart, 'beastheart-1-3b');
		const hero = heroWithSubclass(beastheart, 'beastheart-sub-2', 1, FactoryLogic.createCharacteristics(2, 1, 0, 2, 1));

		const { container } = renderPanel(ability, hero);

		expect(readField(container, '狂野天性益處')).toEqual({
			label: '狂野天性益處',
			value: '每個敵方目標都會陷入**虛弱**，直到你的下個回合開始。'
		});

		switchLocale();

		expect(readField(container, 'Wild Nature Benefit')?.value).toBe('Each enemy target is **weakened** until the start of your next turn.');
	});
});

describe('AbilityPanel static PackageContent presentation', () => {
	it('reads a Null Inertial Shield tradition benefit in zh-TW and restores the canonical English', () => {
		const ability = findAbility(nullClass, 'null-1-5');
		const hero = heroWithSubclass(nullClass, 'null-sub-1', 1, FactoryLogic.createCharacteristics(2, 1, 0, 2, 0));

		const { container } = renderPanel(ability, hero);

		expectLocaleRoundTrip({
			container: container,
			label: '掌宙大師',
			zhTW: {
				label: '掌宙大師',
				value: '每當你發動【慣性護盾】招式時，你可以接著使用免費反應動作進行撤離移動動作。'
			},
			english: {
				label: 'Chronokinetic Mastery',
				value: 'Whenever you use your Inertial Shield ability, you can then use the Disengage move action as a free triggered action.'
			},
			protect: [ hero, ability ]
		});
	});

	it('reads the Null Psionic Martial Arts benefit injected into the shared Grab ability', () => {
		const hero = heroWithSubclass(nullClass, 'null-sub-1', 1, FactoryLogic.createCharacteristics(2, 1, 0, 2, 0));

		const { container } = renderPanel(AbilityData.grab, hero);

		expectLocaleRoundTrip({
			container: container,
			label: '靈能武術',
			zhTW: {
				label: '靈能武術',
				value: '你可以使用`直覺`取代`力量`來進行檢定，以及判斷是否可以指定體型比你大的生物。'
			},
			english: {
				label: 'Psionic Martial Arts',
				value: 'You use Intuition instead of Might for the power roll and for determining if you can target creatures larger than you.'
			},
			protect: [ hero, AbilityData.grab ]
		});
	});

	it('reads a Tactician Vanguard Mark benefit in zh-TW and restores the canonical English', () => {
		const ability = findAbility(tactician, 'tactician-1-5a');
		const hero = heroWithSubclass(tactician, 'tactician-sub-3', 2, FactoryLogic.createCharacteristics(2, 0, 2, 0, 1));

		const { container } = renderPanel(ability, hero);

		expectLocaleRoundTrip({
			container: container,
			label: '標記益處',
			zhTW: {
				label: '標記益處',
				value: '當 1 個被你標記的生物試圖在你近戰基礎打擊射程內移動或遁移時，你可以使用免費反應動作並花費 2 點專注，對該生物發動 1 次近戰基礎打擊。'
			},
			english: {
				label: 'Mark Benefit',
				value: 'When a creature marked by you attempts to move or shift within distance of your melee free strike, you can use a free triggered action and spend 2 focus to make a melee free strike against that creature.'
			},
			protect: [ hero, ability ]
		});
	});
});

describe('AbilityPanel package section scope', () => {
	it('does not reach the Conduit domain prayer package, which no ability section injects', () => {
		const tags = officialPackageSectionTags();

		// The families this surface really does inject.
		expect(tags.has('censor-judgment')).toBe(true);
		expect(tags.has('inertial-shield')).toBe(true);
		expect(tags.has('mark')).toBe(true);
		expect(tags.has('feral-strike')).toBe(true);
		expect(tags.has('null-psionic-martial-arts-grab')).toBe(true);
		// Domain prayer effects hang off a Package Feature, not an ability section, so they are
		// not part of this presentation surface.
		expect(tags.has('conduit-prayer')).toBe(false);
	});

	it('renders no package benefit without a Hero', () => {
		const ability = findAbility(censor, 'censor-1-4');

		const { container } = renderPanel(ability);

		expect(readFields(container)).toEqual([]);
		expect(container.textContent).not.toContain('審判：教團益處');
	});
});

describe('AbilityPanel PackageContent tag selection and fallback', () => {
	const syntheticHost = () => FactoryLogic.createAbility({
		id: 'synthetic-package-host',
		name: 'Synthetic Package Host',
		sections: [
			FactoryLogic.createAbilitySectionPackage('synthetic-matching-tag')
		]
	});

	const syntheticHero = () => {
		const hero = FactoryLogic.createHero();
		const heroClass = FactoryLogic.createClass();
		heroClass.level = 3;
		heroClass.characteristics = FactoryLogic.createCharacteristics(2, 0, 0, 0, 2);
		heroClass.featuresByLevel[0].features.push(
			FactoryLogic.feature.createPackageContent({
				id: 'synthetic-static-benefit',
				name: 'Synthetic Static Benefit',
				description: 'You gain 1 surge.',
				tag: 'synthetic-matching-tag'
			}),
			FactoryLogic.feature.createPackageContent({
				id: 'synthetic-unsupported-benefit',
				name: 'Synthetic Unsupported Benefit',
				description: 'The target takes damage equal to your level.',
				tag: 'synthetic-matching-tag'
			}),
			FactoryLogic.feature.createPackageContent({
				id: 'synthetic-unapproved-benefit',
				name: 'Synthetic Unapproved Benefit',
				description: 'The target is slowed and takes damage equal to your level.',
				tag: 'synthetic-matching-tag'
			}),
			FactoryLogic.feature.createPackageContent({
				id: 'synthetic-nonmatching-benefit',
				name: 'Synthetic Nonmatching Benefit',
				description: 'This benefit belongs to another package.',
				tag: 'synthetic-other-tag'
			})
		);
		hero.class = heroClass;
		return hero;
	};

	it('keeps matching-tag selection and ordering, and falls back safely for every unapproved or unsupported reading', () => {
		const ability = syntheticHost();
		const hero = syntheticHero();

		const { container } = renderPanel(ability, hero);

		// The order is the one the Hero's features arrive in - by canonical name - and the
		// displayed language does not reorder it.
		expect(readFields(container)).toEqual([
			// Approved and static: the approved reading, shown as approved.
			{ label: '合成靜態益處', value: '你獲得 1 點鬥志。' },
			// No approved entry at all: the complete calculated English.
			{ label: 'Synthetic Unapproved Benefit', value: 'The target is **slowed** and takes damage equal to 3.' },
			// Approved, but the calculator rewrote a grammar no authorized projection covers: the
			// complete calculated English, never a mixed sentence.
			{ label: '合成未支援益處', value: 'The target takes damage equal to 3.' }
		]);
		// The nonmatching tag stays absent.
		expect(container.textContent).not.toContain('This benefit belongs to another package.');
		expect(container.textContent).not.toContain('Synthetic Nonmatching Benefit');

		switchLocale();

		expect(readFields(container)).toEqual([
			{ label: 'Synthetic Static Benefit', value: 'You gain 1 surge.' },
			{ label: 'Synthetic Unapproved Benefit', value: 'The target is **slowed** and takes damage equal to 3.' },
			{ label: 'Synthetic Unsupported Benefit', value: 'The target takes damage equal to 3.' }
		]);
		expect(container.textContent).not.toContain('Synthetic Nonmatching Benefit');
	});
});
