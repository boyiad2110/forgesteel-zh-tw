// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { ConfigChoice } from '@/components/features/feature-data/choice';
import { ConfigClassAbility } from '@/components/features/feature-data/class-ability';
import { ConfigLanguageChoice } from '@/components/features/feature-data/language-choice';
import { ConfigPerk } from '@/components/features/feature-data/perk';
import { ConfigSkillChoice } from '@/components/features/feature-data/skill-choice';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LanguageType } from '@/enums/language-type';
import { PerkList } from '@/enums/perk-list';
import { SkillList } from '@/enums/skill-list';
import { FeatureType } from '@/enums/feature-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { Feature, FeatureChoiceData, FeatureClassAbilityData, FeatureLanguageChoiceData, FeaturePerkData, FeatureSkillChoiceData } from '@/models/feature';
import { Hero } from '@/models/hero';
import { Options } from '@/models/options';
import { Perk } from '@/models/perk';
import { Sourcebook } from '@/models/sourcebook';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions
}));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));

// jsdom has no ResizeObserver, which antd's popups need before they will draw.
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

afterEach(cleanup);

const renderLocalized = (content: ReactNode) => render(
	<LocalizationProvider>
		<LocaleToggle />
		{content}
	</LocalizationProvider>
);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const createHero = (): Hero => ({ ...FactoryLogic.createHero(), id: 'hero-1' });

const createFeature = (id: string, name: string): Feature => FactoryLogic.feature.create({ id: id, name: name, description: `${name} description.` });

describe('ConfigChoice localization', () => {
	it('reads the choose-count message and hands back the canonical feature on select and remove', () => {
		const optionA = createFeature('option-a', 'Option A');
		const optionB = createFeature('option-b', 'Option B');
		const setData = vi.fn();
		const data: FeatureChoiceData = {
			options: [ { feature: optionA, value: 1 }, { feature: optionB, value: 1 } ],
			count: 2,
			selectAt: 'build',
			selected: [ optionA ]
		};
		const serializedData = JSON.stringify(data);

		renderLocalized(
			<ConfigChoice
				data={data}
				feature={createFeature('choice-feature', 'Choice Feature')}
				hero={createHero()}
				sourcebooks={[]}
				setData={setData}
			/>
		);

		expect(screen.getByText('選擇 2 個項目。', { exact: true })).toBeTruthy();
		expect(screen.getByText('選擇 1 個項目', { exact: true })).toBeTruthy();

		// Removing the selected option returns canonical FeatureData, not display text.
		fireEvent.click(screen.getByTitle('移除'));

		expect(setData).toHaveBeenCalledTimes(1);
		const removed = setData.mock.calls[0][0] as FeatureChoiceData;
		expect(removed.selected).toEqual([]);
		expect(removed.count).toBe(2);
		expect(removed.options.map(option => option.feature.id)).toEqual([ 'option-a', 'option-b' ]);
		expect(removed.options.map(option => option.feature.name)).toEqual([ 'Option A', 'Option B' ]);

		switchLocale();

		expect(screen.getByText('Choose 2 option(s).', { exact: true })).toBeTruthy();
		expect(screen.getByText('Choose an option', { exact: true })).toBeTruthy();
		// The panel is controlled: its own props were never mutated by either locale.
		expect(JSON.stringify(data)).toBe(serializedData);
		expect(setData).toHaveBeenCalledTimes(1);
	});

	it('reads the remaining-points message while the points calculation stays identical', () => {
		const cheap = createFeature('cheap', 'Cheap Option');
		const costly = createFeature('costly', 'Costly Option');
		const data: FeatureChoiceData = {
			options: [ { feature: cheap, value: 2 }, { feature: costly, value: 3 } ],
			count: 5,
			selectAt: 'build',
			selected: [ cheap ]
		};

		renderLocalized(
			<ConfigChoice
				data={data}
				feature={createFeature('points-feature', 'Points Feature')}
				hero={createHero()}
				sourcebooks={[]}
				setData={vi.fn()}
			/>
		);

		// 5 points, 2 spent on the selected option.
		expect(screen.getByText('你還有 3 點可以花費。', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('You have 3 point(s) to spend.', { exact: true })).toBeTruthy();
	});

	it('reads the empty message when nothing is left to choose', () => {
		const only = createFeature('only', 'Only Option');
		const data: FeatureChoiceData = {
			options: [ { feature: only, value: 1 } ],
			count: 2,
			selectAt: 'build',
			selected: []
		};

		renderLocalized(
			<ConfigChoice
				data={{ ...data, selected: [ only ] }}
				feature={createFeature('empty-feature', 'Empty Feature')}
				hero={createHero()}
				sourcebooks={[]}
				setData={vi.fn()}
			/>
		);

		expect(screen.getByText('此特性沒有需要選擇的項目。', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('There are no options to choose for this feature.', { exact: true })).toBeTruthy();
	});

	it('reads the any-ancestry toggle, its extended button and its rules warning', () => {
		const ancestryOption = createFeature('ancestry-option', 'Ancestry Option');
		const ancestry = FactoryLogic.createAncestry();
		ancestry.features = [
			FactoryLogic.feature.createChoice({
				id: 'ancestry-choice',
				options: [ { feature: createFeature('other-ancestry-option', 'Other Ancestry Option'), value: 1 } ],
				count: 'ancestry'
			})
		];
		const sourcebook: Sourcebook = { ...FactoryLogic.createSourcebook(), id: 'sourcebook-1', ancestries: [ ancestry ] };
		const hero = createHero();
		hero.ancestry = FactoryLogic.createAncestry();

		const data: FeatureChoiceData = {
			options: [ { feature: ancestryOption, value: 1 } ],
			count: 'ancestry',
			selectAt: 'build',
			selected: []
		};

		renderLocalized(
			<ConfigChoice
				data={data}
				feature={createFeature('ancestry-feature', 'Ancestry Feature')}
				hero={hero}
				sourcebooks={[ sourcebook ]}
				setData={vi.fn()}
			/>
		);

		expect(screen.getByText('從任意族裔選擇 1 個特性', { exact: true })).toBeTruthy();
		expect(screen.getByText('選擇 1 個項目', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByText('從任意族裔選擇 1 個特性', { exact: true }));

		expect(screen.getByText('選擇 1 個項目（擴充）', { exact: true })).toBeTruthy();
		expect(screen.getByText('這通常不符合規則。', { exact: true })).toBeTruthy();

		switchLocale();

		// The toggle keeps its state; only the reading of it changes.
		expect(screen.getByText('Choose a feature from any ancestry', { exact: true })).toBeTruthy();
		expect(screen.getByText('Choose an option (extended)', { exact: true })).toBeTruthy();
		expect(screen.getByText('This is typically against the rules.', { exact: true })).toBeTruthy();
	});
});

describe('ConfigClassAbility localization', () => {
	const createAbilityClass = () => {
		const heroClass = FactoryLogic.createClass();
		heroClass.id = 'class-1';
		heroClass.name = 'Test Class';
		heroClass.abilities = [
			FactoryLogic.createAbility({ id: 'ability-1', name: 'Canonical Ability One', description: 'One.', cost: 5, sections: [] }),
			FactoryLogic.createAbility({ id: 'ability-2', name: 'Canonical Ability Two', description: 'Two.', cost: 5, sections: [] }),
			FactoryLogic.createAbility({ id: 'signature-1', name: 'Canonical Signature', description: 'Sig.', cost: 'signature', sections: [] })
		];
		return heroClass;
	};

	const createData = (overrides: Partial<FeatureClassAbilityData>): FeatureClassAbilityData => ({
		classID: undefined,
		cost: 5,
		source: {
			fromClassAbilities: true,
			fromSelectedSubclassAbilities: true,
			fromUnselectedSubclassAbilities: false,
			fromClassLevels: false,
			fromSelectedSubclassLevels: false,
			fromUnselectedSubclassLevels: false
		},
		minLevel: 1,
		count: 1,
		selectedIDs: [],
		...overrides
	});

	const renderConfig = (data: FeatureClassAbilityData, setData = vi.fn()) => {
		const hero = createHero();
		hero.class = createAbilityClass();

		renderLocalized(
			<ConfigClassAbility
				data={data}
				feature={createFeature('class-ability-feature', 'Class Ability Feature')}
				hero={hero}
				sourcebooks={[]}
				setData={setData}
			/>
		);

		return { hero: hero, setData: setData };
	};

	it('reads the four cost and count variants of the selection message', () => {
		const { rerender } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<ConfigClassAbility
					data={createData({ cost: 5, count: 1 })}
					feature={createFeature('f', 'F')}
					hero={(() => { const hero = createHero(); hero.class = createAbilityClass(); return hero; })()}
					sourcebooks={[]}
					setData={vi.fn()}
				/>
			</LocalizationProvider>
		);

		expect(screen.getByText('選擇 1 個 5 費招式。', { exact: true })).toBeTruthy();

		const withData = (data: FeatureClassAbilityData) => {
			const hero = createHero();
			hero.class = createAbilityClass();
			rerender(
				<LocalizationProvider>
					<LocaleToggle />
					<ConfigClassAbility
						data={data}
						feature={createFeature('f', 'F')}
						hero={hero}
						sourcebooks={[]}
						setData={vi.fn()}
					/>
				</LocalizationProvider>
			);
		};

		withData(createData({ cost: 5, count: 2 }));
		expect(screen.getByText('選擇 2 個 5 費招式。', { exact: true })).toBeTruthy();

		withData(createData({ cost: 'signature', count: 1 }));
		expect(screen.getByText('選擇 1 個招牌招式。', { exact: true })).toBeTruthy();

		withData(createData({ cost: 'signature', count: 2 }));
		expect(screen.getByText('選擇 2 個招牌招式。', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Choose 2 signature abilities.', { exact: true })).toBeTruthy();
	});

	it('reads the choose and empty messages while costs, IDs and class data stay canonical', () => {
		const setData = vi.fn();
		const data = createData({ cost: 5, count: 2, selectedIDs: [ 'ability-1' ] });
		const serializedData = JSON.stringify(data);
		const { hero } = renderConfig(data, setData);
		const serializedHero = JSON.stringify(hero);

		expect(screen.getByText('選擇 1 個招式', { exact: true })).toBeTruthy();
		// The selected ability's own name and description are game content, not this batch.
		expect(screen.getByText('Canonical Ability One', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByTitle('移除'));

		expect(setData).toHaveBeenCalledTimes(1);
		const removed = setData.mock.calls[0][0] as FeatureClassAbilityData;
		expect(removed.selectedIDs).toEqual([]);
		expect(removed.cost).toBe(5);
		expect(typeof removed.cost).toBe('number');
		expect(removed.classID).toBeUndefined();

		switchLocale();

		expect(screen.getByText('Choose an ability', { exact: true })).toBeTruthy();
		expect(screen.getByText('Canonical Ability One', { exact: true })).toBeTruthy();
		expect(JSON.stringify(data)).toBe(serializedData);
		expect(JSON.stringify(hero)).toBe(serializedHero);
	});

	it('keeps a signature cost canonical through a locale switch and a removal', () => {
		const setData = vi.fn();
		const data = createData({ cost: 'signature', count: 2, selectedIDs: [ 'signature-1' ] });
		renderConfig(data, setData);

		switchLocale();

		fireEvent.click(screen.getByTitle('Remove'));

		const removed = setData.mock.calls[0][0] as FeatureClassAbilityData;
		expect(removed.cost).toBe('signature');
		expect(removed.selectedIDs).toEqual([]);
		expect(data.selectedIDs).toEqual([ 'signature-1' ]);
	});

	it('reads the empty message when the class offers nothing at that cost', () => {
		renderConfig(createData({ cost: 9, count: 1 }));

		expect(screen.getByText('此特性沒有需要選擇的項目。', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('There are no options to choose for this feature.', { exact: true })).toBeTruthy();
	});
});

describe('ConfigPerk localization', () => {
	const createTestPerk = (id: string, name: string): Perk => ({
		...FactoryLogic.feature.create({ id: id, name: name, description: `${name} description.` }),
		list: PerkList.Crafting
	});

	const createData = (overrides: Partial<FeaturePerkData>): FeaturePerkData => ({
		lists: [ PerkList.Crafting ],
		count: 1,
		selected: [],
		...overrides
	});

	const renderConfig = (data: FeaturePerkData, perks: Perk[], setData = vi.fn()) => {
		const sourcebook: Sourcebook = { ...FactoryLogic.createSourcebook(), id: 'sourcebook-1', perks: perks };

		renderLocalized(
			<ConfigPerk
				data={data}
				feature={createFeature('perk-feature', 'Perk Feature')}
				hero={createHero()}
				sourcebooks={[ sourcebook ]}
				setData={setData}
			/>
		);

		return setData;
	};

	it('reads the choose button and keeps the canonical perk object on removal', () => {
		const perk = createTestPerk('perk-1', 'Canonical Perk');
		const data = createData({ count: 1, selected: [ perk ] });
		const setData = renderConfig(data, [ perk ]);

		expect(screen.getByText('Canonical Perk', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByTitle('移除'));

		const removed = setData.mock.calls[0][0] as FeaturePerkData;
		expect(removed.selected).toEqual([]);
		expect(removed.lists).toEqual([ PerkList.Crafting ]);
		expect(data.selected.map(p => p.id)).toEqual([ 'perk-1' ]);
	});

	it('reads the counted variant and the choose button, and restores the canonical English', () => {
		const perk = createTestPerk('perk-1', 'Canonical Perk');
		renderConfig(createData({ count: 2 }), [ perk ]);

		expect(screen.getByText('選擇 2 個專長：', { exact: true })).toBeTruthy();
		expect(screen.getByText('選擇 1 個專長', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Choose 2:', { exact: true })).toBeTruthy();
		expect(screen.getByText('Choose a perk', { exact: true })).toBeTruthy();
	});

	it('reads the empty message when no perk is on the allowed lists', () => {
		renderConfig(createData({ count: 1 }), []);

		expect(screen.getByText('此特性沒有需要選擇的項目。', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('There are no options to choose for this feature.', { exact: true })).toBeTruthy();
	});
});

describe('ConfigSkillChoice localization', () => {
	const createData = (overrides: Partial<FeatureSkillChoiceData>): FeatureSkillChoiceData => ({
		options: [ 'Alchemy' ],
		listOptions: [],
		count: 2,
		selectAt: 'build',
		selected: [],
		...overrides
	});

	const renderConfig = (data: FeatureSkillChoiceData, hero: Hero, setData = vi.fn()) => {
		const sourcebook: Sourcebook = {
			...FactoryLogic.createSourcebook(),
			id: 'sourcebook-1',
			skills: [ { name: 'Alchemy', description: 'Alchemy description.', list: SkillList.Crafting } ]
		};

		renderLocalized(
			<ConfigSkillChoice
				data={data}
				feature={createFeature('skill-feature', 'Skill Feature')}
				hero={hero}
				sourcebooks={[ sourcebook ]}
				setData={setData}
			/>
		);

		return setData;
	};

	it('reads the choose button and hands back the canonical skill name on removal', () => {
		const data = createData({ selected: [ 'Alchemy' ] });
		const setData = renderConfig(data, createHero());

		expect(screen.getByText('選擇 1 個技能', { exact: true })).toBeTruthy();
		// The skill's own name and description are canonical game content in either locale.
		expect(screen.getByText('Alchemy', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByTitle('移除'));

		const removed = setData.mock.calls[0][0] as FeatureSkillChoiceData;
		expect(removed.selected).toEqual([]);
		expect(removed.options).toEqual([ 'Alchemy' ]);
		expect(data.selected).toEqual([ 'Alchemy' ]);

		switchLocale();

		expect(screen.getByText('Choose a Skill', { exact: true })).toBeTruthy();
		expect(screen.getByText('Alchemy', { exact: true })).toBeTruthy();
	});

	it('reads the duplicate warning while the duplicated skill name stays canonical', () => {
		const hero = createHero();
		const duplicateFeature = FactoryLogic.feature.createSkillChoice({ id: 'duplicate-skills', options: [ 'Alchemy' ], count: 2 });
		if (duplicateFeature.type !== FeatureType.SkillChoice) {
			throw new Error('createSkillChoice no longer produces a skill choice');
		}
		duplicateFeature.data.selected = [ 'Alchemy', 'Alchemy' ];
		hero.features = [ duplicateFeature ];

		renderConfig(duplicateFeature.data, hero);

		expect(screen.getAllByText('已重複').length).toBeGreaterThan(0);
		expect(screen.getAllByText('你已經擁有此技能。').length).toBeGreaterThan(0);

		switchLocale();

		expect(screen.getAllByText('Duplicated').length).toBeGreaterThan(0);
		expect(screen.getAllByText('You already have this skill.').length).toBeGreaterThan(0);
		expect(duplicateFeature.data.selected).toEqual([ 'Alchemy', 'Alchemy' ]);
	});
});

describe('ConfigLanguageChoice localization', () => {
	const createData = (overrides: Partial<FeatureLanguageChoiceData>): FeatureLanguageChoiceData => ({
		options: [],
		allowedTypes: [ LanguageType.Common ],
		count: 2,
		selectAt: 'build',
		selected: [],
		...overrides
	});

	const renderConfig = (data: FeatureLanguageChoiceData, setData = vi.fn()) => {
		const sourcebook: Sourcebook = {
			...FactoryLogic.createSourcebook(),
			id: 'sourcebook-1',
			languages: [ { name: 'Caelian', description: 'Caelian description.', type: LanguageType.Common, related: [] } ]
		};

		renderLocalized(
			<ConfigLanguageChoice
				data={data}
				feature={createFeature('language-feature', 'Language Feature')}
				hero={createHero()}
				sourcebooks={[ sourcebook ]}
				setData={setData}
			/>
		);

		return setData;
	};

	it('reads the choose button and hands back the canonical language name on removal', () => {
		const data = createData({ selected: [ 'Caelian' ] });
		const setData = renderConfig(data);

		expect(screen.getByText('選擇 1 種語言', { exact: true })).toBeTruthy();
		expect(screen.getByText('Caelian', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByTitle('移除'));

		const removed = setData.mock.calls[0][0] as FeatureLanguageChoiceData;
		expect(removed.selected).toEqual([]);
		expect(removed.allowedTypes).toEqual([ LanguageType.Common ]);
		expect(data.selected).toEqual([ 'Caelian' ]);

		switchLocale();

		expect(screen.getByText('Choose a language', { exact: true })).toBeTruthy();
		expect(screen.getByText('Caelian', { exact: true })).toBeTruthy();
	});
});
