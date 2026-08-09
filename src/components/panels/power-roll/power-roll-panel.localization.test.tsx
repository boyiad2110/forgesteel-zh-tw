// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { PowerRollPanel } from '@/components/panels/power-roll/power-roll-panel';
import { Characteristic } from '@/enums/characteristic';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' })
}));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// The headers are read whitespace-exactly, which the default text matcher normalizes away.
const getHeaderTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.power-roll-header')).map(header => header.textContent);

const createPowerRoll = (characteristic: Characteristic[], bonus = 0) => FactoryLogic.createPowerRoll({
	characteristic: characteristic,
	bonus: bonus,
	tier1: 'Tier one effect',
	tier2: 'Tier two effect',
	tier3: 'Tier three effect'
});

describe('PowerRollPanel core header localization', () => {
	it('localizes the test headers, composing the approved characteristic readings, and restores the canonical English', () => {
		const none = createPowerRoll([]);
		const partial = createPowerRoll([ Characteristic.Might, Characteristic.Agility ]);
		const all = createPowerRoll([ Characteristic.Might, Characteristic.Agility, Characteristic.Reason, Characteristic.Intuition, Characteristic.Presence ]);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={none} test={true} />
				<PowerRollPanel powerRoll={partial} test={true} />
				<PowerRollPanel powerRoll={all} test={true} />
			</LocalizationProvider>
		);

		expect(screen.getByText('考驗', { exact: true })).toBeTruthy();
		expect(screen.getByText('力量或敏捷考驗', { exact: true })).toBeTruthy();
		expect(screen.getByText('最高屬性考驗', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Test', { exact: true })).toBeTruthy();
		expect(screen.getByText('Might or Agility Test', { exact: true })).toBeTruthy();
		expect(screen.getByText('Highest Characteristic Test', { exact: true })).toBeTruthy();
	});

	it('localizes the power roll headers for one, several and all five characteristics, and for a numeric bonus', () => {
		const single = createPowerRoll([ Characteristic.Might ]);
		const several = createPowerRoll([ Characteristic.Might, Characteristic.Agility ]);
		const all = createPowerRoll([ Characteristic.Might, Characteristic.Agility, Characteristic.Reason, Characteristic.Intuition, Characteristic.Presence ]);
		const numeric = createPowerRoll([], 3);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={single} />
				<PowerRollPanel powerRoll={several} />
				<PowerRollPanel powerRoll={all} />
				<PowerRollPanel powerRoll={numeric} />
			</LocalizationProvider>
		);

		expect(screen.getByText('檢定 + 力量', { exact: true })).toBeTruthy();
		expect(screen.getByText('檢定 + 力量或敏捷', { exact: true })).toBeTruthy();
		expect(screen.getByText('檢定 + 最高屬性', { exact: true })).toBeTruthy();
		expect(screen.getByText('檢定 + 3', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Power Roll + Might', { exact: true })).toBeTruthy();
		expect(screen.getByText('Power Roll + Might or Agility', { exact: true })).toBeTruthy();
		expect(screen.getByText('Power Roll + Highest Characteristic', { exact: true })).toBeTruthy();
		expect(screen.getByText('Power Roll + 3', { exact: true })).toBeTruthy();
	});

	it('localizes the Odds control while it still shows and hides the same percentages across a locale switch', () => {
		const powerRoll = createPowerRoll([ Characteristic.Might ]);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={powerRoll} odds={[ 1, 2, 2, 3, 3, 3 ]} />
			</LocalizationProvider>
		);

		expect(screen.getByTitle('機率')).toBeTruthy();
		expect(screen.queryByText('1%', { exact: true })).toBeNull();

		fireEvent.click(screen.getByTitle('機率'));

		expect(screen.getByText('1%', { exact: true })).toBeTruthy();
		expect(screen.getByText('2%', { exact: true })).toBeTruthy();
		expect(screen.getByText('3%', { exact: true })).toBeTruthy();

		switchLocale();

		// The odds stay open: switching locale is a presentation change, not a reset.
		expect(screen.getByTitle('Odds')).toBeTruthy();
		expect(screen.getByText('1%', { exact: true })).toBeTruthy();
		expect(screen.getByText('2%', { exact: true })).toBeTruthy();
		expect(screen.getByText('3%', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByTitle('Odds'));

		expect(screen.queryByText('1%', { exact: true })).toBeNull();
	});

	it('leaves the auto-calculated header and the sign and spacing of a numeric bonus exactly as they are', () => {
		const hero = FactoryLogic.createHero();
		const negative = createPowerRoll([], -2);
		const zero = createPowerRoll([], 0);

		const { container } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={createPowerRoll([ Characteristic.Might ])} creature={hero} autoCalc={true} />
				<PowerRollPanel powerRoll={negative} />
				<PowerRollPanel powerRoll={zero} />
			</LocalizationProvider>
		);

		const chineseHeaders = getHeaderTexts(container);
		// The auto-calculated header is a rolled number, not a phrase: it is never prefixed or read.
		expect(chineseHeaders[0]).toMatch(/^2d10 /);
		expect(chineseHeaders[0]).not.toMatch(/[一-鿿]/);
		// A negative bonus supplies no sign of its own, and keeps the gap that leaves behind.
		expect(chineseHeaders[1]).toBe('檢定  -2');
		expect(chineseHeaders[2]).toBe('檢定 + 0');

		switchLocale();

		const englishHeaders = getHeaderTexts(container);
		expect(englishHeaders[0]).toBe(chineseHeaders[0]);
		expect(englishHeaders[1]).toBe('Power Roll  -2');
		expect(englishHeaders[2]).toBe('Power Roll + 0');
		expect(negative.bonus).toBe(-2);
		expect(zero.bonus).toBe(0);
	});

	it('leaves the power roll, its characteristics and its tier effects canonical across a locale switch, while the distance selector reads its approved labels', () => {
		const powerRoll = createPowerRoll([ Characteristic.Might, Characteristic.Agility ]);
		const serializedBefore = JSON.stringify(powerRoll);
		const hero = FactoryLogic.createHero();
		const ability = FactoryLogic.createAbility({
			id: 'two-distances',
			name: 'Two Distances',
			distance: [ FactoryLogic.distance.createMelee(1), FactoryLogic.distance.createRanged(5) ],
			sections: []
		});

		const { container } = render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={powerRoll} />
				<PowerRollPanel powerRoll={createPowerRoll([])} ability={ability} creature={hero} autoCalc={true} />
			</LocalizationProvider>
		);

		const expectCanonicalContent = () => {
			const tiers = within(Array.from(container.querySelectorAll('.power-roll-panel'))[0] as HTMLElement);

			expect(tiers.getByText('Tier one effect', { exact: true })).toBeTruthy();
			expect(tiers.getByText('Tier two effect', { exact: true })).toBeTruthy();
			expect(tiers.getByText('Tier three effect', { exact: true })).toBeTruthy();
			expect(tiers.getByText('!', { exact: true })).toBeTruthy();
			expect(tiers.getByText('@', { exact: true })).toBeTruthy();
			expect(tiers.getByText('#', { exact: true })).toBeTruthy();
		};

		// The selector labels the distances it offers; the ability's own distance values stay
		// canonical either way, which the serialization check below confirms.
		const expectSelectorLabels = (melee: string, ranged: string) => {
			const selector = within(Array.from(container.querySelectorAll('.power-roll-panel'))[1] as HTMLElement);

			expect(selector.getByText(melee, { exact: true })).toBeTruthy();
			expect(selector.getByText(ranged, { exact: true })).toBeTruthy();
		};

		expectCanonicalContent();
		expectSelectorLabels('近戰', '遠程');

		switchLocale();

		expectCanonicalContent();
		expectSelectorLabels('Melee', 'Ranged');
		expect(powerRoll.characteristic).toEqual([ Characteristic.Might, Characteristic.Agility ]);
		expect(Characteristic.Might).toBe('Might');
		expect(Characteristic.Agility).toBe('Agility');
		expect(JSON.stringify(powerRoll)).toBe(serializedBefore);
		expect(JSON.stringify(ability.distance)).toBe(JSON.stringify([ FactoryLogic.distance.createMelee(1), FactoryLogic.distance.createRanged(5) ]));
	});
});
