// @vitest-environment jsdom
/* eslint-disable sort-imports */

import { AppFooter, FooterParams } from '@/components/panels/app-footer/app-footer';
import { LocalizationProvider } from '@/contexts/localization-context';
import { ConnectionSettings } from '@/models/connection-settings';
import { FactoryLogic } from '@/logic/factory-logic';
import { Options } from '@/models/options';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const saveOptions = vi.fn();
let currentOptions: Options;
let isSmall = false;

vi.mock('@/contexts/data-context', () => ({
	useDataManager: () => ({ saveOptions }),
	useOptions: () => currentOptions
}));
vi.mock('@/hooks/use-is-small', () => ({ useIsSmall: () => isSmall }));
vi.mock('@/hooks/use-navigation', () => ({
	useNavigation: () => ({ goToWelcome: vi.fn(), goToHeroList: vi.fn(), goToLibrary: vi.fn(), goToSession: vi.fn() })
}));

const footerParams = {
	errorsExist: false,
	showReference: vi.fn(),
	showAbout: vi.fn(),
	showSettings: vi.fn(),
	showErrors: vi.fn(),
	connectionSettings: { dataSource: undefined } as unknown as ConnectionSettings
} as unknown as FooterParams;

// The footer sits inside the app-level LocalizationProvider in production.
const renderFooter = (page: 'welcome' | 'heroes' | 'library' | 'session' | 'player-view' | 'clocktower', params: FooterParams = footerParams) => {
	return render(
		<LocalizationProvider>
			<AppFooter page={page} hero={null} params={params} />
		</LocalizationProvider>
	);
};

// The visible action names, in the order a keyboard user reaches them.
const actionNames = () => {
	return screen.getAllByRole('button').map(button => button.getAttribute('aria-label') ?? (button.textContent ?? '').trim());
};

beforeEach(() => {
	saveOptions.mockReset();
	saveOptions.mockResolvedValue(undefined);
	currentOptions = FactoryLogic.createOptions();
	currentOptions.cookieConsent = true;
	isSmall = false;
});

afterEach(cleanup);

describe('AppFooter locale toggle', () => {
	it('shows the locale toggle first in the right-hand actions', () => {
		currentOptions.locale = 'zh-TW';

		renderFooter('welcome');

		const names = actionNames();
		const localeIndex = names.indexOf('Switch to English');

		expect(localeIndex).toBeGreaterThanOrEqual(0);
		expect(names.slice(localeIndex)).toEqual([ 'Switch to English', 'Reference', 'Settings', 'About', 'Patreon' ]);
		expect(screen.getByRole('button', { name: 'Switch to English' }).textContent).toBe('中文');
	});

	it('keeps the locale toggle in front of Reference when the errors button is present', () => {
		currentOptions.locale = 'en';

		renderFooter('heroes', { ...footerParams, errorsExist: true });

		const names = actionNames();

		expect(names.indexOf('Switch to Traditional Chinese')).toBeLessThan(names.indexOf('Reference'));
		expect(names.slice(names.indexOf('Switch to Traditional Chinese'), names.indexOf('Switch to Traditional Chinese') + 5))
			.toEqual([ 'Switch to Traditional Chinese', 'Reference', 'Settings', 'About', 'Patreon' ]);
		// The errors button keeps its existing icon-only presentation, after the other actions.
		expect(screen.getByTitle('Errors')).not.toBeNull();
	});

	it('keeps the locale label on small screens, where the other actions drop theirs', () => {
		currentOptions.locale = 'zh-TW';
		isSmall = true;

		renderFooter('heroes');

		expect(screen.getByRole('button', { name: 'Switch to English' }).textContent).toBe('中文');
		// Reference drops its label on small screens; the locale toggle keeps its own.
		expect(screen.getByTitle('Reference').textContent).toBe('');
		expect(screen.queryByRole('button', { name: 'Reference' })).toBeNull();
	});

	it('appears on every page that renders the shared footer', () => {
		currentOptions.locale = 'zh-TW';

		([ 'welcome', 'heroes', 'library', 'session', 'player-view', 'clocktower' ] as const).forEach(page => {
			renderFooter(page);
			expect(screen.getByRole('button', { name: 'Switch to English' }).textContent).toBe('中文');
			cleanup();
		});
	});
});
