// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { LocalizationProvider } from '@/contexts/localization-context';
import { LocaleToggle } from '@/components/controls/locale-toggle/locale-toggle';
import { StartSection } from '@/components/pages/heroes/hero-edit/start-section/start-section';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testOptions: Options = { ...FactoryLogic.createOptions(), locale: 'zh-TW' };
const testDataManager = { saveOptions: vi.fn().mockResolvedValue(undefined) };
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => testDataManager,
	useOptions: () => testOptions
}));

// This suite does not run with vitest globals, so the rendered tree is torn down here
// rather than by the testing library's automatic cleanup.
afterEach(cleanup);

const renderStartSection = () => {
	const { container } = render(
		<LocalizationProvider>
			<LocaleToggle />
			<StartSection
				sourcebookIDs={[]}
				sourcebooks={[]}
				setSourcebookIDs={vi.fn()}
				importSourcebook={vi.fn()}
			/>
		</LocalizationProvider>
	);

	return container;
};

const switchLocale = () => fireEvent.click(screen.getByRole('button', { name: /^Switch to / }));

// The sourcebooks panel shares the section, and has copy of its own; it is covered by its
// own suite, so everything here is read out of the instructions column alone.
const instructions = (container: HTMLElement) => {
	const column = container.querySelector('.start-section > .hero-edit-content-column');
	expect(column).not.toBeNull();
	return column as HTMLElement;
};

// The instructional copy is one sentence broken up by the elements inside it, so the
// sentence is read back off the element that holds it rather than matched as one text node.
const sentences = (container: HTMLElement) => {
	return Array.from(instructions(container).querySelectorAll('.ds-text, li')).map(element => element.textContent);
};

// What the batch is really about: the emphasis has to stay on the same terms, in the same
// kind of element, after the sentence around it is translated.
const emphasized = (element: Element | null, selector: string) => {
	expect(element).not.toBeNull();
	return Array.from((element as Element).querySelectorAll(selector)).map(match => match.textContent);
};

const listItem = (container: HTMLElement, index: number) => instructions(container).querySelectorAll('li')[index] ?? null;

const paragraphs = (container: HTMLElement) => instructions(container).querySelectorAll('.ds-text');

const introParagraph = (container: HTMLElement) => paragraphs(container)[0] ?? null;

const closingParagraph = (container: HTMLElement) => {
	const found = paragraphs(container);
	return found[found.length - 1] ?? null;
};

const approvedSentences = [
	'在 FORGE STEEL 創建英雄很簡單。',
	'使用上方分頁選擇英雄的族裔、文化、職業與範型。若還有需要選擇的項目，系統會提示你進行選擇。',
	'此外，你也可以選擇 1 個糾葛，但這不是強制的，可以直接略過。',
	'最後，前往細項分頁，為你的英雄取個名字。',
	'完成後，點擊頂部工具列的儲存變更，即可查看你的角色卡。'
];

const canonicalSentences = [
	'Creating a hero in FORGE STEEL is simple.',
	'Use the tabs above to select your hero\'s Ancestry, Culture, Career, and Class. If there are any choices to be made, you\'ll be prompted to make your selections.',
	'Optionally, you can choose a Complication - but you can skip this if you\'d prefer.',
	'Finally, go to the Details tab and give your hero a name.',
	'When you\'re done, click Save Changes in the toolbar at the top, and you\'ll see your hero sheet.'
];

describe('StartSection instructional copy', () => {
	it('draws the approved zh-TW copy, and canonical English in the English locale', () => {
		const container = renderStartSection();

		expect(screen.getByText('創建英雄')).toBeTruthy();
		expect(screen.queryByText('Creating a Hero')).toBeNull();
		expect(approvedSentences.filter(sentence => sentences(container).includes(sentence))).toEqual(approvedSentences);
		expect(canonicalSentences.filter(sentence => sentences(container).includes(sentence))).toEqual([]);

		switchLocale();

		expect(screen.getByText('Creating a Hero')).toBeTruthy();
		expect(screen.queryByText('創建英雄')).toBeNull();
		expect(canonicalSentences.filter(sentence => sentences(container).includes(sentence))).toEqual(canonicalSentences);
		expect(approvedSentences.filter(sentence => sentences(container).includes(sentence))).toEqual([]);
	});

	it('keeps the app name bold in both locales', () => {
		const container = renderStartSection();

		expect(emphasized(introParagraph(container), 'b')).toEqual([ 'FORGE STEEL' ]);

		switchLocale();

		expect(emphasized(introParagraph(container), 'b')).toEqual([ 'FORGE STEEL' ]);
	});

	it('keeps each named term in its own code element, in the list item it belongs to', () => {
		const container = renderStartSection();

		expect(emphasized(listItem(container, 0), 'code')).toEqual([ '族裔', '文化', '職業', '範型' ]);
		expect(emphasized(listItem(container, 1), 'code')).toEqual([ '糾葛' ]);
		expect(emphasized(listItem(container, 2), 'code')).toEqual([ '細項' ]);
		expect(emphasized(closingParagraph(container), 'code')).toEqual([ '儲存變更' ]);

		switchLocale();

		expect(emphasized(listItem(container, 0), 'code')).toEqual([ 'Ancestry', 'Culture', 'Career', 'Class' ]);
		expect(emphasized(listItem(container, 1), 'code')).toEqual([ 'Complication' ]);
		expect(emphasized(listItem(container, 2), 'code')).toEqual([ 'Details' ]);
		expect(emphasized(closingParagraph(container), 'code')).toEqual([ 'Save Changes' ]);
	});

	it('keeps the list structure the canonical English had', () => {
		const container = renderStartSection();

		expect(instructions(container).querySelectorAll('ul')).toHaveLength(1);
		expect(instructions(container).querySelectorAll('li')).toHaveLength(3);
		expect(paragraphs(container)).toHaveLength(2);

		switchLocale();

		expect(instructions(container).querySelectorAll('ul')).toHaveLength(1);
		expect(instructions(container).querySelectorAll('li')).toHaveLength(3);
		expect(paragraphs(container)).toHaveLength(2);
	});
});
