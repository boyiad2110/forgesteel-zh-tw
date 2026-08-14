// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AbilityInfoPanel } from '@/components/panels/ability-info/ability-info-panel';
import { Ability } from '@/models/ability';
import { AbilityUsage } from '@/enums/ability-usage';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { elementalist } from '@/data/classes/elementalist/elementalist';
import { shadow } from '@/data/classes/shadow/shadow';
import { tactician } from '@/data/classes/tactician/tactician';
import { FactoryLogic } from '@/logic/factory-logic';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' })
}));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// Locates a live ability inside production class data by its own ID. Some of these are
// nested under a Multiple feature rather than sitting at the top level, so this walks the
// data rather than assuming a shape.
const findAbility = (node: unknown, id: string, seen: Set<object> = new Set()): Ability | undefined => {
	if (!node || (typeof node !== 'object') || seen.has(node)) {
		return undefined;
	}
	seen.add(node);

	const candidate = node as Partial<Ability>;
	if ((candidate.id === id) && (typeof candidate.target === 'string') && Array.isArray(candidate.distance)) {
		return candidate as Ability;
	}

	for (const child of Object.values(node)) {
		const found = findAbility(child, id, seen);
		if (found) {
			return found;
		}
	}

	return undefined;
};

const getAbility = (root: unknown, id: string) => {
	const ability = findAbility(root, id);
	if (!ability) {
		throw new Error(`Production ability '${id}' is missing`);
	}
	return ability;
};

const makeHero = () => {
	const hero = FactoryLogic.createHero();
	hero.class = FactoryLogic.createClass();
	return hero;
};

describe('AbilityInfoPanel core metadata localization', () => {
	it('localizes the Distance, Target and Trigger labels and restores the canonical English on switching locale', () => {
		const separate = FactoryLogic.createAbility({
			id: 'separate-fields',
			name: 'Separate',
			type: FactoryLogic.type.createTrigger('Canonical trigger text'),
			distance: [ FactoryLogic.distance.createRanged(5) ],
			target: 'One creature',
			sections: []
		});
		const combined = FactoryLogic.createAbility({
			id: 'combined-fields',
			name: 'Combined',
			distance: [ FactoryLogic.distance.createMelee(1) ],
			target: 'Melee 1',
			sections: []
		});

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityInfoPanel ability={separate} />
				<AbilityInfoPanel ability={combined} />
			</LocalizationProvider>
		);

		expect(screen.getByText('射程', { exact: true })).toBeTruthy();
		expect(screen.getByText('目標', { exact: true })).toBeTruthy();
		expect(screen.getByText('射程 / 目標', { exact: true })).toBeTruthy();
		expect(screen.getByText('觸發', { exact: true })).toBeTruthy();
		// A combined value with no approved target reading stays canonical: the fix carries an
		// approved target through, it does not invent a translation for a distance.
		expect(screen.getByText('Melee 1', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Distance', { exact: true })).toBeTruthy();
		expect(screen.getByText('Target', { exact: true })).toBeTruthy();
		expect(screen.getByText('Distance / Target', { exact: true })).toBeTruthy();
		expect(screen.getByText('Trigger', { exact: true })).toBeTruthy();
		expect(screen.getByText('Melee 1', { exact: true })).toBeTruthy();
	});

	it('localizes the approved player-facing action types and restores the canonical English on switching locale', () => {
		const abilities = [
			[ 'main', FactoryLogic.type.createMain() ],
			[ 'maneuver', FactoryLogic.type.createManeuver() ],
			[ 'move', FactoryLogic.type.createMove() ],
			[ 'no-action', FactoryLogic.type.createNoAction() ],
			[ 'triggered', FactoryLogic.type.createTrigger('Canonical trigger text') ],
			[ 'free-strike', FactoryLogic.type.createFreeStrike() ]
		] as const;

		render(
			<LocalizationProvider>
				<LocaleToggle />
				{
					abilities.map(([ id, type ]) => (
						<AbilityInfoPanel
							key={id}
							ability={FactoryLogic.createAbility({
								id: id,
								name: id,
								type: type,
								distance: [ FactoryLogic.distance.createMelee(1) ],
								sections: []
							})}
						/>
					))
				}
			</LocalizationProvider>
		);

		expect(screen.getByText('主要動作', { exact: true })).toBeTruthy();
		expect(screen.getByText('機動動作', { exact: true })).toBeTruthy();
		expect(screen.getByText('移動動作', { exact: true })).toBeTruthy();
		expect(screen.getByText('無需動作', { exact: true })).toBeTruthy();
		expect(screen.getByText('反應動作', { exact: true })).toBeTruthy();
		expect(screen.getByText('基礎打擊', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Main Action', { exact: true })).toBeTruthy();
		expect(screen.getByText('Maneuver', { exact: true })).toBeTruthy();
		expect(screen.getByText('Move Action', { exact: true })).toBeTruthy();
		expect(screen.getByText('No Action', { exact: true })).toBeTruthy();
		expect(screen.getByText('Triggered Action', { exact: true })).toBeTruthy();
		expect(screen.getByText('Free Strike', { exact: true })).toBeTruthy();
	});

	it('reads a free action type with the free modifier, and never reads a free strike as a free one', () => {
		const freeMain = FactoryLogic.type.createMain({ free: true });
		const freeTriggered = FactoryLogic.type.createTrigger('Canonical trigger text', { free: true });
		const freeFreeStrike = { ...FactoryLogic.type.createFreeStrike(), free: true };

		render(
			<LocalizationProvider>
				<LocaleToggle />
				{
					[ freeMain, freeTriggered, freeFreeStrike ].map((type, index) => (
						<AbilityInfoPanel
							key={index}
							ability={FactoryLogic.createAbility({
								id: `free-${index}`,
								name: `free-${index}`,
								type: type,
								distance: [ FactoryLogic.distance.createMelee(1) ],
								sections: []
							})}
						/>
					))
				}
			</LocalizationProvider>
		);

		expect(screen.getByText('免費主要動作', { exact: true })).toBeTruthy();
		expect(screen.getByText('免費反應動作', { exact: true })).toBeTruthy();
		expect(screen.getByText('基礎打擊', { exact: true })).toBeTruthy();
		expect(screen.queryByText('免費基礎打擊', { exact: true })).toBeNull();
		expect(screen.queryByText('免費', { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getByText('Free Main Action', { exact: true })).toBeTruthy();
		expect(screen.getByText('Free Triggered Action', { exact: true })).toBeTruthy();
		expect(screen.getByText('Free Free Strike', { exact: true })).toBeTruthy();
		expect(freeMain.free).toBe(true);
		expect(freeTriggered.free).toBe(true);
		expect(freeFreeStrike.free).toBe(true);
		expect(freeFreeStrike.usage).toBe(AbilityUsage.FreeStrike);
	});

	it('keeps the order and the qualifiers beside a localized action type, and leaves an unapproved action type whole', () => {
		const withSupplementaryData = { ...FactoryLogic.type.createMain({ qualifiers: [ 'Qualifier A', 'Qualifier B' ] }), order: 2 };
		const types = [
			withSupplementaryData,
			FactoryLogic.type.createVillainAction(1),
			FactoryLogic.type.createChampionAction(),
			FactoryLogic.type.createTime('Respite Activity')
		];

		render(
			<LocalizationProvider>
				<LocaleToggle />
				{
					types.map((type, index) => (
						<AbilityInfoPanel
							key={index}
							ability={FactoryLogic.createAbility({
								id: `type-${index}`,
								name: `type-${index}`,
								type: type,
								distance: [ FactoryLogic.distance.createMelee(1) ],
								sections: []
							})}
						/>
					))
				}
			</LocalizationProvider>
		);

		expect(screen.getByText('主要動作 2 (Qualifier A) (Qualifier B)', { exact: true })).toBeTruthy();
		expect(screen.getByText('Villain Action 1', { exact: true })).toBeTruthy();
		expect(screen.getByText('Champion Action', { exact: true })).toBeTruthy();
		expect(screen.getByText('Respite Activity', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Main Action 2 (Qualifier A) (Qualifier B)', { exact: true })).toBeTruthy();
		expect(screen.getByText('Villain Action 1', { exact: true })).toBeTruthy();
		expect(screen.getByText('Champion Action', { exact: true })).toBeTruthy();
		expect(screen.getByText('Respite Activity', { exact: true })).toBeTruthy();
		expect(withSupplementaryData.order).toBe(2);
		expect(withSupplementaryData.qualifiers).toEqual([ 'Qualifier A', 'Qualifier B' ]);
	});

	it('leaves the ability and its distance, target and trigger content untouched when the locale changes', () => {
		const ability = FactoryLogic.createAbility({
			id: 'canonical-ability',
			name: 'Canonical Ability',
			type: FactoryLogic.type.createTrigger('A creature within range attacks you'),
			distance: [ FactoryLogic.distance.createRanged(10) ],
			target: 'Two creatures or objects',
			sections: []
		});
		const serializedBefore = JSON.stringify(ability);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityInfoPanel ability={ability} />
			</LocalizationProvider>
		);

		expect(screen.getByText('Ranged 10', { exact: true })).toBeTruthy();
		expect(screen.getByText('Two creatures or objects', { exact: true })).toBeTruthy();
		expect(screen.getByText('A creature within range attacks you', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Ranged 10', { exact: true })).toBeTruthy();
		expect(screen.getByText('Two creatures or objects', { exact: true })).toBeTruthy();
		expect(screen.getByText('A creature within range attacks you', { exact: true })).toBeTruthy();
		expect(ability.type.usage).toBe(AbilityUsage.Trigger);
		expect(ability.type.free).toBe(false);
		expect(JSON.stringify(ability)).toBe(serializedBefore);
	});
});

describe('AbilityInfoPanel combined Distance / Target localization', () => {
	// One approved reading per affected canonical value: Tactician contributes the only
	// 'Special' case and the merged classes contribute 'Self'. These are production
	// abilities read from live class data, not fixtures.
	const combinedCases = [
		{ id: 'tactician-1-5b', root: tactician, canonical: 'Special', localized: '特殊' },
		{ id: 'elementalist-1-6', root: elementalist, canonical: 'Self', localized: '自身' },
		{ id: 'shadow-1-5', root: shadow, canonical: 'Self', localized: '自身' }
	];

	combinedCases.forEach(({ id, root, canonical, localized }) => {
		it(`shows the approved target reading in the combined field for ${id} and restores the canonical English`, () => {
			const ability = getAbility(root, id);
			const serializedBefore = JSON.stringify(ability);

			render(
				<LocalizationProvider>
					<LocaleToggle />
					<AbilityInfoPanel ability={ability} />
				</LocalizationProvider>
			);

			// The field really is the combined one, and it reads as the approved target.
			expect(screen.getByText('射程 / 目標', { exact: true })).toBeTruthy();
			expect(screen.getByText(localized, { exact: true })).toBeTruthy();
			expect(screen.queryByText(canonical, { exact: true })).toBeNull();
			// It is one field, not a collapsed pair.
			expect(screen.queryByText('射程', { exact: true })).toBeNull();
			expect(screen.queryByText('目標', { exact: true })).toBeNull();

			switchLocale();

			expect(screen.getByText('Distance / Target', { exact: true })).toBeTruthy();
			expect(screen.getByText(canonical, { exact: true })).toBeTruthy();
			expect(screen.queryByText(localized, { exact: true })).toBeNull();

			expect(ability.target).toBe(canonical);
			expect(JSON.stringify(ability)).toBe(serializedBefore);
		});
	});

	it('keeps separate Distance and Target fields, each with its own reading, when the canonical values differ', () => {
		const ability = getAbility(tactician, 'tactician-ability-2');
		const serializedBefore = JSON.stringify(ability);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityInfoPanel ability={ability} />
			</LocalizationProvider>
		);

		expect(screen.getByText('射程', { exact: true })).toBeTruthy();
		expect(screen.getByText('目標', { exact: true })).toBeTruthy();
		expect(screen.queryByText('射程 / 目標', { exact: true })).toBeNull();
		// The distance keeps its canonical reading, joined across both authored distances;
		// only the target is localized.
		expect(screen.getByText('Melee 1 or Ranged 5', { exact: true })).toBeTruthy();
		expect(screen.getByText('1 個生物或物體', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Melee 1 or Ranged 5', { exact: true })).toBeTruthy();
		expect(screen.getByText('One creature or object', { exact: true })).toBeTruthy();
		expect(JSON.stringify(ability)).toBe(serializedBefore);
	});

	it('reads the same way in a Hero calculation context, where the distance is computed with a Hero', () => {
		const hero = makeHero();
		const markTrigger = getAbility(tactician, 'tactician-1-5b');
		const hesitation = getAbility(shadow, 'shadow-1-5');
		const serializedHero = JSON.stringify(hero);
		const serializedAbilities = JSON.stringify([ markTrigger, hesitation ]);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityInfoPanel ability={markTrigger} hero={hero} />
				<AbilityInfoPanel ability={hesitation} hero={hero} />
			</LocalizationProvider>
		);

		expect(screen.getAllByText('射程 / 目標', { exact: true })).toHaveLength(2);
		expect(screen.getByText('特殊', { exact: true })).toBeTruthy();
		expect(screen.getByText('自身', { exact: true })).toBeTruthy();
		expect(screen.queryByText('Special', { exact: true })).toBeNull();
		expect(screen.queryByText('Self', { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getAllByText('Distance / Target', { exact: true })).toHaveLength(2);
		expect(screen.getByText('Special', { exact: true })).toBeTruthy();
		expect(screen.getByText('Self', { exact: true })).toBeTruthy();

		expect(JSON.stringify(hero)).toBe(serializedHero);
		expect(JSON.stringify([ markTrigger, hesitation ])).toBe(serializedAbilities);
	});
});
