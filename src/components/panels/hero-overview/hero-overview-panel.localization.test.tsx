// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { HeroOverviewPanel } from '@/components/panels/hero-overview/hero-overview-panel';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { HeroOverview } from '@/models/hero';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions
}));

afterEach(cleanup);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const getFieldValue = (label: string) => {
	const field = screen.getByText(label, { exact: true }).closest('.field');
	expect(field).not.toBeNull();
	return field!.querySelector('.field-value')!.textContent;
};

// A hero whose every authored value is distinct from the label above it, so a label that
// leaked into a value - or the other way round - could not go unnoticed.
const createOverview = (overrides: Partial<HeroOverview> = {}): HeroOverview => ({
	id: 'hero-1',
	name: 'Seren of the Ash',
	folder: 'Campaign Folder',
	picture: null,
	ancestry: 'Human',
	background: 'Sage',
	class: 'Tactician',
	complication: 'Hunted',
	isActive: true,
	...overrides
} as HeroOverview);

describe('HeroOverviewPanel localization', () => {
	it('reads its labels while every authored value stays canonical', () => {
		const overview = createOverview();
		const serialized = JSON.stringify(overview);

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<HeroOverviewPanel hero={overview} />
			</LocalizationProvider>
		);

		const expectCanonicalValues = (ancestry: string, background: string, heroClass: string, complication: string) => {
			expect(screen.getByText('Seren of the Ash', { exact: true })).toBeTruthy();
			expect(screen.getByText('Campaign Folder', { exact: true })).toBeTruthy();
			expect(getFieldValue(ancestry)).toBe('Human');
			expect(getFieldValue(background)).toBe('Sage');
			expect(getFieldValue(heroClass)).toBe('Tactician');
			expect(getFieldValue(complication)).toBe('Hunted');
		};

		expectCanonicalValues('族裔', '背景', '範型', '糾葛');

		switchLocale();

		expectCanonicalValues('Ancestry', 'Background', 'Class', 'Complication');
		expect(JSON.stringify(overview)).toBe(serialized);
	});

	it('reads the unnamed fallback without touching a hero that has a name', () => {
		const unnamed = createOverview({ name: '' });

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<HeroOverviewPanel hero={unnamed} />
			</LocalizationProvider>
		);

		expect(screen.getByText('未命名英雄', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Unnamed Hero', { exact: true })).toBeTruthy();
		// The fallback is presentation only; the hero's own name is still empty.
		expect(unnamed.name).toBe('');
	});

	it('reads the visibility control and still reports the exact boolean transition', () => {
		const onSetVisibility = vi.fn();
		const overview = createOverview();

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<HeroOverviewPanel hero={overview} visibility={{ visible: true, onSetVisibility: onSetVisibility }} />
			</LocalizationProvider>
		);

		fireEvent.click(screen.getByTitle('顯示 / 隱藏'));

		expect(onSetVisibility).toHaveBeenCalledTimes(1);
		expect(onSetVisibility).toHaveBeenCalledWith(false);
		expect(typeof onSetVisibility.mock.calls[0][0]).toBe('boolean');

		switchLocale();

		// A locale switch is not a visibility change.
		expect(onSetVisibility).toHaveBeenCalledTimes(1);
		expect(screen.getByTitle('Show / Hide')).toBeTruthy();

		fireEvent.click(screen.getByTitle('Show / Hide'));

		expect(onSetVisibility).toHaveBeenCalledTimes(2);
		expect(onSetVisibility).toHaveBeenLastCalledWith(false);
		expect(overview.isActive).toBe(true);
	});

	it('reports the opposite transition when the hero is already hidden', () => {
		const onSetVisibility = vi.fn();

		render(
			<LocalizationProvider>
				<LocaleToggle />
				<HeroOverviewPanel hero={createOverview({ isActive: false })} visibility={{ visible: false, onSetVisibility: onSetVisibility }} />
			</LocalizationProvider>
		);

		fireEvent.click(screen.getByTitle('顯示 / 隱藏'));

		expect(onSetVisibility).toHaveBeenCalledWith(true);
	});
});
