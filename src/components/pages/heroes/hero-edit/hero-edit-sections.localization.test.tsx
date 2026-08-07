// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { AncestrySection } from '@/components/pages/heroes/hero-edit/ancestry-section/ancestry-section';
import { CareerSection } from '@/components/pages/heroes/hero-edit/career-section/career-section';
import { ClassSection } from '@/components/pages/heroes/hero-edit/class-section/class-section';
import { ComplicationSection } from '@/components/pages/heroes/hero-edit/complication-section/complication-section';
import { CultureSection } from '@/components/pages/heroes/hero-edit/culture-section/culture-section';
import { DetailsSection } from '@/components/pages/heroes/hero-edit/details-section/details-section';
import { EmptyMessage } from '@/components/pages/heroes/hero-edit/empty-message/empty-message';
import { CultureData } from '@/data/culture-data';
import { Characteristic } from '@/enums/characteristic';
import { CultureType } from '@/enums/culture-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { HeroClass } from '@/models/class';
import { Options } from '@/models/options';
import { Sourcebook } from '@/models/sourcebook';
import { Utils } from '@/utils/utils';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
const testDataManager = { saveOptions: vi.fn().mockResolvedValue(undefined) };
const loadedHeroes = vi.hoisted(() => ({ current: [] as Hero[] }));
vi.mock('@/contexts/data-context', () => ({
	useHeroes: () => loadedHeroes.current,
	useDataManager: () => testDataManager,
	useOptions: () => testOptions
}));

const viewport = vi.hoisted(() => ({ isSmall: false }));
vi.mock('@/hooks/use-is-small', () => ({ useIsSmall: () => viewport.isSmall }));

const navigation = vi.hoisted(() => ({ goToHeroView: vi.fn(), goToHeroEdit: vi.fn() }));
vi.mock('@/hooks/use-navigation', () => ({ useNavigation: () => navigation }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));

// The game-content panels are a later batch. They are reduced to nothing here so the only
// text this suite sees is the section-local text it is about.
vi.mock('@/components/panels/elements/ancestry-panel/ancestry-panel', () => ({ AncestryPanel: () => null }));
vi.mock('@/components/panels/elements/career-panel/career-panel', () => ({ CareerPanel: () => null }));
vi.mock('@/components/panels/elements/class-panel/class-panel', () => ({ ClassPanel: () => null }));
vi.mock('@/components/panels/elements/complication-panel/complication-panel', () => ({ ComplicationPanel: () => null }));
vi.mock('@/components/panels/elements/culture-panel/culture-panel', () => ({ CulturePanel: () => null }));
// Tutorial mode is explicitly out of this batch's scope.
vi.mock('@/components/panels/hero-tutorial/hero-tutorial-panel', () => ({ HeroTutorialPanel: () => null }));

// jsdom has no ResizeObserver, which antd's popups need before they will draw.
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

const testSourcebook: Sourcebook = { ...FactoryLogic.createSourcebook(), id: 'sourcebook-1' };

const testClass: HeroClass = {
	...FactoryLogic.createClass(),
	id: 'class-1',
	name: 'Test Class',
	subclassName: 'Order',
	subclassCount: 1,
	primaryCharacteristicsOptions: [ [ Characteristic.Might ] ],
	primaryCharacteristics: [ Characteristic.Might ],
	characteristics: [ { characteristic: Characteristic.Might, value: 2 } ]
};

const createHero = (overrides: Partial<Hero>): Hero => ({ ...FactoryLogic.createHero(), id: 'hero-1', ...overrides });

const renderLocalized = (content: ReactNode) => {
	return render(
		<LocalizationProvider>
			<LocaleToggle />
			{content}
		</LocalizationProvider>
	);
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const isDrawn = (text: string) => screen.queryAllByText(text).length > 0;

// This suite does not run with vitest globals, so the rendered tree is torn down here
// rather than by the testing library's automatic cleanup.
afterEach(cleanup);

describe('Hero edit section choices heading', () => {
	// Every section that offers choices draws the same heading, so they are checked together.
	const sections: { name: string; content: ReactNode }[] = [
		{
			name: 'ancestry',
			content: (
				<AncestrySection
					hero={createHero({ ancestry: FactoryLogic.createAncestry() })}
					sourcebooks={[ testSourcebook ]}
					searchTerm=''
					selectAncestry={vi.fn()}
					setFeatureData={vi.fn()}
				/>
			)
		},
		{
			name: 'culture',
			content: (
				<CultureSection
					hero={createHero({ culture: Utils.copy(CultureData.bespoke) })}
					sourcebooks={[ testSourcebook ]}
					searchTerm=''
					selectCulture={vi.fn()}
					selectEnvironment={vi.fn()}
					selectOrganization={vi.fn()}
					selectUpbringing={vi.fn()}
					setFeatureData={vi.fn()}
				/>
			)
		},
		{
			name: 'career',
			content: (
				<CareerSection
					hero={createHero({ career: FactoryLogic.createCareer() })}
					sourcebooks={[ testSourcebook ]}
					searchTerm=''
					selectCareer={vi.fn()}
					selectIncitingIncident={vi.fn()}
					setFeatureData={vi.fn()}
				/>
			)
		},
		{
			name: 'class',
			content: (
				<ClassSection
					hero={createHero({ class: Utils.copy(testClass) })}
					sourcebooks={[ testSourcebook ]}
					searchTerm=''
					selectClass={vi.fn()}
					setLevel={vi.fn()}
					selectPrimaryCharacteristics={vi.fn()}
					selectCharacteristics={vi.fn()}
					addSubclass={vi.fn()}
					removeSubclass={vi.fn()}
					setFeatureData={vi.fn()}
				/>
			)
		},
		{
			name: 'complication',
			content: (
				<ComplicationSection
					hero={createHero({
						complication: {
							...FactoryLogic.createComplication(),
							features: [ FactoryLogic.feature.createLanguageChoice({ id: 'complication-language' }) ]
						}
					})}
					sourcebooks={[ testSourcebook ]}
					searchTerm=''
					selectComplication={vi.fn()}
					setFeatureData={vi.fn()}
				/>
			)
		}
	];

	sections.forEach(section => {
		it(`draws the approved zh-TW choices heading in the ${section.name} section, and canonical English in the English locale`, () => {
			renderLocalized(section.content);

			expect(isDrawn('選項')).toBe(true);
			expect(isDrawn('Choices')).toBe(false);

			switchLocale();

			expect(isDrawn('Choices')).toBe(true);
			expect(isDrawn('選項')).toBe(false);
		});
	});
});

describe('CultureSection', () => {
	const ancestryCulture = FactoryLogic.createCulture('Ancestry Culture', '', CultureType.Ancestral);
	const cultureSourcebook: Sourcebook = {
		...FactoryLogic.createSourcebook(),
		id: 'sourcebook-2',
		cultures: [
			FactoryLogic.createCulture('Ancestral Test', '', CultureType.Ancestral),
			FactoryLogic.createCulture('Professional Test', '', CultureType.Professional)
		],
		ancestries: [ { ...FactoryLogic.createAncestry(), id: 'ancestry-1', culture: ancestryCulture } ]
	};

	const renderCultureSection = (hero: Hero, sourcebooks: Sourcebook[]) => renderLocalized(
		<CultureSection
			hero={hero}
			sourcebooks={sourcebooks}
			searchTerm=''
			selectCulture={vi.fn()}
			selectEnvironment={vi.fn()}
			selectOrganization={vi.fn()}
			selectUpbringing={vi.fn()}
			setFeatureData={vi.fn()}
		/>
	);

	it('draws the approved zh-TW list headings, and canonical English in the English locale', () => {
		const approved = [ '你的族裔', '族裔文化', '專業文化', '自訂文化' ];
		const canonical = [ 'Your Ancestry', 'Ancestral Cultures', 'Professional Cultures', 'Bespoke Cultures' ];

		renderCultureSection(createHero({ ancestry: { ...FactoryLogic.createAncestry(), id: 'ancestry-1', culture: ancestryCulture } }), [ cultureSourcebook ]);

		expect(approved.filter(isDrawn)).toEqual(approved);
		expect(canonical.filter(isDrawn)).toEqual([]);

		switchLocale();

		expect(canonical.filter(isDrawn)).toEqual(canonical);
		expect(approved.filter(isDrawn)).toEqual([]);
	});

	it('draws the approved zh-TW bespoke culture copy, and canonical English in the English locale, without touching the hero', () => {
		const approved = [ '自訂文化', '為你的文化取個名稱。', '選擇你的生活環境、組織型態與成長經歷。', '選擇生活環境', '選擇組織型態', '選擇成長經歷' ];
		const canonical = [ 'Bespoke Culture', 'Choose a name for your culture.', 'Choose your Environment, Organization, and Upbringing.', 'Choose environment', 'Choose organization', 'Choose upbringing' ];

		const hero = createHero({ culture: Utils.copy(CultureData.bespoke) });
		const heroBeforeLocaleSwitch = JSON.stringify(hero);
		renderCultureSection(hero, [ testSourcebook ]);

		expect(approved.filter(isDrawn)).toEqual(approved);
		expect(canonical.filter(isDrawn)).toEqual([]);
		expect(screen.getByPlaceholderText('名稱')).toBeTruthy();

		switchLocale();

		expect(canonical.filter(isDrawn)).toEqual(canonical);
		expect(approved.filter(isDrawn)).toEqual([]);
		expect(screen.getByPlaceholderText('Name')).toBeTruthy();

		switchLocale();

		expect(approved.filter(isDrawn)).toEqual(approved);
		// Presentation only: the working copy the section was handed is untouched, and the
		// canonical culture it was copied from is still canonical.
		expect(JSON.stringify(hero)).toBe(heroBeforeLocaleSwitch);
		expect(CultureData.bespoke.id).toBe('culture-bespoke-culture');
		expect(CultureData.bespoke.name).toBe('Bespoke Culture');
	});
});

describe('CareerSection', () => {
	it('draws the approved zh-TW inciting incident copy, and canonical English in the English locale', () => {
		const approved = [ '關鍵事件', '選擇 1 個關鍵事件' ];
		const canonical = [ 'Inciting Incident', 'Choose an inciting incident' ];

		renderLocalized(
			<CareerSection
				hero={createHero({ career: FactoryLogic.createCareer() })}
				sourcebooks={[ testSourcebook ]}
				searchTerm=''
				selectCareer={vi.fn()}
				selectIncitingIncident={vi.fn()}
				setFeatureData={vi.fn()}
			/>
		);

		expect(approved.filter(isDrawn)).toEqual(approved);
		expect(canonical.filter(isDrawn)).toEqual([]);

		switchLocale();

		expect(canonical.filter(isDrawn)).toEqual(canonical);
		expect(approved.filter(isDrawn)).toEqual([]);
	});
});

describe('DetailsSection', () => {
	// The language choice carries no name of its own, so the section's own fallback label is
	// what reaches the screen; the skill choice is named, and the section ignores that name
	// in favour of its own label. Both are the section-local text this batch localizes.
	const namelessLanguageChoice = { ...FactoryLogic.feature.createLanguageChoice({ id: 'language-1' }), name: '' };
	const namedSkillChoice = FactoryLogic.feature.createSkillChoice({ id: 'skill-1', name: 'Crafting Expertise' });

	const renderDetailsSection = (hero: Hero) => renderLocalized(
		<DetailsSection
			hero={hero}
			sourcebooks={[ testSourcebook ]}
			setName={vi.fn()}
			setPicture={vi.fn()}
			setFolder={vi.fn()}
			setTutorialMode={vi.fn()}
			setFeatureData={vi.fn()}
		/>
	);

	it('draws the approved zh-TW details copy, and canonical English in the English locale, without writing zh-TW into the hero', () => {
		const approved = [ '名稱', '肖像', '選擇圖片', '資料夾', '語言選項', '技能選項', '語言', '技能' ];
		const canonical = [ 'Name', 'Portrait', 'Choose a picture', 'Folder', 'Language Choices', 'Skill Choices', 'Language', 'Skill' ];

		const hero = createHero({ features: [ namelessLanguageChoice, namedSkillChoice ] });
		const heroBeforeLocaleSwitch = JSON.stringify(hero);
		renderDetailsSection(hero);

		expect(approved.filter(isDrawn)).toEqual(approved);
		expect(canonical.filter(isDrawn)).toEqual([]);
		expect(screen.getByPlaceholderText('名稱')).toBeTruthy();
		// The folder heading and the empty folder box's placeholder both read it.
		expect(screen.getAllByText('資料夾')).toHaveLength(2);

		switchLocale();

		expect(canonical.filter(isDrawn)).toEqual(canonical);
		expect(approved.filter(isDrawn)).toEqual([]);
		expect(screen.getByPlaceholderText('Name')).toBeTruthy();
		expect(screen.getAllByText('Folder')).toHaveLength(2);

		switchLocale();

		expect(approved.filter(isDrawn)).toEqual(approved);
		// The label is drawn over the feature; it is never written into it.
		expect(JSON.stringify(hero)).toBe(heroBeforeLocaleSwitch);
		expect(JSON.stringify(hero)).not.toMatch(/[一-鿿]/);
		expect(namelessLanguageChoice.id).toBe('language-1');
		expect(namedSkillChoice.name).toBe('Crafting Expertise');
	});

	it('draws the approved zh-TW portrait label on an existing picture, and canonical English in the English locale', () => {
		renderDetailsSection(createHero({ picture: 'data:image/png;base64,AAAA' }));

		expect(screen.getByTitle('肖像')).toBeTruthy();
		expect(screen.queryByTitle('Portrait')).toBeNull();

		switchLocale();

		expect(screen.getByTitle('Portrait')).toBeTruthy();
		expect(screen.queryByTitle('肖像')).toBeNull();
	});

	it('draws the approved zh-TW folder explanation, and canonical English in the English locale', async () => {
		renderDetailsSection(createHero({}));

		fireEvent.mouseEnter(screen.getAllByRole('img', { name: 'info-circle' })[0]);
		expect(await screen.findByText('你可以將英雄加入資料夾，以便與其他英雄分組管理。')).toBeTruthy();

		switchLocale();

		expect(await screen.findByText('You can add your hero to a folder to group it with other heroes.')).toBeTruthy();
	});
});

describe('Hero edit EmptyMessage', () => {
	// Sourcebook has no approved zh-TW yet, so the sentence around the button stays English.
	const sourcebookSentence = 'Looking for something specific? If it\'s third-party or homebrew, make sure you\'ve included the sourcebook it\'s in.';

	it('draws the approved zh-TW button and canonical English in the English locale, and keeps the sourcebook sentence English throughout', () => {
		const { container } = renderLocalized(<EmptyMessage hero={createHero({})} />);

		expect(screen.getByRole('button', { name: '點擊這裡' })).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Click Here' })).toBeNull();
		expect(container.textContent).toContain(sourcebookSentence);

		switchLocale();

		expect(screen.getByRole('button', { name: 'Click Here' })).toBeTruthy();
		expect(screen.queryByRole('button', { name: '點擊這裡' })).toBeNull();
		expect(container.textContent).toContain(sourcebookSentence);
	});

	it('navigates to the canonical start page from the approved zh-TW button', () => {
		navigation.goToHeroEdit.mockClear();
		renderLocalized(<EmptyMessage hero={createHero({})} />);

		fireEvent.click(screen.getByRole('button', { name: '點擊這裡' }));

		expect(navigation.goToHeroEdit).toHaveBeenCalledTimes(1);
		expect(navigation.goToHeroEdit).toHaveBeenCalledWith('hero-1', 'start');
	});
});
