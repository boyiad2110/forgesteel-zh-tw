// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { ClassSection } from '@/components/pages/heroes/hero-edit/class-section/class-section';
import { Characteristic } from '@/enums/characteristic';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { HeroClass } from '@/models/class';
import { Options } from '@/models/options';
import { Sourcebook } from '@/models/sourcebook';
import { SubClass } from '@/models/subclass';
import { Utils } from '@/utils/utils';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
const testDataManager = { saveOptions: vi.fn().mockResolvedValue(undefined) };
vi.mock('@/contexts/data-context', () => ({
	useHeroes: () => [],
	useDataManager: () => testDataManager,
	useOptions: () => testOptions
}));

vi.mock('@/hooks/use-is-small', () => ({ useIsSmall: () => false }));
vi.mock('@/hooks/use-navigation', () => ({ useNavigation: () => ({ goToHeroView: vi.fn(), goToHeroEdit: vi.fn() }) }));

// The game-content panels are a later batch. The subclass panel is reduced to the canonical
// identity it is handed, so the info button's callback can still be observed.
vi.mock('@/components/panels/elements/class-panel/class-panel', () => ({ ClassPanel: () => null }));
vi.mock('@/components/panels/elements/subclass-panel/subclass-panel', () => ({
	SubclassPanel: ({ subclass }: { subclass: SubClass }) => <output data-testid='subclass-detail'>{subclass.id}</output>
}));

// jsdom has no ResizeObserver, which antd's popups need before they will draw.
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

const testSourcebook: Sourcebook = { ...FactoryLogic.createSourcebook(), id: 'sourcebook-1' };

const createClass = (overrides: Partial<HeroClass>): HeroClass => ({
	...FactoryLogic.createClass(),
	id: 'class-1',
	name: 'Test Class',
	subclassName: 'Order',
	subclassCount: 1,
	primaryCharacteristicsOptions: [ [ Characteristic.Might ] ],
	primaryCharacteristics: [ Characteristic.Might ],
	characteristics: [ { characteristic: Characteristic.Might, value: 2 } ],
	...overrides
});

const createHero = (heroClass: HeroClass, xp = 0): Hero => ({
	...FactoryLogic.createHero(),
	id: 'hero-1',
	class: heroClass,
	state: { ...FactoryLogic.createHeroState(), xp: xp }
});

const callbacks = {
	selectClass: vi.fn(),
	setLevel: vi.fn(),
	selectPrimaryCharacteristics: vi.fn(),
	selectCharacteristics: vi.fn(),
	addSubclass: vi.fn(),
	removeSubclass: vi.fn(),
	setFeatureData: vi.fn()
};

const renderClassSection = (hero: Hero) => {
	Object.values(callbacks).forEach(callback => callback.mockClear());

	return render(
		<LocalizationProvider>
			<LocaleToggle />
			<ClassSection hero={hero} sourcebooks={[ testSourcebook ]} searchTerm='' {...callbacks} />
		</LocalizationProvider>
	);
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const isDrawn = (text: string) => screen.queryAllByText(text).length > 0;

const expectOnly = (drawn: string[], notDrawn: string[]) => {
	expect(drawn.filter(isDrawn)).toEqual(drawn);
	expect(notDrawn.filter(isDrawn)).toEqual([]);
};

// This suite does not run with vitest globals, so the rendered tree is torn down here
// rather than by the testing library's automatic cleanup.
afterEach(cleanup);

describe('ClassSection level panel', () => {
	it('draws the approved zh-TW level copy and canonical English in the English locale, and keeps XP and the level number canonical in both', () => {
		// Enough XP that the class can advance, so the advance action is drawn too.
		renderClassSection(createHero(createClass({ level: 3 }), 9999));

		expectOnly([ '等級', 'XP', '提升至 4 級' ], [ 'Level', 'Advance to level 4' ]);

		switchLocale();

		expectOnly([ 'Level', 'XP', 'Advance to level 4' ], [ '等級', '提升至 4 級' ]);
	});

	it('advances by the canonical level number when the approved zh-TW action is used', () => {
		renderClassSection(createHero(createClass({ level: 3 }), 9999));

		fireEvent.click(screen.getByRole('button', { name: '提升至 4 級' }));

		expect(callbacks.setLevel).toHaveBeenCalledTimes(1);
		expect(callbacks.setLevel).toHaveBeenCalledWith(4);
	});
});

describe('ClassSection level groupings', () => {
	it('draws the approved zh-TW group titles and empty-level message, and canonical English in the English locale', () => {
		renderClassSection(createHero(createClass({})));

		expectOnly([ '範型選項', '1 級選項' ], [ 'Class Choices', 'Level 1 Choices' ]);

		// The level 1 group has no choices in it; its message shows once it is opened.
		fireEvent.click(screen.getByText('1 級選項'));
		expect(isDrawn('此等級沒有需要選擇的項目')).toBe(true);
		expect(isDrawn('Nothing to choose for this level')).toBe(false);

		switchLocale();

		expectOnly([ 'Class Choices', 'Level 1 Choices', 'Nothing to choose for this level' ], [ '範型選項', '1 級選項', '此等級沒有需要選擇的項目' ]);
	});
});

describe('ClassSection characteristics', () => {
	it('draws the approved zh-TW primary characteristics prompt, and canonical English in the English locale', () => {
		const heroClass = createClass({
			primaryCharacteristicsOptions: [ [ Characteristic.Might ], [ Characteristic.Agility ] ],
			primaryCharacteristics: []
		});
		renderClassSection(createHero(heroClass));

		expectOnly(
			[ '屬性', '你的範型允許你選擇主要屬性。', '選擇你的主要屬性' ],
			[ 'Characteristics', 'Your class allows you to choose your primary characteristics.', 'Select your primary characteristics' ]
		);

		switchLocale();

		expectOnly(
			[ 'Characteristics', 'Your class allows you to choose your primary characteristics.', 'Select your primary characteristics' ],
			[ '屬性', '你的範型允許你選擇主要屬性。', '選擇你的主要屬性' ]
		);
	});

	it('draws the approved zh-TW value-array copy around the canonical characteristic names, and canonical English in the English locale', () => {
		const heroClass = createClass({
			primaryCharacteristics: [ Characteristic.Might, Characteristic.Agility ],
			characteristics: []
		});
		renderClassSection(createHero(heroClass));

		// The characteristics themselves are canonical values, interpolated as they are and
		// still emphasized wherever the sentence puts them.
		const sentence = () => {
			const emphasized = screen.getByText('Might and Agility');
			expect(emphasized.tagName).toBe('B');
			return emphasized.parentElement!.textContent;
		};

		expect(sentence()).toBe('你的Might and Agility起始值為 2。請為其他屬性選擇 1 組數值。');

		switchLocale();

		expect(sentence()).toBe('You start with a 2 in Might and Agility. Choose the set of values you\'d like for your other characteristics.');
	});

	it('draws the approved zh-TW characteristics prompt once a value array is picked, and canonical English in the English locale', () => {
		const heroClass = createClass({
			primaryCharacteristics: [ Characteristic.Might, Characteristic.Agility ],
			characteristics: []
		});
		renderClassSection(createHero(heroClass));

		fireEvent.click(screen.getAllByRole('button', { name: /^[0-9-]+(, [0-9-]+)+$/ })[0]);

		expectOnly([ '選擇你的屬性。' ], [ 'Choose your characteristics.' ]);

		switchLocale();

		expectOnly([ 'Choose your characteristics.' ], [ '選擇你的屬性。' ]);
	});
});

describe('ClassSection subclasses', () => {
	it('draws the approved zh-TW singular prompt around the canonical subclass name, for both English articles', () => {
		// 'Order' takes 'an' in English; 'Path' takes 'a'. Neither distinction survives into zh-TW.
		const vowel = renderClassSection(createHero(createClass({ subclassName: 'Order' })));

		expect(isDrawn('選擇 1 個 Order。')).toBe(true);
		expect(isDrawn('Choose an Order.')).toBe(false);

		switchLocale();
		expect(isDrawn('Choose an Order.')).toBe(true);
		expect(isDrawn('選擇 1 個 Order。')).toBe(false);

		vowel.unmount();
		renderClassSection(createHero(createClass({ subclassName: 'Path' })));

		expect(isDrawn('選擇 1 個 Path。')).toBe(true);
		expect(isDrawn('Choose a Path.')).toBe(false);

		switchLocale();
		expect(isDrawn('Choose a Path.')).toBe(true);
		expect(isDrawn('選擇 1 個 Path。')).toBe(false);
	});

	it('draws the approved zh-TW plural prompt around the canonical subclass name and count', () => {
		renderClassSection(createHero(createClass({ subclassName: 'Order', subclassCount: 2 })));

		expect(isDrawn('選擇 2 個 Order。')).toBe(true);
		expect(isDrawn('Choose 2 Orders.')).toBe(false);
		// The heading is the class's own data, and reads the same in both locales.
		expect(isDrawn('Order')).toBe(true);

		switchLocale();

		expect(isDrawn('Choose 2 Orders.')).toBe(true);
		expect(isDrawn('選擇 2 個 Order。')).toBe(false);
		expect(isDrawn('Order')).toBe(true);
	});

	it('draws the approved zh-TW actions on a selected subclass, and keeps their behaviour canonical', () => {
		const selectedSubclass: SubClass = { ...FactoryLogic.createSubclass(), id: 'subclass-1', name: 'Test Order', selected: true };
		renderClassSection(createHero(createClass({ subclasses: [ Utils.copy(selectedSubclass) ] })));

		// With every choice made, the class group starts closed; the actions are inside it.
		fireEvent.click(screen.getByText('範型選項'));

		// The info action opens the details; the English wording it carries today stays as it is.
		expect(screen.getByTitle('查看詳細資訊')).toBeTruthy();
		expect(screen.getByTitle('移除')).toBeTruthy();
		expect(screen.queryByTitle('Select')).toBeNull();
		expect(screen.queryByTitle('Remove')).toBeNull();

		fireEvent.click(screen.getByTitle('查看詳細資訊'));
		expect(screen.getByTestId('subclass-detail').textContent).toBe('subclass-1');

		fireEvent.click(screen.getByTitle('移除'));
		expect(callbacks.removeSubclass).toHaveBeenCalledTimes(1);
		expect(callbacks.removeSubclass).toHaveBeenCalledWith('subclass-1');

		switchLocale();

		expect(screen.getByTitle('Select')).toBeTruthy();
		expect(screen.getByTitle('Remove')).toBeTruthy();
		expect(screen.queryByTitle('查看詳細資訊')).toBeNull();
		expect(screen.queryByTitle('移除')).toBeNull();
	});
});

describe('ClassSection locale switching', () => {
	it('leaves the hero and its class untouched', () => {
		const heroClass = createClass({ level: 3 });
		const hero = createHero(heroClass, 9999);
		const heroBeforeLocaleSwitch = JSON.stringify(hero);
		renderClassSection(hero);

		switchLocale();
		switchLocale();

		expect(JSON.stringify(hero)).toBe(heroBeforeLocaleSwitch);
		expect(JSON.stringify(hero)).not.toMatch(/[一-鿿]/);
		expect(hero.class!.subclassName).toBe('Order');
		expect(hero.class!.level).toBe(3);
		expect(Object.values(callbacks).every(callback => callback.mock.calls.length === 0)).toBe(true);
	});
});
