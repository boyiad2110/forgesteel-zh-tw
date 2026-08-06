// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { SourcebookPanel } from '@/components/panels/elements/sourcebook-panel/sourcebook-panel';
import { HeroesContext } from '@/contexts/data-context';
import { SourcebookType } from '@/enums/sourcebook-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { Hero } from '@/models/hero';
import { Sourcebook } from '@/models/sourcebook';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/controls/markdown/markdown', () => ({
	Markdown: ({ text }: { text: string }) => <span>{text}</span>,
	MarkdownEditor: ({ value }: { value: string }) => <span>{value}</span>
}));

// The antd Popover that backs DangerButton needs ResizeObserver, which jsdom does not provide.
globalThis.ResizeObserver = class {
	observe = () => undefined;
	unobserve = () => undefined;
	disconnect = () => undefined;
};

afterEach(cleanup);

const createSourcebook = (id: string, type: SourcebookType): Sourcebook => {
	const sourcebook = FactoryLogic.createSourcebook();
	sourcebook.id = id;
	sourcebook.name = id;
	sourcebook.type = type;
	return sourcebook;
};

const addTitle = (sourcebook: Sourcebook, id: string, name: string) => {
	sourcebook.titles.push({ id: id, name: name, description: '', echelon: 1, prerequisites: '', features: [], selectedFeatureID: '' });
	return sourcebook;
};

const createHero = (id: string, name: string, sourcebookIDs: string[]): Hero => {
	const hero = FactoryLogic.createHero();
	hero.id = id;
	hero.name = name;
	hero.sourcebookIDs = sourcebookIDs;
	return hero;
};

// An adventure in another sourcebook that references an element by ID is what
// SourcebookLogic.getUsedIn() reports as an external usage.
const createAdventureUsing = (id: string, name: string, elementID: string) => {
	const adventure = FactoryLogic.createAdventure();
	adventure.id = id;
	adventure.name = name;
	adventure.plot.content.push({ id: `${id}-ref`, contentType: 'reference', type: 'title', contentID: elementID });
	return adventure;
};

const renderPanel = (sourcebook: Sourcebook, sourcebooks: Sourcebook[], heroes: Hero[]) => {
	const onDelete = vi.fn();

	render(
		<HeroesContext value={heroes}>
			<SourcebookPanel
				sourcebook={sourcebook}
				sourcebooks={sourcebooks}
				showEditButtons={true}
				onChange={vi.fn()}
				onDelete={onDelete}
			/>
		</HeroesContext>
	);

	return onDelete;
};

const clickDeleteControl = () => fireEvent.click(screen.getByTitle('Delete'));

// The popover message and the confirmation button live in the same flex container.
const findPopoverContent = async (matcher: RegExp) => {
	const message = await screen.findByText(matcher);
	return message.parentElement as HTMLElement;
};

describe('SourcebookPanel delete control', () => {
	it('deletes an unreferenced homebrew sourcebook', async () => {
		const homebrew = addTitle(createSourcebook('my-homebrew', SourcebookType.Homebrew), 'crown', 'Ancient Crown');
		const onDelete = renderPanel(homebrew, [ homebrew, createSourcebook('core', SourcebookType.Official) ], []);

		clickDeleteControl();

		const popover = await findPopoverContent(/This can't be undone/);
		fireEvent.click(within(popover).getByRole('button', { name: 'Delete' }));

		expect(onDelete).toHaveBeenCalledTimes(1);
		expect(onDelete).toHaveBeenCalledWith(homebrew);
	});

	it('blocks deletion of a homebrew sourcebook used by a hero', async () => {
		const homebrew = createSourcebook('my-homebrew', SourcebookType.Homebrew);
		const hero = createHero('hero-1', 'Kalyx', [ 'core', 'my-homebrew' ]);
		const onDelete = renderPanel(homebrew, [ homebrew ], [ hero ]);

		clickDeleteControl();

		const popover = await findPopoverContent(/Cannot delete this sourcebook/);
		expect(within(popover).getByText('Kalyx uses this sourcebook')).not.toBeNull();
		expect(within(popover).queryByRole('button')).toBeNull();
		expect(onDelete).not.toHaveBeenCalled();
	});

	it('blocks deletion of a homebrew sourcebook whose element is used elsewhere', async () => {
		const homebrew = addTitle(createSourcebook('my-homebrew', SourcebookType.Homebrew), 'crown', 'Ancient Crown');
		const other = createSourcebook('other-homebrew', SourcebookType.Homebrew);
		other.adventures.push(createAdventureUsing('vault', 'The Lost Vault', 'crown'));
		const onDelete = renderPanel(homebrew, [ homebrew, other ], []);

		clickDeleteControl();

		const popover = await findPopoverContent(/Cannot delete this sourcebook/);
		expect(within(popover).getByText('Ancient Crown')).not.toBeNull();
		expect(within(popover).getByText('The Lost Vault')).not.toBeNull();
		expect(within(popover).getByText(/is used in/)).not.toBeNull();
		expect(within(popover).queryByRole('button')).toBeNull();
		expect(onDelete).not.toHaveBeenCalled();
	});

	it('does not offer homebrew controls for an official sourcebook', () => {
		const official = addTitle(createSourcebook('core', SourcebookType.Official), 'crown', 'Ancient Crown');
		renderPanel(official, [ official ], []);

		expect(screen.queryByTitle('Delete')).toBeNull();
		expect(screen.queryByTitle('Edit')).toBeNull();
		expect(screen.queryByTitle('Export')).toBeNull();
	});
});
