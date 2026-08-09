// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { PowerRollPanel } from '@/components/panels/power-roll/power-roll-panel';
import { AbilityKeyword } from '@/enums/ability-keyword';
import { DamageType } from '@/enums/damage-type';
import { FeatureType } from '@/enums/feature-type';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { HeroLogic } from '@/logic/hero-logic';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' })
}));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const addKit = (hero: Hero) => {
	const kit = FactoryLogic.createKit();
	kit.name = 'Canonical Kit';
	kit.meleeDamage = FactoryLogic.createKitDamageBonus(1, 2, 3);
	kit.rangedDamage = FactoryLogic.createKitDamageBonus(0, 1, 2);

	const kitFeature = FactoryLogic.feature.createKitChoice({ id: 'test-kit' });
	kitFeature.data.selected = [ kit ];
	hero.features.push(kitFeature);
};

// A power roll whose tiers reference potency, which is what makes the panel show it at all.
const createPotencyPowerRoll = () => FactoryLogic.createPowerRoll({
	tier1: 'M<weak slowed',
	tier2: 'M<average slowed',
	tier3: 'M<strong slowed',
	crit: undefined
});

const createWeaponAbility = () => FactoryLogic.createAbility({
	id: 'footer-ability',
	name: 'Footer Ability',
	keywords: [ AbilityKeyword.Melee, AbilityKeyword.Ranged, AbilityKeyword.Weapon ],
	sections: []
});

describe('PowerRollPanel footer localization', () => {
	it('reads the kit damage bonuses in zh-TW without changing their numbers or the kit name', () => {
		const hero = FactoryLogic.createHero();
		addKit(hero);
		const ability = createWeaponAbility();

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={createPotencyPowerRoll()} ability={ability} creature={hero} />
			</LocalizationProvider>
		);

		expect(screen.getByText('+1 / +2 / +3 近戰傷害', { exact: true })).toBeTruthy();
		expect(screen.getByText('+0 / +1 / +2 遠程傷害', { exact: true })).toBeTruthy();
		// The kit's own name is element data and is never read in zh-TW.
		expect(screen.getAllByText('Canonical Kit', { exact: true })).toHaveLength(2);

		switchLocale();

		expect(screen.getByText('+1 / +2 / +3 melee damage', { exact: true })).toBeTruthy();
		expect(screen.getByText('+0 / +1 / +2 ranged damage', { exact: true })).toBeTruthy();
		expect(screen.getAllByText('Canonical Kit', { exact: true })).toHaveLength(2);
		expect(DamageType.Damage).toBe('Damage');
	});

	it('reads every approved damage type in zh-TW while the canonical DamageType values stay as they are', () => {
		// Every reading the owner approved, paired with the canonical value it is a reading of.
		const readings: [ DamageType, string ][] = [
			[ DamageType.Damage, '傷害' ],
			[ DamageType.Acid, '酸蝕' ],
			[ DamageType.Cold, '寒冷' ],
			[ DamageType.Corruption, '腐朽' ],
			[ DamageType.Fire, '火焰' ],
			[ DamageType.Holy, '神聖' ],
			[ DamageType.Lightning, '閃電' ],
			[ DamageType.Poison, '劇毒' ],
			[ DamageType.Psychic, '心靈' ],
			[ DamageType.Sonic, '音波' ]
		];
		// Every value in the enum has an approved reading, so none can be silently left out.
		expect(readings.map(([ type ]) => type)).toEqual(Object.values(DamageType));

		const hero = FactoryLogic.createHero();
		readings.forEach(([ type ]) => {
			hero.features.push(FactoryLogic.feature.createAbilityDamage({
				id: `bonus-${type}`,
				name: `${type} Feature`,
				keywords: [],
				value: 2,
				damageType: type
			}));
		});
		const ability = createWeaponAbility();

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={createPotencyPowerRoll()} ability={ability} creature={hero} />
			</LocalizationProvider>
		);

		readings.forEach(([ type, reading ]) => {
			expect(screen.getByText(`2 ${reading}`, { exact: true })).toBeTruthy();
			// The feature's own name is element data and stays canonical.
			expect(screen.getByText(`${type} Feature`, { exact: true })).toBeTruthy();
		});

		switchLocale();

		readings.forEach(([ type ]) => {
			expect(screen.getByText(`2 ${type}`, { exact: true })).toBeTruthy();
			expect(screen.getByText(`${type} Feature`, { exact: true })).toBeTruthy();
		});
		expect(DamageType.Corruption).toBe('Corruption');
		expect(DamageType.Poison).toBe('Poison');
		expect(hero.features.map(f => f.type === FeatureType.AbilityDamage ? f.data.damageType : null).filter(type => type !== null)).toEqual(Object.values(DamageType));
	});

	it('reads the potency label and its three strengths in zh-TW while the potency values stay as calculated', () => {
		const hero = FactoryLogic.createHero();
		const ability = createWeaponAbility();

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={createPotencyPowerRoll()} ability={ability} creature={hero} />
			</LocalizationProvider>
		);

		expect(screen.getByText('效力', { exact: true })).toBeTruthy();
		// The three values are this hero's calculated potencies, unchanged by how they are read.
		expect(screen.getByText('弱 -2，中 -1，強 0', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Potency', { exact: true })).toBeTruthy();
		expect(screen.getByText('weak -2, average -1, strong 0', { exact: true })).toBeTruthy();
	});

	it('changes only the footer display when the locale switches, leaving every canonical input and calculated result alone', () => {
		const hero = FactoryLogic.createHero();
		addKit(hero);
		hero.features.push(FactoryLogic.feature.createAbilityDamage({
			id: 'corruption-bonus',
			name: 'Corrupting Strike',
			keywords: [],
			value: 2,
			damageType: DamageType.Corruption
		}));
		const ability = createWeaponAbility();
		const powerRoll = createPotencyPowerRoll();

		const serializedBefore = JSON.stringify({ hero, ability, powerRoll });
		const kitBonusesBefore = HeroLogic.getKitDamageBonuses(hero);
		const featureBonusesBefore = HeroLogic.getFeatureDamageBonuses(hero, ability, undefined);
		const potencyBefore = [ 'weak', 'average', 'strong' ].map(strength => HeroLogic.getPotency(hero, strength as 'weak' | 'average' | 'strong'));

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<PowerRollPanel powerRoll={powerRoll} ability={ability} creature={hero} />
			</LocalizationProvider>
		);

		expect(screen.getByText('+1 / +2 / +3 近戰傷害', { exact: true })).toBeTruthy();
		expect(screen.getByText('2 腐朽', { exact: true })).toBeTruthy();
		expect(screen.getByText('弱 -2，中 -1，強 0', { exact: true })).toBeTruthy();

		switchLocale();

		// The display changed...
		expect(screen.getByText('+1 / +2 / +3 melee damage', { exact: true })).toBeTruthy();
		expect(screen.getByText('2 Corruption', { exact: true })).toBeTruthy();
		expect(screen.getByText('weak -2, average -1, strong 0', { exact: true })).toBeTruthy();
		expect(screen.queryByText('2 腐朽', { exact: true })).toBeNull();

		// ...and nothing behind it did.
		expect(JSON.stringify({ hero, ability, powerRoll })).toBe(serializedBefore);
		expect(HeroLogic.getKitDamageBonuses(hero)).toEqual(kitBonusesBefore);
		expect(HeroLogic.getFeatureDamageBonuses(hero, ability, undefined)).toEqual(featureBonusesBefore);
		expect([ 'weak', 'average', 'strong' ].map(strength => HeroLogic.getPotency(hero, strength as 'weak' | 'average' | 'strong'))).toEqual(potencyBefore);
		expect(featureBonusesBefore[0].type).toBe(DamageType.Corruption);
		expect(DamageType.Corruption).toBe('Corruption');
		expect(Object.values(DamageType)).toEqual([ 'Damage', 'Acid', 'Cold', 'Corruption', 'Fire', 'Holy', 'Lightning', 'Poison', 'Psychic', 'Sonic' ]);
	});
});
