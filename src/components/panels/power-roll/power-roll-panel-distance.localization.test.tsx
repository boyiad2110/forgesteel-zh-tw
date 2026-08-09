// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { PowerRollPanel } from '@/components/panels/power-roll/power-roll-panel';
import { AbilityDistanceType } from '@/enums/ability-distance-type';
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

// Which option the selector is actually on, read the way a user sees it.
const isSelected = (label: string) => (screen.getByRole('radio', { name: label }) as HTMLInputElement).checked;

// Every reading the owner approved, paired with the canonical value it is a reading of.
const readings: [ AbilityDistanceType, string ][] = [
	[ AbilityDistanceType.Self, '自身' ],
	[ AbilityDistanceType.Melee, '近戰' ],
	[ AbilityDistanceType.Ranged, '遠程' ],
	[ AbilityDistanceType.Aura, '靈光' ],
	[ AbilityDistanceType.Burst, '爆發' ],
	[ AbilityDistanceType.Cube, '立方' ],
	[ AbilityDistanceType.Line, '線形' ],
	[ AbilityDistanceType.Wall, '障壁' ],
	[ AbilityDistanceType.Summoner, '召喚師射程' ],
	[ AbilityDistanceType.Special, '特殊' ]
];

const createAbility = (types: AbilityDistanceType[]) => FactoryLogic.createAbility({
	id: 'distance-ability',
	name: 'Distance Ability',
	distance: types.map(type => FactoryLogic.distance.create({ type: type, value: 1 })),
	sections: []
});

const createPowerRoll = () => FactoryLogic.createPowerRoll({
	tier1: 'Tier one effect',
	tier2: 'Tier two effect',
	tier3: 'Tier three effect'
});

describe('PowerRollPanel distance selector localization', () => {
	it('reads every approved distance type in zh-TW and restores the canonical English on switching locale', () => {
		// Every value in the enum has an approved reading, so none can be silently left out.
		expect(readings.map(([ type ]) => type)).toEqual(Object.values(AbilityDistanceType));

		const ability = createAbility(readings.map(([ type ]) => type));

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={createPowerRoll()} ability={ability} creature={FactoryLogic.createHero()} autoCalc={true} />
			</LocalizationProvider>
		);

		readings.forEach(([ , reading ]) => {
			expect(screen.getByText(reading, { exact: true })).toBeTruthy();
		});

		switchLocale();

		readings.forEach(([ type ]) => {
			expect(screen.getByText(type, { exact: true })).toBeTruthy();
		});
	});

	it('keeps the canonical distance type as the selected value, so a zh-TW selection survives the switch to English', () => {
		const ability = createAbility([ AbilityDistanceType.Self, AbilityDistanceType.Melee, AbilityDistanceType.Ranged ]);
		const serializedBefore = JSON.stringify(ability);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={createPowerRoll()} ability={ability} creature={FactoryLogic.createHero()} autoCalc={true} />
			</LocalizationProvider>
		);

		// The first distance is the initial selection, so 遠程 is a real change of state.
		expect(isSelected('自身')).toBe(true);
		expect(isSelected('遠程')).toBe(false);

		fireEvent.click(screen.getByRole('radio', { name: '遠程' }));

		expect(isSelected('遠程')).toBe(true);
		expect(isSelected('自身')).toBe(false);

		switchLocale();

		// The options are now labelled and valued in canonical English. The selection can only
		// have survived if the state held 'Ranged' rather than the zh-TW label it was clicked by.
		expect(screen.queryByRole('radio', { name: '遠程' })).toBeNull();
		expect(isSelected('Ranged')).toBe(true);
		expect(isSelected('Self')).toBe(false);
		expect(AbilityDistanceType.Ranged).toBe('Ranged');
		expect(ability.distance.map(d => d.type)).toEqual([ 'Self', 'Melee', 'Ranged' ]);
		expect(JSON.stringify(ability)).toBe(serializedBefore);
	});
});
