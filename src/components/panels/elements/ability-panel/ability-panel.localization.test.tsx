// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AbilityPanel } from '@/components/panels/elements/ability-panel/ability-panel';
import { LocalizationProvider, useLocalization } from '@/contexts/localization-context';
import { AbilityData } from '@/data/ability-data';
import { PanelMode } from '@/enums/panel-mode';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/data-context', () => ({
	useOptions: () => ({ showClipboardOptions: false })
}));
vi.mock('@/hooks/use-clipboard', () => ({ useClipboard: () => ({ setData: vi.fn() }) }));
vi.mock('@/components/controls/error-boundary/error-boundary', () => ({ ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));
vi.mock('@/components/panels/power-roll/power-roll-panel', () => ({ PowerRollPanel: () => null }));
vi.mock('@/components/panels/sash/sash-panel', () => ({ SashPanel: () => null }));
vi.mock('@/logic/classic-sheet/sheet-formatter', () => ({ SheetFormatter: { getPageId: () => 'ability-free-melee' } }));

const LocaleToggle = () => {
	const { setLocale } = useLocalization();
	return (
		<div>
			<button onClick={() => setLocale('en')} type='button'>EN</button>
			<button onClick={() => setLocale('zh-TW')} type='button'>zh-TW</button>
		</div>
	);
};

const getTargetFieldValue = () => {
	const targetLabel = screen.getByText('Target', { exact: true });
	const targetField = targetLabel.closest('.field');
	expect(targetField).not.toBeNull();
	return targetField!.querySelector('.field-value')!.textContent;
};

describe('AbilityPanel localization presentation wiring', () => {
	it('renders localized ability presentation values without changing the canonical ability', () => {
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

		expect(screen.getByText('Free Strike (melee)', { exact: true })).not.toBeNull();
		expect(screen.getByText('Free Strike (melee) | Target: One creature or object', { exact: true })).not.toBeNull();
		expect(getTargetFieldValue()).toBe('One creature or object');

		fireEvent.click(screen.getByRole('button', { name: 'zh-TW' }));
		expect(screen.getByText('【原型】近戰自由攻擊', { exact: true })).not.toBeNull();
		expect(screen.getByText('【原型】Free Strike (melee)｜目標：One creature or object', { exact: true })).not.toBeNull();
		expect(getTargetFieldValue()).toBe('One creature or object');

		fireEvent.click(screen.getByRole('button', { name: 'EN' }));
		expect(screen.getByText('Free Strike (melee)', { exact: true })).not.toBeNull();
		expect(screen.getByText('Free Strike (melee) | Target: One creature or object', { exact: true })).not.toBeNull();
		expect(getTargetFieldValue()).toBe('One creature or object');
		expect(screen.queryByText('【原型】近戰自由攻擊', { exact: true })).toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'zh-TW' }));
		expect(screen.getByText('【原型】近戰自由攻擊', { exact: true })).not.toBeNull();
		expect(screen.getByText('【原型】Free Strike (melee)｜目標：One creature or object', { exact: true })).not.toBeNull();
		expect(getTargetFieldValue()).toBe('One creature or object');

		expect(ability).toBe(originalReference);
		expect(ability.id).toBe(originalID);
		expect(ability.name).toBe(originalName);
		expect(ability.target).toBe(originalTarget);
		expect(JSON.stringify(ability)).toBe(originalJSON);
	});
});
