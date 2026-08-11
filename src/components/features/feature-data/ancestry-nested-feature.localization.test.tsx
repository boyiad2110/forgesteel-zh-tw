// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { ConfigAncestryChoice } from '@/components/features/feature-data/ancestry-choice';
import { ConfigAncestryFeatureChoice } from '@/components/features/feature-data/ancestry-feature-choice';
import { ConfigChoice } from '@/components/features/feature-data/choice';
import { InfoChoice } from '@/components/features/feature-data/choice';
import { InfoMultiple } from '@/components/features/feature-data/multiple';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { LocalizationProvider } from '@/contexts/localization-context';
import { AncestryData } from '@/data/ancestry-data';
import { FactoryLogic } from '@/logic/factory-logic';
import { Ancestry } from '@/models/ancestry';
import { Feature, FeatureAncestryChoiceData, FeatureAncestryFeatureChoiceData, FeatureChoiceData } from '@/models/feature';
import { Hero } from '@/models/hero';
import { Options } from '@/models/options';
import { Sourcebook } from '@/models/sourcebook';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions
}));
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));

class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

afterEach(cleanup);

const renderLocalized = (content: ReactNode) => render(
	<LocalizationProvider>
		<LocaleToggle />
		{content}
	</LocalizationProvider>
);

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const createHero = (): Hero => ({ ...FactoryLogic.createHero(), id: 'hero-1' });

describe('InfoChoice localization (Dwarf Runic Carving)', () => {
	it('reads option headings in zh-TW and restores canonical English on switch, while nested Feature readings stay in sync', () => {
		const runicCarving = AncestryData.dwarf.features.find(f => f.id === 'dwarf-feature-1') as Feature;
		if (runicCarving.type !== 'Choice') {
			throw new Error('dwarf-feature-1 is no longer a Choice');
		}

		renderLocalized(
			<InfoChoice
				data={runicCarving.data}
				feature={runicCarving}
				hero={createHero()}
				sourcebooks={[]}
			/>
		);

		// Expander title (bypass fixed by this batch) and the nested FeaturePanel description
		// (already localized by FeaturePanel) both read the approved zh-TW.
		expect(screen.getByText('偵測', { exact: true })).toBeTruthy();
		expect(screen.getByText('光芒', { exact: true })).toBeTruthy();
		expect(screen.getByText('傳心', { exact: true })).toBeTruthy();

		switchLocale();

		expect(screen.getByText('Detection', { exact: true })).toBeTruthy();
		expect(screen.getByText('Light', { exact: true })).toBeTruthy();
		expect(screen.getByText('Voice', { exact: true })).toBeTruthy();
		// The canonical Feature objects were never mutated by either locale.
		expect(runicCarving.data.options.map(o => o.feature.name)).toEqual([ 'Detection', 'Light', 'Voice' ]);
	});
});

describe('ConfigChoice localization (Devil ancestry trait)', () => {
	it('reads the selected summary in zh-TW and hands back the canonical Feature on select and remove', () => {
		const barbedTail = AncestryData.devil.features
			.flatMap(f => (f.type === 'Choice' ? f.data.options.map(o => o.feature) : []))
			.find(f => f.id === 'devil-feature-2-1') as Feature;

		const data: FeatureChoiceData = {
			options: [ { feature: barbedTail, value: 1 } ],
			count: 1,
			selectAt: 'build',
			selected: [ barbedTail ]
		};
		const serializedData = JSON.stringify(data);
		const setData = vi.fn();

		renderLocalized(
			<ConfigChoice
				data={data}
				feature={FactoryLogic.feature.create({ id: 'devil-feature-2', name: 'Devil Traits', description: '' })}
				hero={createHero()}
				sourcebooks={[]}
				setData={setData}
			/>
		);

		expect(screen.getByText('尖刺尾巴', { exact: true })).toBeTruthy();
		expect(screen.getByText('你那尖銳的尾巴能為所有行動錦上添花。每輪 1 次，當你發動近戰打擊時，你可以額外造成等於你最高屬性值的傷害。', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByTitle('移除'));

		expect(setData).toHaveBeenCalledTimes(1);
		const removed = setData.mock.calls[0][0] as FeatureChoiceData;
		expect(removed.selected).toEqual([]);
		expect(removed.options[0].feature.id).toBe('devil-feature-2-1');
		expect(removed.options[0].feature.name).toBe('Barbed Tail');

		switchLocale();

		expect(screen.getByText('Barbed Tail', { exact: true })).toBeTruthy();
		// The panel is controlled: its own props were never mutated by either locale.
		expect(JSON.stringify(data)).toBe(serializedData);
		expect(setData).toHaveBeenCalledTimes(1);
	});
});

describe('InfoMultiple localization (a real Multiple Feature)', () => {
	it('reads the fixed Features heading in zh-TW, localizes child Feature readings, and falls back to English', () => {
		const silverTongue = AncestryData.devil.features.find(f => f.id === 'devil-feature-1') as Feature;
		if (silverTongue.type !== 'Multiple Features') {
			throw new Error('devil-feature-1 is no longer a Multiple');
		}

		renderLocalized(
			<InfoMultiple
				data={silverTongue.data}
				feature={silverTongue}
				hero={createHero()}
				sourcebooks={[]}
			/>
		);

		expect(screen.getByText('特性', { exact: true })).toBeTruthy();

		fireEvent.click(screen.getByText('特性', { exact: true }));

		expect(screen.getAllByText('能言善道').length).toBeGreaterThan(0);

		switchLocale();

		expect(screen.getByText('Features', { exact: true })).toBeTruthy();
		// The canonical child Feature data was never mutated by either locale.
		expect(silverTongue.data.features.map(f => f.id)).toEqual([ 'devil-feature-1a', 'devil-feature-1b' ]);
	});
});

describe('ConfigAncestryChoice localization (Revenant Former Life)', () => {
	const createSourcebooks = (): Sourcebook[] => [
		{ ...FactoryLogic.createSourcebook(), id: 'sourcebook-1', ancestries: [ AncestryData.dwarf, AncestryData.devil ] }
	];

	it('reads the selector and the selected summary in zh-TW while the selected object stays the canonical Ancestry', () => {
		const data: FeatureAncestryChoiceData = { selected: AncestryData.dwarf };
		const setData = vi.fn();
		const serializedDwarf = JSON.stringify(AncestryData.dwarf);

		renderLocalized(
			<ConfigAncestryChoice
				data={data}
				feature={FactoryLogic.feature.createAncestry({ id: 'revenant-feature-1' })}
				hero={createHero()}
				sourcebooks={createSourcebooks()}
				setData={setData}
			/>
		);

		// The selected summary bypass fixed by this batch (also echoed in the select's own
		// current-value display, hence getAllByText).
		expect(screen.getAllByText('矮人').length).toBeGreaterThan(0);

		fireEvent.mouseDown(screen.getByRole('combobox'));

		expect(screen.getAllByText('矮人').length).toBeGreaterThan(0);
		expect(screen.getAllByText('魔鬼').length).toBeGreaterThan(0);

		switchLocale();

		expect(screen.getAllByText('Dwarf').length).toBeGreaterThan(0);
		// Selecting from the dropdown hands back the canonical Ancestry object, unmutated.
		expect(JSON.stringify(AncestryData.dwarf)).toBe(serializedDwarf);
	});
});

describe('ConfigAncestryFeatureChoice localization (Revenant Previous Life)', () => {
	const buildFixtureFormerAncestry = (): Ancestry => {
		const grounded = FactoryLogic.feature.create({
			id: 'dwarf-feature-2-1',
			name: 'Grounded',
			description: 'Your heavy stone body and connection to the earth make it difficult for others to move you.'
		});
		const emptyDescriptionOption = FactoryLogic.feature.createSpeed({
			id: 'fixture-empty-description',
			name: 'Fixture Empty Description',
			speed: 5
		});

		return {
			...FactoryLogic.createAncestry(),
			id: 'ancestry-former-fixture',
			name: 'Former Fixture',
			description: '',
			features: [
				FactoryLogic.feature.createChoice({
					id: 'former-fixture-choice',
					name: 'Former Fixture Choice',
					options: [
						{ feature: grounded, value: 1 },
						{ feature: emptyDescriptionOption, value: 1 }
					],
					count: 'ancestry'
				})
			]
		};
	};

	const buildHeroWithFormerAncestry = (formerAncestry: Ancestry): Hero => {
		const formerLifeSelector = FactoryLogic.feature.createAncestry({ id: 'revenant-feature-1' });
		formerLifeSelector.data.selected = formerAncestry;

		const hero = createHero();
		hero.ancestry = {
			...FactoryLogic.createAncestry(),
			id: 'ancestry-revenant-fixture',
			name: 'Revenant Fixture',
			features: [ formerLifeSelector ]
		};
		return hero;
	};

	it('reads the selector option name and non-empty description in zh-TW, keeps the FeatureType fallback canonical, and hands back the canonical Feature', () => {
		const formerAncestry = buildFixtureFormerAncestry();
		const hero = buildHeroWithFormerAncestry(formerAncestry);
		const setData = vi.fn();
		const data: FeatureAncestryFeatureChoiceData = {
			source: { current: false, former: true, customID: '' },
			value: 1,
			selected: null
		};

		renderLocalized(
			<ConfigAncestryFeatureChoice
				data={data}
				feature={FactoryLogic.feature.createAncestryFeature({ id: 'revenant-feature-4-1', current: false, former: true, customID: '', value: 1 })}
				hero={hero}
				sourcebooks={[]}
				setData={setData}
			/>
		);

		fireEvent.mouseDown(screen.getByRole('combobox'));

		// Approved zh-TW name and description for a real Ancestry nested Feature identity.
		expect(screen.getAllByText('腳踏實地').length).toBeGreaterThan(0);
		expect(screen.getAllByText('你岩石般的厚重身軀與大地緊密相連，讓他人難以移動你。').length).toBeGreaterThan(0);
		// The empty-description option still falls back to the canonical FeatureType, unaffected.
		expect(screen.getAllByText('Speed').length).toBeGreaterThan(0);

		fireEvent.click(screen.getAllByText('腳踏實地')[0]);

		expect(setData).toHaveBeenCalledTimes(1);
		const updated = setData.mock.calls[0][0] as FeatureAncestryFeatureChoiceData;
		expect(updated.selected?.id).toBe('dwarf-feature-2-1');
		expect(updated.selected?.name).toBe('Grounded');
	});
});
