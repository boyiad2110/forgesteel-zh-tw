// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { SkillSelectModal } from '@/components/modals/select/skill-select/skill-select-modal';
import { Skill } from '@/models/skill';
import { core } from '@/data/sourcebooks/official/core';
import { FactoryLogic } from '@/logic/factory-logic';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text }: { text: string }) => <span>{text}</span>,
	MarkdownEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
		<textarea aria-label='markdown-editor' value={value} onChange={e => onChange(e.target.value)} />
	)
}));

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions,
	useHeroes: () => []
}));

class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// Real production Skill records, taken directly from the Core sourcebook so the identity
// the resolver sees is the one the app actually renders.
const findSkill = (name: string): Skill => core.skills.find(s => s.name === name)!;
const alchemy = findSkill('Alchemy');
const culture = findSkill('Culture');
const criminalUnderworld = findSkill('Criminal Underworld');

const renderModal = (skills: Skill[], onSelect = vi.fn()) => {
	render(
		<LocalizationProvider>
			<LocaleToggle />
			<SkillSelectModal skills={skills} sourcebooks={[ core ]} onSelect={onSelect} onClose={vi.fn()} />
		</LocalizationProvider>
	);
	return onSelect;
};

describe('SkillSelectModal localization', () => {
	it('shows the approved zh-TW name/description, and canonical English after switching locale', () => {
		renderModal([ alchemy ]);

		expect(screen.getByText('鍊金', { exact: true })).toBeTruthy();
		expect(screen.getByText('製作炸彈與藥水', { exact: true })).toBeTruthy();
		expect(screen.queryByText('Alchemy', { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getByText('Alchemy', { exact: true })).toBeTruthy();
		expect(screen.getByText('Make bombs and potions.', { exact: true })).toBeTruthy();
		expect(screen.queryByText('鍊金', { exact: true })).toBeNull();
	});

	it('finds a Skill by zh-TW search term while displaying zh-TW', async () => {
		renderModal([ alchemy, culture ]);

		fireEvent.change(screen.getByPlaceholderText('搜尋'), { target: { value: '鍊金' } });

		await waitFor(() => expect(screen.queryByText('文化', { exact: true })).toBeNull());
		expect(screen.getByText('鍊金', { exact: true })).toBeTruthy();
	});

	it('still finds a Skill by its canonical English search term while displaying zh-TW', async () => {
		renderModal([ alchemy, culture ]);

		fireEvent.change(screen.getByPlaceholderText('搜尋'), { target: { value: 'Alchemy' } });

		await waitFor(() => expect(screen.queryByText('文化', { exact: true })).toBeNull());
		expect(screen.getByText('鍊金', { exact: true })).toBeTruthy();
	});

	it('hands back the exact canonical Skill object on select, unmutated, even while zh-TW is displayed', () => {
		const serialized = JSON.stringify(alchemy);
		const onSelect = renderModal([ alchemy ]);

		fireEvent.click(screen.getByText('鍊金', { exact: true }));

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(alchemy);
		expect(onSelect.mock.calls[0][0].name).toBe('Alchemy');
		expect(onSelect.mock.calls[0][0].description).toBe('Make bombs and potions.');
		expect(JSON.stringify(alchemy)).toBe(serialized);
	});

	it('leaves a custom Skill name untranslated', async () => {
		const onSelect = renderModal([]);

		fireEvent.click(screen.getByText('Add a custom skill'));
		fireEvent.change(screen.getByPlaceholderText('Custom Skill Name'), { target: { value: 'My Custom Skill' } });

		await waitFor(() => expect((screen.getByText('Select').closest('button') as HTMLButtonElement).disabled).toBe(false));
		fireEvent.click(screen.getByText('Select'));

		expect(onSelect).toHaveBeenCalledTimes(1);
		const selected = onSelect.mock.calls[0][0] as Skill;
		expect(selected.name).toBe('My Custom Skill');
	});

	it('regression: never swaps the Culture / Criminal Underworld zh-TW readings', () => {
		renderModal([ culture, criminalUnderworld ]);

		expect(screen.getByText('文化', { exact: true })).toBeTruthy();
		expect(screen.getByText('江湖', { exact: true })).toBeTruthy();
		expect(screen.queryByText('文化', { exact: true })?.textContent).not.toBe('江湖');
	});
});
