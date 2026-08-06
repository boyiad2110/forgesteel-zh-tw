// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { SourcebooksModal } from '@/components/modals/sourcebooks/sourcebooks-modal';
import { SourcebookType } from '@/enums/sourcebook-type';
import { FactoryLogic } from '@/logic/factory-logic';
import { Sourcebook } from '@/models/sourcebook';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { notificationError } = vi.hoisted(() => ({ notificationError: vi.fn() }));

vi.mock('antd', async () => {
	const actual = await vi.importActual<typeof import('antd')>('antd');
	return { ...actual, notification: { ...actual.notification, error: notificationError } };
});
vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveHiddenSourcebookIDs: vi.fn() }),
	useHiddenSourcebookIDs: () => []
}));
vi.mock('@/components/panels/elements/sourcebook-panel/sourcebook-panel', () => ({
	SourcebookPanel: ({ sourcebook }: { sourcebook: Sourcebook }) => <div>{sourcebook.name}</div>
}));

beforeEach(() => notificationError.mockClear());
afterEach(cleanup);

const createSourcebook = (id: string, type: SourcebookType): Sourcebook => {
	const sourcebook = FactoryLogic.createSourcebook();
	sourcebook.id = id;
	sourcebook.name = id;
	sourcebook.type = type;
	return sourcebook;
};

const renderModal = (homebrew: Sourcebook[], onHomebrewSourcebookChange = vi.fn()) => {
	const builtIn = [
		createSourcebook('core', SourcebookType.Official),
		createSourcebook('community', SourcebookType.Community),
		createSourcebook('weapons-of-legend', SourcebookType.ThirdParty)
	];

	render(
		<SourcebooksModal
			officialSourcebooks={builtIn}
			homebrewSourcebooks={homebrew}
			onClose={vi.fn()}
			onHomebrewSourcebookChange={onHomebrewSourcebookChange}
			onHomebrewSourcebookDelete={vi.fn()}
		/>
	);

	return onHomebrewSourcebookChange;
};

const uploadSourcebook = (sourcebook: unknown) => {
	const input = document.querySelector('input[type="file"]') as HTMLInputElement;
	expect(input).not.toBeNull();
	const file = new File([ JSON.stringify(sourcebook) ], 'test.drawsteel-sourcebook', { type: 'application/json' });
	fireEvent.change(input, { target: { files: [ file ] } });
};

describe('SourcebooksModal sourcebook type policy', () => {
	it('offers only the official and homebrew tabs', () => {
		renderModal([]);

		expect(screen.getByText('Official', { exact: true })).not.toBeNull();
		expect(screen.getByText('Homebrew', { exact: true })).not.toBeNull();
		expect(screen.queryByText('Third Party', { exact: true })).toBeNull();
		expect(screen.queryByText('Community', { exact: true })).toBeNull();
	});

	it('does not show community or third party records on the official tab', () => {
		renderModal([]);

		expect(screen.getByText('core', { exact: true })).not.toBeNull();
		expect(screen.queryByText('community', { exact: true })).toBeNull();
		expect(screen.queryByText('weapons-of-legend', { exact: true })).toBeNull();
	});

	it('does not show community or third party sourcebooks already in storage', () => {
		renderModal([
			createSourcebook('my-homebrew', SourcebookType.Homebrew),
			createSourcebook('stored-community', SourcebookType.Community),
			createSourcebook('stored-third-party', SourcebookType.ThirdParty)
		]);

		fireEvent.click(screen.getByText('Homebrew', { exact: true }));

		expect(screen.getByText('my-homebrew', { exact: true })).not.toBeNull();
		expect(screen.queryByText('stored-community', { exact: true })).toBeNull();
		expect(screen.queryByText('stored-third-party', { exact: true })).toBeNull();
	});

	it('imports a homebrew sourcebook', async () => {
		const onHomebrewSourcebookChange = renderModal([]);
		fireEvent.click(screen.getByText('Homebrew', { exact: true }));

		uploadSourcebook(createSourcebook('imported-homebrew', SourcebookType.Homebrew));

		await waitFor(() => expect(onHomebrewSourcebookChange).toHaveBeenCalledTimes(1));
		expect(await screen.findByText('imported-homebrew', { exact: true })).not.toBeNull();
		expect(notificationError).not.toHaveBeenCalled();
	});

	it.each([
		[ 'community', SourcebookType.Community ],
		[ 'third party', SourcebookType.ThirdParty ]
	])('does not persist an imported %s sourcebook', async (_label, type) => {
		const onHomebrewSourcebookChange = renderModal([]);
		fireEvent.click(screen.getByText('Homebrew', { exact: true }));

		uploadSourcebook(createSourcebook('imported-excluded', type));

		await waitFor(() => expect(notificationError).toHaveBeenCalledTimes(1));
		expect(onHomebrewSourcebookChange).not.toHaveBeenCalled();
		expect(screen.queryByText('imported-excluded', { exact: true })).toBeNull();
	});
});
