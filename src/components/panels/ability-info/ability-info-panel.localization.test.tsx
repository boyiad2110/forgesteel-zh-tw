// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AbilityInfoPanel } from '@/components/panels/ability-info/ability-info-panel';
import { AbilityUsage } from '@/enums/ability-usage';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
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

		switchLocale();

		expect(screen.getByText('Distance', { exact: true })).toBeTruthy();
		expect(screen.getByText('Target', { exact: true })).toBeTruthy();
		expect(screen.getByText('Distance / Target', { exact: true })).toBeTruthy();
		expect(screen.getByText('Trigger', { exact: true })).toBeTruthy();
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
