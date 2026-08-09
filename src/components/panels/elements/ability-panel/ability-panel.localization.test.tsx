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
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => ({ showClipboardOptions: false, locale: 'zh-TW' })
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
});
