// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { ElementSelectModal } from '@/components/modals/select/element-select/element-select-modal';
import { Element } from '@/models/element';
import { FactoryLogic } from '@/logic/factory-logic';
import { LocalizationProvider } from '@/contexts/localization-context';
import { Options } from '@/models/options';
import { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text }: { text: string }) => <span>{text}</span>,
	MarkdownEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
		<textarea aria-label='markdown-editor' value={value} onChange={e => onChange(e.target.value)} />
	)
}));

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'en' };
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

const elements: Element[] = [
	{ id: 'e-1', name: 'Alpha', description: 'The first canonical element.' },
	{ id: 'e-2', name: 'Beta', description: 'The second canonical element.' }
];

const renderWithLocalization = (content: ReactNode) => render(<LocalizationProvider>{content}</LocalizationProvider>);

describe('ElementSelectModal default (no opt-in resolver) regression', () => {
	it('shows canonical English name/description, searches canonical text, and hands back the exact Element on select', async () => {
		const onSelect = vi.fn();
		renderWithLocalization(<ElementSelectModal elements={elements} onSelect={onSelect} onClose={vi.fn()} />);

		expect(screen.getByText('Alpha', { exact: true })).toBeTruthy();
		expect(screen.getByText('Beta', { exact: true })).toBeTruthy();

		fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'Beta' } });
		await waitFor(() => expect(screen.queryByText('Alpha', { exact: true })).toBeNull());
		expect(screen.getByText('Beta', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByText('Beta', { exact: true }));

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(elements[1]);
	});
});

describe('ElementSelectModal opt-in localized display/search resolvers', () => {
	const getDisplayName = (e: Element) => (e.id === 'e-1' ? '第一項' : e.name);
	const getDisplayDescription = (e: Element) => (e.id === 'e-1' ? '第一個標準元素。' : e.description);

	it('shows the resolved display text and searches against it, while still handing back the canonical Element on select', async () => {
		const onSelect = vi.fn();
		renderWithLocalization(
			<ElementSelectModal
				elements={elements}
				getDisplayName={getDisplayName}
				getDisplayDescription={getDisplayDescription}
				onSelect={onSelect}
				onClose={vi.fn()}
			/>
		);

		expect(screen.getByText('第一項', { exact: true })).toBeTruthy();
		expect(screen.queryByText('Alpha', { exact: true })).toBeNull();
		// The un-resolved second element still falls back to its own canonical name.
		expect(screen.getByText('Beta', { exact: true })).toBeTruthy();

		fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: '第一項' } });
		await waitFor(() => expect(screen.queryByText('Beta', { exact: true })).toBeNull());
		expect(screen.getByText('第一項', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByText('第一項', { exact: true }));

		expect(onSelect).toHaveBeenCalledTimes(1);
		// The canonical Element (English name/description, original ID) is what onSelect
		// receives, never a localized clone of it.
		expect(onSelect).toHaveBeenCalledWith(elements[0]);
	});

	it('leaves custom element entry unaffected by the resolvers', async () => {
		const onSelect = vi.fn();
		renderWithLocalization(
			<ElementSelectModal
				elements={elements}
				getDisplayName={getDisplayName}
				getDisplayDescription={getDisplayDescription}
				onSelect={onSelect}
				onClose={vi.fn()}
			/>
		);

		fireEvent.click(screen.getByText('Add a custom element'));
		fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Custom Name' } });
		fireEvent.change(screen.getByLabelText('markdown-editor'), { target: { value: 'Custom description.' } });

		await waitFor(() => expect((screen.getByText('Select').closest('button') as HTMLButtonElement).disabled).toBe(false));
		fireEvent.click(screen.getByText('Select'));

		expect(onSelect).toHaveBeenCalledTimes(1);
		const selected = onSelect.mock.calls[0][0] as Element;
		expect(selected.name).toBe('Custom Name');
		expect(selected.description).toBe('Custom description.');
	});
});
