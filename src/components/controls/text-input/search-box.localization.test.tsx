// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { SearchBox } from '@/components/controls/text-input/text-input';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions
}));

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));

afterEach(() => {
	vi.useRealTimers();
	cleanup();
});

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// The search box in its real setting: a caller owning the canonical search term, and a list
// filtered by it. Localizing the placeholder must not disturb either.
const candidates = [ 'Alchemy', 'Blacksmithing', 'Brawl' ];

const SearchableList = (props: { onSearchTerm: (value: string) => void }) => {
	const [ searchTerm, setSearchTerm ] = useState('');

	return (
		<div>
			<SearchBox
				searchTerm={searchTerm}
				setSearchTerm={value => {
					setSearchTerm(value);
					props.onSearchTerm(value);
				}}
			/>
			<ul>
				{
					candidates
						.filter(candidate => candidate.toLowerCase().includes(searchTerm.toLowerCase()))
						.map(candidate => <li key={candidate}>{candidate}</li>)
				}
			</ul>
		</div>
	);
};

const settleDebounce = () => act(() => { vi.advanceTimersByTime(600); });

const getSearchInput = () => screen.getByRole('textbox') as HTMLInputElement;

const getResults = () => Array.from(document.querySelectorAll('li')).map(item => item.textContent);

describe('SearchBox localization', () => {
	it('reads its placeholder and restores the canonical English, changing nothing else', () => {
		render(
			<LocalizationProvider>
				<LocaleToggle />
				<SearchBox searchTerm='Blacksmith' setSearchTerm={vi.fn()} />
			</LocalizationProvider>
		);

		expect(screen.getByPlaceholderText('搜尋')).toBeTruthy();
		// The term itself is data, not presentation: it stays exactly as the caller holds it.
		expect(getSearchInput().value).toBe('Blacksmith');

		switchLocale();

		expect(screen.getByPlaceholderText('Search')).toBeTruthy();
		expect(getSearchInput().value).toBe('Blacksmith');
	});

	it('keeps the search term and the filtering it drives identical across a locale switch', () => {
		const onSearchTerm = vi.fn();

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<SearchableList onSearchTerm={onSearchTerm} />
			</LocalizationProvider>
		);

		settleDebounce();
		onSearchTerm.mockClear();

		fireEvent.change(getSearchInput(), { target: { value: 'br' } });
		settleDebounce();

		expect(onSearchTerm).toHaveBeenCalledWith('br');
		expect(getResults()).toEqual([ 'Brawl' ]);

		onSearchTerm.mockClear();
		switchLocale();
		settleDebounce();

		// A locale switch is not a search: it reports no new term and refilters nothing.
		expect(onSearchTerm).not.toHaveBeenCalled();
		expect(getSearchInput().value).toBe('br');
		expect(getResults()).toEqual([ 'Brawl' ]);
		expect(screen.getByPlaceholderText('Search')).toBeTruthy();

		fireEvent.change(getSearchInput(), { target: { value: 'al' } });
		settleDebounce();

		expect(onSearchTerm).toHaveBeenCalledWith('al');
		expect(getResults()).toEqual([ 'Alchemy' ]);
		// The localized placeholder never becomes search data.
		expect(onSearchTerm.mock.calls.every(call => call[0] !== '搜尋')).toBe(true);
	});
});
