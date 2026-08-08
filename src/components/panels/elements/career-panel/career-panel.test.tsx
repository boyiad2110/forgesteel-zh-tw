// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { CareerPanel } from '@/components/panels/elements/career-panel/career-panel';
import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { PanelMode } from '@/enums/panel-mode';
import { FactoryLogic } from '@/logic/factory-logic';
import { Career } from '@/models/career';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text }: { text: string }) => <span>{text}</span>,
	MarkdownEditor: ({ value }: { value: string }) => <span>{value}</span>
}));

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions: vi.fn().mockResolvedValue(undefined) }),
	useOptions: () => testOptions,
	useHeroes: () => []
}));

afterEach(cleanup);

// Canonical element data: a career with one feature and two inciting incidents. None of it is
// localized by this panel.
const createTestCareer = (name: string, selectedIncidentID: string | null = null): Career => {
	const career = FactoryLogic.createCareer();
	career.id = 'test-career';
	career.name = name;
	career.description = 'Career description.';
	career.features = [
		FactoryLogic.feature.create({ id: 'career-feature', name: 'Trained Observer', description: 'A career feature.' })
	];
	career.incitingIncidents.options = [
		{ id: 'incident-1', name: 'Left For Dead', description: 'You were left for dead.' },
		{ id: 'incident-2', name: 'Sole Survivor', description: 'You alone survived.' }
	];
	career.incitingIncidents.selected = career.incitingIncidents.options.find(o => o.id === selectedIncidentID) || null;

	return career;
};

const renderPanel = (career = createTestCareer('Soldier'), mode = PanelMode.Full) => {
	const { container } = render(
		<LocalizationProvider>
			<LocaleToggle />
			<CareerPanel career={career} sourcebooks={[]} mode={mode} />
		</LocalizationProvider>
	);

	return { container, career };
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

const isDrawn = (text: string) => screen.queryAllByText(text).length > 0;

// A page is chosen by its segment, whatever that segment is labelled.
const choosePage = (label: string) => fireEvent.click(screen.getByTitle(label));

// The page the panel is on is the selected segment; its label is only how that page reads.
const currentPage = () => {
	const selected = screen.getAllByRole('radio').find(radio => (radio as HTMLInputElement).checked);
	return selected?.parentElement?.querySelector('.ant-segmented-item-label')?.getAttribute('title');
};

// The inciting incidents on screen, read as the name and description a player sees together.
const incidentRows = (container: HTMLElement) => {
	return [ ...container.querySelectorAll('.field') ].map(field => [ field.querySelector('.field-label')?.textContent, field.querySelector('.field-value')?.textContent ]);
};

describe('CareerPanel localization', () => {
	const approved = [ '概述', '特性', '關鍵事件' ];
	const canonical = [ 'Overview', 'Features', 'Inciting Incidents' ];

	it('draws the approved zh-TW page labels, and canonical English in the English locale', () => {
		renderPanel();

		expect(approved.filter(isDrawn)).toEqual(approved);
		expect(canonical.filter(isDrawn)).toEqual([]);

		switchLocale();

		expect(canonical.filter(isDrawn)).toEqual(canonical);
		expect(approved.filter(isDrawn)).toEqual([]);
	});
});

describe('CareerPanel career name', () => {
	it('draws the career\'s own name as written, in either locale', () => {
		renderPanel();

		expect(isDrawn('Soldier')).toBe(true);
		expect(isDrawn('未命名職業')).toBe(false);

		switchLocale();

		expect(isDrawn('Soldier')).toBe(true);
		expect(isDrawn('Unnamed Career')).toBe(false);
	});

	it.each([
		[ 'full', PanelMode.Full ],
		[ 'compact', PanelMode.Compact ]
	])('draws the approved zh-TW fallback for a career with no name, in %s mode', (_label, mode) => {
		renderPanel(createTestCareer(''), mode);

		expect(isDrawn('未命名職業')).toBe(true);
		expect(isDrawn('Unnamed Career')).toBe(false);

		switchLocale();

		expect(isDrawn('Unnamed Career')).toBe(true);
		expect(isDrawn('未命名職業')).toBe(false);
	});
});

describe('CareerPanel canonical page state', () => {
	it('draws the content each page always drew, whatever that page is labelled', () => {
		renderPanel();

		// Overview is where the panel starts.
		expect(isDrawn('Career description.')).toBe(true);

		choosePage('特性');
		expect(isDrawn('Trained Observer')).toBe(true);
		expect(isDrawn('Career description.')).toBe(false);

		choosePage('關鍵事件');
		expect(isDrawn('Left For Dead')).toBe(true);
		expect(isDrawn('Trained Observer')).toBe(false);

		choosePage('概述');
		expect(isDrawn('Career description.')).toBe(true);
	});

	it('reaches the same content from the English labels', () => {
		renderPanel();

		switchLocale();

		choosePage('Features');
		expect(isDrawn('Trained Observer')).toBe(true);

		choosePage('Inciting Incidents');
		expect(isDrawn('Left For Dead')).toBe(true);

		choosePage('Overview');
		expect(isDrawn('Career description.')).toBe(true);
	});

	it('stays on the same page when the locale is switched, changing only its label', () => {
		renderPanel();

		choosePage('特性');

		expect(currentPage()).toBe('特性');
		expect(isDrawn('Trained Observer')).toBe(true);

		switchLocale();

		// The page the panel is on is a canonical value, so it survives the label changing.
		expect(currentPage()).toBe('Features');
		expect(isDrawn('Trained Observer')).toBe(true);
		expect(isDrawn('Career description.')).toBe(false);
	});
});

describe('CareerPanel inciting incidents', () => {
	it('draws every incident option as written, in either locale', () => {
		const { container, career } = renderPanel();
		const careerBefore = JSON.stringify(career);

		choosePage('關鍵事件');

		const expected = [
			[ 'Left For Dead', 'You were left for dead.' ],
			[ 'Sole Survivor', 'You alone survived.' ]
		];
		expect(incidentRows(container)).toEqual(expected);

		switchLocale();

		expect(incidentRows(container)).toEqual(expected);
		// Presentation only: the career the panel was handed is untouched.
		expect(JSON.stringify(career)).toBe(careerBefore);
	});

	it('draws the chosen incident as written, in either locale', () => {
		const { container } = renderPanel(createTestCareer('Soldier', 'incident-2'));

		choosePage('關鍵事件');

		expect(incidentRows(container)).toEqual([ [ 'Sole Survivor', 'You alone survived.' ] ]);

		switchLocale();

		expect(incidentRows(container)).toEqual([ [ 'Sole Survivor', 'You alone survived.' ] ]);
	});
});
