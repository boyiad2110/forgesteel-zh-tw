// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { LocalizationProvider, useLocalization } from '@/contexts/localization-context';
import { AbilityData } from '@/data/ability-data';
import { AbilityKeyword } from '@/enums/ability-keyword';
import { ConditionEndType, ConditionType } from '@/enums/condition-type';
import { PanelMode } from '@/enums/panel-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' })
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: () => 'ability-free-melee' } }));

afterEach(cleanup);

const LocaleToggle = () => {
	const { setLocale } = useLocalization();
	return (
		<div>
			<button onClick={() => setLocale('en')} type='button'>EN</button>
			<button onClick={() => setLocale('zh-TW')} type='button'>zh-TW</button>
		</div>
	);
};

const getFieldValue = (label: string) => {
	const fieldLabel = screen.getByText(label, { exact: true });
	const field = fieldLabel.closest('.field');
	expect(field).not.toBeNull();
	return field!.querySelector('.field-value')!.textContent;
};

// The ability's name, its summary message and its target are element data with no approved
// zh-TW reading, so they stay canonical English whichever locale the panel is shown in. Only
// the field labels beside them and the action type above them are read in zh-TW.
const expectCanonicalAbilityContent = (targetLabel: string, distanceLabel: string) => {
	expect(screen.getByText('Free Strike (melee)', { exact: true })).not.toBeNull();
	expect(screen.getByText('Free Strike (melee) | Target: One creature or object', { exact: true })).not.toBeNull();
	expect(getFieldValue(targetLabel)).toBe('One creature or object');
	expect(getFieldValue(distanceLabel)).toBe('Melee 1');
};

const expectApprovedChinesePresentation = () => {
	expectCanonicalAbilityContent('目標', '射程');
	expect(screen.getByText('基礎打擊', { exact: true })).not.toBeNull();
};

const expectCanonicalEnglishPresentation = () => {
	expectCanonicalAbilityContent('Target', 'Distance');
	expect(screen.getByText('Free Strike', { exact: true })).not.toBeNull();
	// English presentation carries no Chinese at all.
	expect(screen.queryByText(/[一-鿿]/)).toBeNull();
};

describe('AbilityPanel localization presentation wiring', () => {
	it('shows the approved zh-TW metadata, keeps the rest canonical English, and never changes the canonical ability', () => {
		const ability = AbilityData.freeStrikeMelee;
		const originalReference = ability;
		const originalJSON = JSON.stringify(ability);
		const originalID = ability.id;
		const originalName = ability.name;
		const originalTarget = ability.target;

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityPanel ability={ability} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		// Starts in the default zh-TW locale.
		expectApprovedChinesePresentation();

		fireEvent.click(screen.getByRole('button', { name: 'EN' }));
		expectCanonicalEnglishPresentation();

		fireEvent.click(screen.getByRole('button', { name: 'zh-TW' }));
		expectApprovedChinesePresentation();

		expect(ability).toBe(originalReference);
		expect(ability.id).toBe(originalID);
		expect(ability.name).toBe(originalName);
		expect(ability.target).toBe(originalTarget);
		expect(JSON.stringify(ability)).toBe(originalJSON);
	});

	it('localizes approved condition warnings, costs, controls, and Charge guidance without changing canonical inputs', () => {
		const ability = FactoryLogic.createAbility({
			id: 'localized-warning-ability',
			name: 'Localized Warning Ability',
			type: FactoryLogic.type.createTrigger('When tested'),
			keywords: [ AbilityKeyword.Charge, AbilityKeyword.Strike ],
			cost: 1,
			repeatable: true,
			sections: [
				FactoryLogic.createAbilitySectionRoll(FactoryLogic.createPowerRoll({
					tier1: 'Tier one effect',
					tier2: 'Tier two effect',
					tier3: 'Tier three effect'
				}))
			]
		});
		const hero = FactoryLogic.createHero();
		hero.class = FactoryLogic.createClass();
		hero.class.level = 7;
		hero.state.conditions = [
			ConditionType.Bleeding,
			ConditionType.Dazed,
			ConditionType.Frightened,
			ConditionType.Grabbed,
			ConditionType.Prone,
			ConditionType.Restrained,
			ConditionType.Taunted,
			ConditionType.Weakened
		].map((type, index) => ({ id: `condition-${index}`, type, text: '', ends: ConditionEndType.UntilRemoved }));

		const dyingHero = FactoryLogic.createHero();
		dyingHero.class = FactoryLogic.createClass();
		dyingHero.class.level = 7;
		dyingHero.state.staminaDamage = 72;

		const serializedAbility = JSON.stringify(ability);
		const serializedHero = JSON.stringify(hero);
		const serializedDyingHero = JSON.stringify(dyingHero);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<AbilityPanel ability={ability} hero={hero} mode={PanelMode.Full} />
				<AbilityPanel ability={ability} cost={2} repeatable={true} mode={PanelMode.Full} />
				<AbilityPanel ability={AbilityData.catchBreath} hero={dyingHero} mode={PanelMode.Full} />
			</LocalizationProvider>
		);

		const expectAlertText = (text: string) => {
			expect(screen.getAllByRole('alert').some(alert => alert.textContent?.includes(text))).toBe(true);
		};

		[
			'出血',
			'暈眩',
			'畏縮',
			'擒制',
			'伏地',
			'束縛',
			'嘲諷',
			'虛弱',
			'瀕死'
		].forEach(text => expect(screen.getByText(text, { exact: true })).not.toBeNull());
		[
			'發動此招式後，你會失去 1d6 + 7 點體力。',
			'你不能發動此招式。',
			'若此招式的目標是你的恐懼來源，檢定帶有 1 個劣勢。',
			'若此招式的目標不是擒抱你的生物，檢定帶有 1 個劣勢。',
			'此招式的檢定帶有 1 個劣勢。',
			'若此招式的目標不是嘲諷你的生物，且你與該生物之間有效果線，檢定帶有雙劣勢。',
			'當你進行衝鋒動作時，可以用此招式取代近戰基礎打擊。'
		].forEach(expectAlertText);
		expect(screen.getByTitle('自動計算傷害、效力等數值')).not.toBeNull();
		expect(screen.getByText('1 費+', { exact: true })).not.toBeNull();
		expect(screen.getByText('2 費+', { exact: true })).not.toBeNull();
		expect(screen.getAllByText('Charge', { exact: true }).length).toBeGreaterThan(0);
		expect(screen.getByText(/2d10/, { exact: true })).not.toBeNull();

		fireEvent.click(screen.getByTitle('自動計算傷害、效力等數值'));
		expect(screen.queryByText(/2d10/, { exact: true })).toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'EN' }));

		[
			'Bleeding',
			'Dazed',
			'Frightened',
			'Grabbed',
			'Prone',
			'Restrained',
			'Taunted',
			'Weakened',
			'Dying'
		].forEach(text => expect(screen.getByText(text, { exact: true })).not.toBeNull());
		[
			'After using this ability, you lose 1d6 + 7 Stamina.',
			'You can’t use this ability.',
			'This ability takes a bane if it targets the source of your fear.',
			'This ability takes a bane if it doesn’t target the creature grabbing you.',
			'This ability takes a bane.',
			'This ability takes a double bane if it doesn’t target the creature who taunted you, and you have line of effect to that creature.',
			'This ability can be used in place of a melee free strike when you take the Charge action.'
		].forEach(expectAlertText);
		expect(screen.getByTitle('Auto-calculate damage, potency, etc')).not.toBeNull();
		expect(screen.getAllByText('Power Roll + 0', { exact: true }).length).toBeGreaterThan(0);
		expect(screen.getByText('1pt+', { exact: true })).not.toBeNull();
		expect(screen.getByText('2pts+', { exact: true })).not.toBeNull();

		expect(JSON.stringify(ability)).toBe(serializedAbility);
		expect(JSON.stringify(hero)).toBe(serializedHero);
		expect(JSON.stringify(dyingHero)).toBe(serializedDyingHero);
		expect(ability.keywords).toEqual([ AbilityKeyword.Charge, AbilityKeyword.Strike ]);
		expect(hero.state.conditions.map(condition => condition.type)).toEqual([
			ConditionType.Bleeding,
			ConditionType.Dazed,
			ConditionType.Frightened,
			ConditionType.Grabbed,
			ConditionType.Prone,
			ConditionType.Restrained,
			ConditionType.Taunted,
			ConditionType.Weakened
		]);
	});
});
