// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { LanguageSelectModal } from '@/components/modals/select/language-select/language-select-modal';
import { Language } from '@/models/language';
import { orden } from '@/data/sourcebooks/official/orden';
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

// Real production Language records, taken directly from the Orden sourcebook so the
// identity the resolver sees is the one the app actually renders.
const findLanguage = (name: string): Language => orden.languages.find(l => l.name === name)!;
const caelian = findLanguage('Caelian');
const protoCtholl = findLanguage('Proto-Ctholl');
const tholl = findLanguage('Tholl');

const renderModal = (languages: Language[], onSelect = vi.fn()) => {
	render(
		<LocalizationProvider>
			<LocaleToggle />
			<LanguageSelectModal languages={languages} onSelect={onSelect} onClose={vi.fn()} />
		</LocalizationProvider>
	);
	return onSelect;
};

describe('LanguageSelectModal localization', () => {
	it('shows the approved zh-TW name/description, and canonical English after switching locale', () => {
		renderModal([ caelian ]);

		expect(screen.getByText('凱利安語', { exact: true })).toBeTruthy();
		expect(screen.getByText('古代凱利安帝國的語言；歐爾登的通用語。', { exact: true })).toBeTruthy();
		expect(screen.queryByText('Caelian', { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getByText('Caelian', { exact: true })).toBeTruthy();
		expect(screen.getByText('The language of the ancient Caelian Empire; the common tongue of Orden.', { exact: true })).toBeTruthy();
		expect(screen.queryByText('凱利安語', { exact: true })).toBeNull();
	});

	it('finds a Language by zh-TW search term while displaying zh-TW', async () => {
		renderModal([ caelian, tholl ]);

		fireEvent.change(screen.getByPlaceholderText('搜尋'), { target: { value: '凱利安語' } });

		await waitFor(() => expect(screen.queryByText('墮語', { exact: true })).toBeNull());
		expect(screen.getByText('凱利安語', { exact: true })).toBeTruthy();
	});

	it('still finds a Language by its canonical English search term while displaying zh-TW', async () => {
		renderModal([ caelian, tholl ]);

		fireEvent.change(screen.getByPlaceholderText('搜尋'), { target: { value: 'Caelian' } });

		await waitFor(() => expect(screen.queryByText('墮語', { exact: true })).toBeNull());
		expect(screen.getByText('凱利安語', { exact: true })).toBeTruthy();
	});

	it('hands back the exact canonical Language object on select, unmutated, even while zh-TW is displayed', () => {
		const serialized = JSON.stringify(caelian);
		const onSelect = renderModal([ caelian ]);

		fireEvent.click(screen.getByText('凱利安語', { exact: true }));

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(caelian);
		expect(onSelect.mock.calls[0][0].name).toBe('Caelian');
		expect(onSelect.mock.calls[0][0].description).toBe('The language of the ancient Caelian Empire; the common tongue of Orden.');
		expect(JSON.stringify(caelian)).toBe(serialized);
	});

	it('leaves a custom Language name untranslated', async () => {
		const onSelect = renderModal([]);

		fireEvent.click(screen.getByText('Add a custom language'));
		fireEvent.change(screen.getByPlaceholderText('Custom Language Name'), { target: { value: 'My Custom Language' } });

		await waitFor(() => expect((screen.getByText('Select').closest('button') as HTMLButtonElement).disabled).toBe(false));
		fireEvent.click(screen.getByText('Select'));

		expect(onSelect).toHaveBeenCalledTimes(1);
		const selected = onSelect.mock.calls[0][0] as Language;
		expect(selected.name).toBe('My Custom Language');
	});

	it('regression: shows the Owner-reconfirmed Proto-Ctholl / Tholl readings exactly, without normalizing toward canonical English', () => {
		renderModal([ protoCtholl, tholl ]);

		expect(screen.getByText('原墮語', { exact: true })).toBeTruthy();
		expect(screen.getByText('低等惡魔的語言；墮語的不完整分支。', { exact: true })).toBeTruthy();
		expect(screen.getByText('墮語', { exact: true })).toBeTruthy();
		expect(screen.getByText('高等惡魔和鬣狗人的語言。', { exact: true })).toBeTruthy();
	});
});
