// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { FeatureConfigPanel, SelectionBox } from '@/components/panels/feature-config-panel/feature-config-panel';
import { EnvironmentData } from '@/data/culture-data';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions
}));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));
// The per-feature configuration UI is exercised by its own suite; here the panel around it
// is what is under test.
vi.mock('@/components/features/feature', () => ({ ConfigFeature: () => null }));

afterEach(cleanup);

const renderLocalized = (content: ReactNode) => render(
	<LocalizationProvider>
		<LocaleToggle />
		{content}
	</LocalizationProvider>
);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

describe('FeatureConfigPanel localization', () => {
	it('reads the unnamed fallback and the auto-calculate tooltip, and restores the canonical English', () => {
		const hero = FactoryLogic.createHero();
		hero.class = FactoryLogic.createClass();
		hero.class.level = 4;
		// A description the auto-calculation rewrites, so the control is offered at all.
		const feature = FactoryLogic.feature.create({
			id: 'unnamed-feature',
			name: '',
			description: 'The target takes damage equal to your level.'
		});
		const serializedFeature = JSON.stringify(feature);
		const serializedHero = JSON.stringify(hero);

		renderLocalized(
			<FeatureConfigPanel
				feature={feature}
				hero={hero}
				sourcebooks={[]}
				setData={vi.fn()}
			/>
		);

		expect(screen.getByText('未命名特性', { exact: true })).toBeTruthy();
		expect(screen.getByTitle('自動計算傷害、效力等數值')).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Unnamed Feature', { exact: true })).toBeTruthy();
		expect(screen.getByTitle('Auto-calculate damage, potency, etc')).toBeTruthy();
		expect(JSON.stringify(feature)).toBe(serializedFeature);
		expect(JSON.stringify(hero)).toBe(serializedHero);
	});

	it('leaves the auto-calculate control doing exactly what it did, in either locale', () => {
		const hero = FactoryLogic.createHero();
		hero.class = FactoryLogic.createClass();
		hero.class.level = 4;
		const feature = FactoryLogic.feature.create({
			id: 'auto-calc-feature',
			name: 'Auto Calc Feature',
			description: 'The target takes damage equal to your level.'
		});

		renderLocalized(
			<FeatureConfigPanel
				feature={feature}
				hero={hero}
				sourcebooks={[]}
				setData={vi.fn()}
			/>
		);

		expect(screen.getByText('The target takes damage equal to 4.', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByTitle('自動計算傷害、效力等數值'));

		expect(screen.getByText('The target takes damage equal to your level.', { exact: true })).toBeTruthy();

		switchLocale();

		// The toggle keeps its state across the locale switch, and the calculation is the same.
		expect(screen.getByText('The target takes damage equal to your level.', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByTitle('Auto-calculate damage, potency, etc'));

		expect(screen.getByText('The target takes damage equal to 4.', { exact: true })).toBeTruthy();
		expect(feature.description).toBe('The target takes damage equal to your level.');
	});

	it('shows the approved zh-TW name and description for a real Culture Aspect Feature, and canonical English after switching locale', () => {
		// A real production Feature, taken directly from EnvironmentData rather than
		// constructed for the test, so the identity the resolver sees is the one the app
		// actually renders.
		const nomadic = EnvironmentData.nomadic;
		const hero = FactoryLogic.createHero();
		const serializedFeature = JSON.stringify(nomadic);
		const approvedDescription = '從 Exploration 技能或 Interpersonal 技能中選擇 1 項技能。';
		const canonicalDescription = nomadic.description;

		renderLocalized(
			<FeatureConfigPanel
				feature={nomadic}
				hero={hero}
				sourcebooks={[]}
				setData={vi.fn()}
			/>
		);

		expect(screen.getByText('遊牧', { exact: true })).toBeTruthy();
		expect(screen.getByText(approvedDescription, { exact: true })).toBeTruthy();
		expect(screen.queryByText('Nomadic', { exact: true })).toBeNull();
		expect(screen.queryByText(canonicalDescription, { exact: true })).toBeNull();

		switchLocale();

		expect(screen.getByText('Nomadic', { exact: true })).toBeTruthy();
		expect(screen.getByText(canonicalDescription, { exact: true })).toBeTruthy();
		expect(screen.queryByText('遊牧', { exact: true })).toBeNull();
		expect(screen.queryByText(approvedDescription, { exact: true })).toBeNull();
		expect(JSON.stringify(nomadic)).toBe(serializedFeature);
	});
});

describe('SelectionBox localization', () => {
	it('reads its two controls, still invokes the same callbacks, and fires nothing on a locale switch', () => {
		const onSelect = vi.fn();
		const onRemove = vi.fn();

		renderLocalized(
			<SelectionBox
				content={<span>Canonical selection content</span>}
				onSelect={onSelect}
				onRemove={onRemove}
			/>
		);

		fireEvent.click(screen.getByTitle('查看詳細資訊'));
		fireEvent.click(screen.getByTitle('移除'));

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith();
		expect(onRemove).toHaveBeenCalledTimes(1);
		expect(onRemove).toHaveBeenCalledWith();

		switchLocale();

		// Switching locale is a presentation change: it invokes neither callback.
		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onRemove).toHaveBeenCalledTimes(1);
		expect(screen.getByTitle('Show details')).toBeTruthy();
		expect(screen.getByTitle('Remove')).toBeTruthy();
		// The content the box was given is passed through untouched in either locale.
		expect(screen.getByText('Canonical selection content', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByTitle('Show details'));
		fireEvent.click(screen.getByTitle('Remove'));

		expect(onSelect).toHaveBeenCalledTimes(2);
		expect(onRemove).toHaveBeenCalledTimes(2);
	});

	it('draws only the controls it was given a callback for', () => {
		renderLocalized(<SelectionBox content={<span>Read only</span>} />);

		expect(screen.queryByTitle('查看詳細資訊')).toBeNull();
		expect(screen.queryByTitle('移除')).toBeNull();
	});
});
