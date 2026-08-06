// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { HeroSourcebooksPanel } from '@/components/panels/hero-sourcebooks/hero-sourcebooks-panel';
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
vi.mock('@/components/controls/markdown/markdown', () => ({ Markdown: ({ text }: { text: string }) => <span>{text}</span> }));

beforeEach(() => notificationError.mockClear());
afterEach(cleanup);

// The panel only lists sourcebooks that actually contain elements.
const createSourcebook = (id: string, type: SourcebookType): Sourcebook => {
	const sourcebook = FactoryLogic.createSourcebook();
	sourcebook.id = id;
	sourcebook.name = id;
	sourcebook.type = type;
	sourcebook.titles.push({ id: `${id}-title`, name: `${id} title`, description: '', echelon: 1, prerequisites: '', features: [], selectedFeatureID: '' });
	return sourcebook;
};

const renderPanel = (onImportSourcebook = vi.fn(), onChange = vi.fn()) => {
	render(
		<HeroSourcebooksPanel
			sourcebooks={[
				createSourcebook('core', SourcebookType.Official),
				createSourcebook('my-homebrew', SourcebookType.Homebrew),
				createSourcebook('community', SourcebookType.Community),
				createSourcebook('weapons-of-legend', SourcebookType.ThirdParty)
			]}
			sourcebookIDs={[ 'core', 'community' ]}
			onImportSourcebook={onImportSourcebook}
			onChange={onChange}
		/>
	);

	return { onImportSourcebook, onChange };
};

const uploadSourcebook = (sourcebook: unknown) => {
	const input = document.querySelector('input[type="file"]') as HTMLInputElement;
	expect(input).not.toBeNull();
	const file = new File([ JSON.stringify(sourcebook) ], 'test.drawsteel-sourcebook', { type: 'application/json' });
	fireEvent.change(input, { target: { files: [ file ] } });
};

describe('HeroSourcebooksPanel sourcebook type policy', () => {
	it('shows only the official and homebrew sections', () => {
		renderPanel();

		expect(screen.getByText('Official Sourcebooks', { exact: true })).not.toBeNull();
		expect(screen.getByText('Homebrew Sourcebooks', { exact: true })).not.toBeNull();
		expect(screen.queryByText('Community Sourcebooks', { exact: true })).toBeNull();
		expect(screen.queryByText('Third Party Sourcebooks', { exact: true })).toBeNull();
		expect(screen.getByText('core', { exact: true })).not.toBeNull();
		expect(screen.queryByText('community', { exact: true })).toBeNull();
		expect(screen.queryByText('weapons-of-legend', { exact: true })).toBeNull();
	});

	it('imports a homebrew sourcebook', async () => {
		const { onImportSourcebook } = renderPanel();

		uploadSourcebook(createSourcebook('imported-homebrew', SourcebookType.Homebrew));

		await waitFor(() => expect(onImportSourcebook).toHaveBeenCalledTimes(1));
		expect(notificationError).not.toHaveBeenCalled();
	});

	it.each([
		[ 'community', SourcebookType.Community ],
		[ 'third party', SourcebookType.ThirdParty ]
	])('does not persist an imported %s sourcebook', async (_label, type) => {
		const { onImportSourcebook } = renderPanel();

		uploadSourcebook(createSourcebook('imported-excluded', type));

		await waitFor(() => expect(notificationError).toHaveBeenCalledTimes(1));
		expect(onImportSourcebook).not.toHaveBeenCalled();
	});

	it('leaves the hero sourcebookIDs alone when nothing is toggled', () => {
		const { onChange } = renderPanel();

		expect(onChange).not.toHaveBeenCalled();
	});
});
